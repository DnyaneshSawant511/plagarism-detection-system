from flask import Flask, request, jsonify
from similarity import compare_texts
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

import pickle
import numpy as np

with open("svm_plagiarism_model.pkl", "rb") as f:
    model_data = pickle.load(f)

scaler = model_data["scaler"]
svm_model = model_data["model"]

# @app.route("/compare", methods=["POST"])
# def compare():
#     data = request.get_json()
#     code1 = data.get("code1", "")
#     code2 = data.get("code2", "")

#     if not code1 or not code2:
#         return jsonify({"error": "Both code1 and code2 are required"}), 400

#     results = compare_texts(code1, code2)

#     # Print all metrics in backend terminal
#     print("---- Similarity Metrics ----")
#     for k, v in results.items():
#         print(f"{k}: {v:.2f}%")

#     # Return only the final score to client
#     return jsonify({"final_score": results["Final Score"]})

import re

def normalize_code(code, return_tokens=False):
    code = re.sub(r'#.*', '', code)
    code = re.sub(r'""".*?"""', '', code, flags=re.S)
    code = re.sub(r"'''.*?'''", '', code, flags=re.S)

    code = re.sub(r'\d+', 'NUM', code)
    code = re.sub(r'".*?"', 'STR', code)
    code = re.sub(r"'.*?'", 'STR', code)

    tokens = re.findall(r'[A-Za-z_]\w*|\d+|==|!=|<=|>=|[^\s]', code)

    identifiers = {}
    normalized_tokens = []
    id_count = 0
    keywords = {
        "if", "else", "for", "while", "return", "def", "class", "import",
        "from", "with", "try", "except", "as", "in", "and", "or", "not",
        "is", "None", "True", "False", "print", "break", "continue", "pass"
    }
    for tok in tokens:
        if re.match(r'^[A-Za-z_]\w*$', tok) and tok not in keywords:
            if tok not in identifiers:
                id_count += 1
                identifiers[tok] = f"ID_{id_count}"
            normalized_tokens.append(identifiers[tok])
        else:
            normalized_tokens.append(tok)

    return " ".join(normalized_tokens) if not return_tokens else normalized_tokens

def jaccard_similarity(text1, text2):
    set1, set2 = set(text1.split()), set(text2.split())
    return (len(set1 & set2) / len(set1 | set2)) * 100 if set1 | set2 else 0

@app.route("/compare", methods=["POST"])
def compare():
    data = request.get_json()
    code1 = data.get("code1", "")
    code2 = data.get("code2", "")

    if not code1 or not code2:
        return jsonify({"error": "Both code1 and code2 are required"}), 400

    # ---- Classical Similarity Metrics ----
    results = compare_texts(code1, code2)

    # Extract the features in SAME ORDER as training
    ast_sim = results["AST"]
    cosine = results["Cosine"]
    tfidf = results["TFIDF Cosine"]
    lev = results["Levenshtein"]

    jaccard = jaccard_similarity(normalize_code(code1), normalize_code(code2))

    feature_vector = np.array([[ast_sim, cosine, tfidf, jaccard, lev]])
    feature_scaled = scaler.transform(feature_vector)

    ml_pred = int(svm_model.predict(feature_scaled)[0])

    # ---- Print backend logs ----
    print("---- Similarity Metrics ----")
    for k, v in results.items():
        print(f"{k}: {v:.2f}%")

    print(f"ML Prediction: {ml_pred}")

    # Return score + ML prediction
    return jsonify({
        "metrics": {
            "AST": ast_sim,
            "Cosine": cosine,
            "TFIDF": tfidf,
            "Levenshtein": lev,
            "Jaccard": jaccard,
        },
        "final_score": results["Final Score"],
        "ml_prediction": ml_pred
    })


if __name__ == "__main__":
    app.run(debug=True, port=5001)