from flask import Flask, request, jsonify
from flask_cors import CORS
import chromadb.errors
from chromadb import PersistentClient
import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials
from functools import wraps
import ast
from recommendation_system import BookRecommendationSystem
from difflib import get_close_matches
from urllib.parse import unquote
import logging

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
client = PersistentClient(
    path="D:\\CITL project\\library-management\\backend\\db_storage"
)

try:
    collection = client.get_collection("books")
except chromadb.errors.InvalidCollectionException:
    collection = client.create_collection(
        name="books", metadata={"description": "Books collection"}
    )

# Initialize recommendation system
recommendation_system = BookRecommendationSystem(collection)

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


@app.route("/api/login", methods=["POST"])
def login():
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Authorization header is required"}), 401

        id_token = auth_header.split(" ")[1]
        decoded_token = firebase_auth.verify_id_token(id_token)
        user_id = decoded_token["uid"]

        # Debugging: Print the decoded token and user ID
        print(f"Decoded token: {decoded_token}")
        print(f"User ID: {user_id}")

        # You can add additional logic here, such as creating a user in your database

        return jsonify({"message": "Login successful", "user_id": user_id}), 200
    except Exception as e:
        print(f"Error during login: {e}")
        return jsonify({"error": "Failed to log in"}), 500


try:
    books_collection = client.get_collection("books")
except chromadb.errors.InvalidCollectionException:
    print("Error: Books collection not found. Please run database.py first.")


@app.route("/api/book_details/<book_title>", methods=["GET"])
def get_book_details(book_title):
    try:
        # Decode URL-encoded characters
        decoded_title = unquote(book_title)
        print(f"Fetching details for book title: {decoded_title}")  # Debugging statement

        # Fetch results from the database
        results = collection.query(
            query_texts=[decoded_title],
            n_results= 200,  # Fetch more results to find the exact match or close matches
            include=['documents', 'metadatas']  # Correct include items
        )

        if not results['documents'][0]:
            return jsonify({"error": "Book not found"}), 404

        # Print all titles fetched from the collection
        titles_from_results = [title for title in results['documents'][0]]
        print(f"Titles fetched from database: {titles_from_results}")  # Debugging

        # Use get_close_matches to find the closest match from the query results
        closest_match = get_close_matches(decoded_title, titles_from_results, n=1, cutoff=0.6)
        print(f"Closest match found: {closest_match}")  # Debugging

        if closest_match:
            # Find the metadata for the closest matching title
            matched_title = closest_match[0]
            for title, metadata in zip(results['documents'][0], results['metadatas'][0]):
                if title.lower() == matched_title.lower():
                    book_details = {
                        'title': title,
                        'author': metadata.get('author', ''),
                        'num_pages': metadata.get('num_pages', ''),
                        'cover_image_uri': metadata.get('cover_image_uri', ''),
                        'book_details': metadata.get('book_details', ''),
                        'genres': metadata['genres'],
                        'available': metadata.get('available', True)
                    }

                    # Ensure num_pages is a single value
                    if isinstance(book_details['num_pages'], list):
                        book_details['num_pages'] = book_details['num_pages'][0]

                    print(f"Book details fetched: {book_details}")  # Debugging statement
                    return jsonify(book_details), 200

        return jsonify({"error": "Book not found"}), 404

    except Exception as e:
        print(f"Error fetching book details: {e}")
        return jsonify({"error": "Failed to fetch book details"}), 500


@app.route("/api/store_search_history", methods=["POST"])
def store_search_history():
    try:
        data = request.json
        user_id = data.get("user_id")
        book_title = data.get("book_title")
        genres = data.get("genres")

        logging.info(f"Storing view history - User: {user_id}, Book: {book_title}, Genres: {genres}")

        if not all([user_id, book_title, genres]):
            logging.warning("Missing required fields in view history storage request")
            return jsonify({"error": "Missing required fields"}), 400

        # Store in view history instead of search history
        recommendation_system.add_to_view_history(user_id, book_title, genres)
        return jsonify({"message": "View history stored successfully"}), 200

    except Exception as e:
        logging.error(f"Error storing view history: {e}")
        return jsonify({"error": "Failed to store view history"}), 500

@app.route("/api/recommendations/<user_id>", methods=["GET"])
def get_recommendations(user_id):
    try:
        logging.info(f"Fetching recommendations for user: {user_id}")
        # Use the new history-based recommendation method
        recommendations = recommendation_system.recommend_books_based_on_history(user_id)
        
        if not recommendations:
            logging.warning(f"No recommendations generated for user: {user_id}")
            return jsonify([]), 200
            
        logging.info(f"Successfully generated {len(recommendations)} recommendations")
        return jsonify(recommendations), 200
    except Exception as e:
        logging.error(f"Error fetching recommendations: {e}")
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


@app.route("/api/debug/books", methods=["GET"])
def debug_all_books():
    try:
        # Retrieve all documents and their metadata from ChromaDB
        results = collection.query(
            query_texts=[""], n_results=100, include=["documents", "metadatas"]
        )

        if not results["documents"]:
            print("No books found in the collection.")
            return jsonify({"error": "No books in the collection"}), 404

        all_books = [
            {
                "title": doc,
                "author": meta.get("author", ""),
                "genres": meta.get("genres", ""),
            }
            for doc, meta in zip(results["documents"][0], results["metadatas"][0])
        ]

        print(f"Total books fetched: {len(all_books)}")
        return jsonify({"books": all_books}), 200

    except Exception as e:
        print(f"Error during debug: {e}")
        return jsonify({"error": "Failed to fetch books"}), 500



if __name__ == "__main__":
    app.run(port=5000, debug=True)
