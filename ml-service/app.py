from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from scipy.sparse import csr_matrix
from implicit.als import AlternatingLeastSquares
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient

# ---------------- Flask Setup ----------------
app = Flask(__name__)
CORS(app)

# ---------------- Globals ----------------
# MONGODB_URI = <.....>
client = MongoClient(MONGODB_URI)
db = client["test"]  # your database name in MongoDB Atlas

cf_model = None
interaction_matrix = None
user_mapping = {}
service_mapping = {}
service_embeddings = None
top_n = 5
tfidf_vectorizer = None

# ---------------- Load Data from DB ----------------
def load_data():
    global interaction_matrix, user_mapping, service_mapping, service_embeddings, cf_model, tfidf_vectorizer
    
    # Fetch users and services
    users = list(db.users.find({}, {"_id": 1}))
    services = list(db.services.find({}, {"_id": 1, "title": 1, "description": 1, "averageRating": 1}))

    user_ids = [str(u["_id"]) for u in users]
    service_ids = [str(s["_id"]) for s in services]

    # Mappings
    user_mapping.update({uid: idx for idx, uid in enumerate(user_ids)})
    service_mapping.update({idx: {"id": sid, "title": s.get("title", "")} for idx, (sid, s) in enumerate(zip(service_ids, services))})

    # Build interaction matrix from bookings
    bookings = list(db.bookings.find({}, {"customer": 1, "service": 1}))
    rows, cols, data = [], [], []
    for b in bookings:
        u_id = str(b["customer"])
        s_id = str(b["service"])
        if u_id in user_mapping and s_id in [service_mapping[i]["id"] for i in service_mapping]:
            rows.append(user_mapping[u_id])
            # find index of service
            s_idx = next(i for i, s in service_mapping.items() if s["id"] == s_id)
            cols.append(s_idx)
            data.append(1)  # implicit feedback

    interaction_matrix = csr_matrix((data, (rows, cols)), shape=(len(user_ids), len(service_ids)))

    # Train CF model
    cf_model = AlternatingLeastSquares(factors=20, regularization=0.1, iterations=15)
    if interaction_matrix.shape[0] > 0 and interaction_matrix.shape[1] > 0:
        cf_model.fit(interaction_matrix.T)  # items x users

    # Build content embeddings (TF-IDF) for service descriptions
    descriptions = [s.get("description", "") for s in services]
    tfidf_vectorizer = TfidfVectorizer(max_features=100)
    service_embeddings = tfidf_vectorizer.fit_transform(descriptions).toarray()

# ---------------- Recommendation Functions ----------------
def recommend_cf(user_id):
    if user_id not in user_mapping:
        return []
    user_idx = user_mapping[user_id]
    if interaction_matrix.shape[0] == 0:
        return []
    try:
        scores = cf_model.recommend(
            user_idx,
            interaction_matrix.T.tocsr(),
            N=top_n,
            filter_already_liked_items=True
        )
        recommended_indices = [i for i, score in scores]
        return [service_mapping[i]["title"] for i in recommended_indices]
    except Exception:
        return []

# def recommend_content():
#     sim_matrix = cosine_similarity(service_embeddings)
#     avg_sim = sim_matrix.mean(axis=1)
#     top_idx = avg_sim.argsort()[::-1][:top_n]
#     return [service_mapping[i]["title"] for i in top_idx]

def recommend_content():
    # cosine similarity between services
    sim_matrix = cosine_similarity(service_embeddings)

    # similarity score
    sim_score = sim_matrix.mean(axis=1)

    # rating boost (default rating = 3)
    ratings = np.array([
        service_mapping[i].get("rating", 3)
        for i in service_mapping
    ])

    # weighted final score
    final_score = (0.7 * sim_score) + (0.3 * ratings)

    top_idx = final_score.argsort()[::-1][:top_n]
    return [service_mapping[i]["title"] for i in top_idx]


def get_popular_services():
    service_popularity = np.array(interaction_matrix.sum(axis=0)).flatten()
    top_idx = service_popularity.argsort()[::-1][:top_n]
    return [service_mapping[i]["title"] for i in top_idx]

def recommend_services(user_id):
    recommendations = recommend_cf(user_id)
    if not recommendations:
        recommendations = recommend_content()
    if not recommendations:
        recommendations = get_popular_services()
    # Deduplicate and limit
    seen = set()
    final_recs = []
    for r in recommendations:
        if r not in seen:
            final_recs.append(r)
            seen.add(r)
        if len(final_recs) >= top_n:
            break
    return final_recs

# ---------------- Routes ----------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ML service running"}), 200

@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.json
    user_id = data.get("userId")
    if not user_id:
        return jsonify({"error": "userId is required"}), 400

    if cf_model is None:
        load_data()

    recommendations = recommend_services(user_id)
    return jsonify({"recommendations": recommendations})

# ---------------- Run ----------------
if __name__ == "__main__":
    print("🚀 Starting ML Service...")
    app.run(host="0.0.0.0", port=5001, debug=True)





















