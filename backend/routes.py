from flask import Flask, request, jsonify
from flask_cors import CORS
from chromadb import PersistentClient
from chromadb.errors import InvalidCollectionException
import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials
from functools import wraps

app = Flask(__name__)

# Configure CORS properly
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173"],  # Replace with your frontend URL
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Initialize Firebase Admin SDK
cred = credentials.Certificate('D:\\CITL project\\library-management\\backend\\serviceAccountKey.json')
firebase_admin.initialize_app(cred)

# Initialize client and get collection
client = PersistentClient(
    path="D:\\CITL project\\library-management\\backend\\db_storage"
)

try:
    collection = client.get_collection("users")
except InvalidCollectionException:
    collection = client.create_collection(
        name="users",
        metadata={"description": "User database"}
    )

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

def verify_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'OPTIONS':
            return jsonify({"status": "OK"}), 200
            
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({"error": "Invalid authorization header"}), 401
        
        token = auth_header.split('Bearer ')[1]
        try:
            decoded_token = firebase_auth.verify_id_token(token)
            request.user = decoded_token
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": f"Invalid token: {str(e)}"}), 401
    return decorated_function

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
        if uid != request.user['uid']:
            return jsonify({"error": "User ID mismatch"}), 401

        # Store user in ChromaDB if not exists
        try:
            existing_user = collection.get(
                where={"uid": uid}
            )
            if not existing_user["ids"]:
                collection.add(
                    documents=[str(user_data)],
                    metadatas=[{
                        "uid": uid,
                        "email": email,
                        "name": name,
                        "photo_url": photo_url
                    }],
                    ids=[uid]
                )
        except Exception as e:
            print(f"ChromaDB operation failed: {e}")
            pass

        return jsonify({
            "uid": uid,
            "email": email,
            "name": name,
            "photo_url": photo_url
        }), 200

    except Exception as e:
        print(f"Exception occurred during login: {e}")
        return jsonify({"error": "Login failed"}), 401

if __name__ == "__main__":
    app.run(port=5000, debug=True)