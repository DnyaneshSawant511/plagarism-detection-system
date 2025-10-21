import re
import ast
import difflib
import math
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer

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
# Similarity Measures
# ---------------------------
def cosine_similarity(text1, text2):
    vectorizer = CountVectorizer().fit([text1, text2])
    vectors = vectorizer.transform([text1, text2]).toarray()
    dot_product = sum(a*b for a, b in zip(vectors[0], vectors[1]))
    magnitude = math.sqrt(sum(a*a for a in vectors[0])) * math.sqrt(sum(b*b for b in vectors[1]))
    return (dot_product / magnitude) * 100 if magnitude else 0


def cosine_tfidf_similarity(text1, text2):
    vectorizer = TfidfVectorizer().fit([text1, text2])
    vectors = vectorizer.transform([text1, text2]).toarray()
    dot_product = sum(a*b for a, b in zip(vectors[0], vectors[1]))
    magnitude = math.sqrt(sum(a*a for a in vectors[0])) * math.sqrt(sum(b*b for b in vectors[1]))
    return (dot_product / magnitude) * 100 if magnitude else 0


def jaccard_similarity(text1, text2):
    set1, set2 = set(text1.split()), set(text2.split())
    return (len(set1 & set2) / len(set1 | set2)) * 100 if set1 | set2 else 0


def levenshtein_ratio(text1, text2):
    return difflib.SequenceMatcher(None, text1, text2).ratio() * 100


def ast_similarity(raw1, raw2):
    try:
        tree1, tree2 = ast.dump(ast.parse(raw1)), ast.dump(ast.parse(raw2))
        return difflib.SequenceMatcher(None, tree1, tree2).ratio() * 100
    except Exception:
        return 0


# ---------------------------
# Core Comparison
# ---------------------------
def compare_texts(raw1, raw2):
    norm1, norm2 = normalize_code(raw1), normalize_code(raw2)

    results = {
        "Cosine": cosine_similarity(norm1, norm2),
        "TFIDF Cosine": cosine_tfidf_similarity(norm1, norm2),
        #"Jaccard": jaccard_similarity(norm1, norm2),
        "Levenshtein": levenshtein_ratio(norm1, norm2),
        "AST": ast_similarity(raw1, raw2),
    }
    #results["Final Score"] = max(results.values())
    final_score = (
        0.30 * results["Cosine"]
        + 0.30 * results["TFIDF Cosine"]
        + 0.25 * results["Levenshtein"]
        + 0.15 * results["AST"]
    )
    results["Final Score"] = final_score
    return results