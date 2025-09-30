from flask import Flask, request, jsonify
from similarity import compare_texts
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/compare", methods=["POST"])
def compare():
    data = request.get_json()
    code1 = data.get("code1", "")
    code2 = data.get("code2", "")

    if not code1 or not code2:
        return jsonify({"error": "Both code1 and code2 are required"}), 400

    results = compare_texts(code1, code2)

    # Print all metrics in backend terminal
    print("---- Similarity Metrics ----")
    for k, v in results.items():
        print(f"{k}: {v:.2f}%")

    # Return only the final score to client
    return jsonify({"final_score": results["Final Score"]})


if __name__ == "__main__":
    app.run(debug=True, port=5001)