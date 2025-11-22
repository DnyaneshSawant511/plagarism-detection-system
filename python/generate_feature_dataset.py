import os
import re
import ast
import difflib
import math
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from tqdm import tqdm

# ---------------------------
# Normalization
# ---------------------------
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


# ---------------------------
# Similarity Metrics
# ---------------------------
def cosine_similarity(text1, text2):
    vectorizer = CountVectorizer().fit([text1, text2])
    vectors = vectorizer.transform([text1, text2]).toarray()
    dot = sum(a*b for a, b in zip(vectors[0], vectors[1]))
    mag = math.sqrt(sum(a*a for a in vectors[0])) * math.sqrt(sum(b*b for b in vectors[1]))
    return (dot / mag) * 100 if mag else 0

def cosine_tfidf_similarity(text1, text2):
    vectorizer = TfidfVectorizer().fit([text1, text2])
    vectors = vectorizer.transform([text1, text2]).toarray()
    dot = sum(a*b for a, b in zip(vectors[0], vectors[1]))
    mag = math.sqrt(sum(a*a for a in vectors[0])) * math.sqrt(sum(b*b for b in vectors[1]))
    return (dot / mag) * 100 if mag else 0

def jaccard_similarity(text1, text2):
    set1, set2 = set(text1.split()), set(text2.split())
    return (len(set1 & set2) / len(set1 | set2)) * 100 if (set1 | set2) else 0

def levenshtein_ratio(text1, text2):
    return difflib.SequenceMatcher(None, text1, text2).ratio() * 100

def ast_similarity(raw1, raw2):
    try:
        tree1, tree2 = ast.dump(ast.parse(raw1)), ast.dump(ast.parse(raw2))
        return difflib.SequenceMatcher(None, tree1, tree2).ratio() * 100
    except Exception:
        return 0


# ---------------------------
# Main Dataset Generation
# ---------------------------
def build_feature_dataset(base_dir="archive (1)", csv_name="cheating_dataset.csv", output_csv="cheating_features.csv"):
    csv_path = os.path.join(base_dir, csv_name)
    df = pd.read_csv(csv_path)

    # Cache normalized and raw code for reuse
    normalized_cache = {}
    raw_cache = {}

    def get_code(filepath):
        """Read file and cache its raw and normalized version"""
        if filepath not in raw_cache:
            full_path = os.path.join(base_dir, filepath)
            with open(full_path, 'r', encoding='utf-8') as f:
                raw_code = f.read()
            raw_cache[filepath] = raw_code
            normalized_cache[filepath] = normalize_code(raw_code)
        return raw_cache[filepath], normalized_cache[filepath]

    # Prepare storage for features
    features = []

    for _, row in tqdm(df.iterrows(), total=len(df), desc="Computing features"):
        f1, f2, label = row['File_1'], row['File_2'], row['Label']

        raw1, norm1 = get_code(f1)
        raw2, norm2 = get_code(f2)

        # Compute metrics
        ast_sim = ast_similarity(raw1, raw2)
        cos_count = cosine_similarity(norm1, norm2)
        cos_tfidf = cosine_tfidf_similarity(norm1, norm2)
        jaccard = jaccard_similarity(norm1, norm2)
        levenshtein = levenshtein_ratio(norm1, norm2)

        features.append({
            "File_1": f1,
            "File_2": f2,
            "Label": label,
            "AST_Similarity": ast_sim,
            "Cosine_Count": cos_count,
            "Cosine_TFIDF": cos_tfidf,
            "Jaccard": jaccard,
            "Levenshtein": levenshtein
        })

    feature_df = pd.DataFrame(features)
    output_path = os.path.join(base_dir, output_csv)
    feature_df.to_csv(output_path, index=False)
    print(f"\n Feature dataset saved to: {output_path}")
    print(feature_df.head())

    return feature_df


if __name__ == "__main__":
    build_feature_dataset()
