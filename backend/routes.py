from flask import Flask, request, jsonify
from flask_cors import CORS
import chromadb
import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials
from functools import wraps
import ast
from recommendation_system import BookRecommendationSystem

app = Flask(__name__)

# Configure CORS properly
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ["http://localhost:5173"],  # Replace with your frontend URL
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
        }
    },
)

# Initialize Firebase Admin SDK
cred = credentials.Certificate(
    "D:\\CITL project\\library-management\\backend\\serviceAccountKey.json"
)
firebase_admin.initialize_app(cred)

# Initialize ChromaDB Client
client = chromadb.PersistentClient(
    path="D:\\CITL project\\library-management\\backend\\db_storage"
)

try:
    collection = client.get_collection("books")
except chromadb.errors.InvalidCollectionException:
    collection = client.create_collection(
        name="books", metadata={"description": "Books collection"}
    )


def verify_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == "OPTIONS":
            return jsonify({"status": "OK"}), 200

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Invalid authorization header"}), 401

        token = auth_header.split("Bearer ")[1]
        try:
            decoded_token = firebase_auth.verify_id_token(token)
            request.user = decoded_token
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": f"Invalid token: {str(e)}"}), 401

    return decorated_function


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"}), 200


@app.route("/api/login", methods=["POST", "OPTIONS"])
@verify_token
def google_auth():
    if request.method == "OPTIONS":
        return jsonify({"status": "OK"}), 200

    try:
        # Get user data from the request
        user_data = request.json.get("user")
        if not user_data:
            return jsonify({"error": "User data is missing"}), 400

        uid = user_data.get("uid")
        email = user_data.get("email")
        name = user_data.get("displayName")
        photo_url = user_data.get("photoURL")

        # Verify if the token UID matches the provided UID
        if uid != request.user["uid"]:
            return jsonify({"error": "User ID mismatch"}), 401

        # Store user in ChromaDB if not exists
        try:
            existing_user = collection.get(where={"uid": uid})
            if not existing_user["ids"]:
                collection.add(
                    documents=[str(user_data)],
                    metadatas=[
                        {
                            "uid": uid,
                            "email": email,
                            "name": name,
                            "photo_url": photo_url,
                        }
                    ],
                    ids=[uid],
                )
        except Exception as e:
            print(f"ChromaDB operation failed: {e}")
            pass

        return (
            jsonify({"uid": uid, "email": email, "name": name, "photo_url": photo_url}),
            200,
        )

    except Exception as e:
        print(f"Exception occurred during login: {e}")
        return jsonify({"error": "Login failed"}), 401


# Add this new endpoint to routes.py
@app.route("/api/book_details/<title>", methods=["GET"])
def get_book_details_by_title(title):
    try:
        print(f"Fetching details for book title: {title}")  # Debugging statement

        # Query the collection using the title
        results = collection.query(
            query_texts=[title], n_results=1, include=["documents", "metadatas"]
        )

        if not results["documents"][0]:
            return jsonify({"error": "Book not found"}), 404

        # Get the first result since we're looking for an exact match
        metadata = results["metadatas"][0][0]

        # Format the response
        book_details = {
            "title": results["documents"][0][0],
            "author": metadata.get("author", ""),
            "num_pages": metadata.get("num_pages", ""),
            "cover_image_uri": metadata.get("cover_image_uri", ""),
            "book_details": metadata.get("book_details", ""),
            "genre": metadata.get("genres", ""),
            "available": metadata.get("available", True),
        }

        print(f"Book details fetched: {book_details}")  # Debugging statement
        return jsonify(book_details), 200

    except Exception as e:
        print(f"Error fetching book details: {e}")
        return jsonify({"error": "Failed to fetch book details"}), 500


# Add this to your existing routes.py

recommendation_system = BookRecommendationSystem(collection)

@app.route("/api/recommendations", methods=["GET"])
def get_recommendations():
    try:
        # For testing, use a fixed user ID
        user_id = "test_user"
        recommendations = recommendation_system.generate_recommendations(user_id)
        
        return jsonify({
            "recommendations": recommendations
        }), 200
        
    except Exception as e:
        print(f"Error getting recommendations: {e}")
        return jsonify({"error": "Failed to fetch recommendations"}), 500

@app.route("/api/search", methods=["GET"])
def search_books():
    try:
        query = request.args.get("q", "").strip()
        n_results = int(request.args.get("limit", 10))
        # For testing, use a fixed user ID
        user_id = "test_user"

        if not query:
            return jsonify({"results": []}), 200

        books = recommendation_system.search_books(user_id, query, n_results)
        return jsonify({"results": books}), 200

    except Exception as e:
        print(f"Search error: {e}")
        return jsonify({"error": "Search failed"}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
