# recommendation_system.py
import chromadb
from collections import Counter, deque
from typing import List, Dict, Any
from datetime import datetime

class BookRecommendationSystem:
    def __init__(self, collection):
        self.collection = collection
        # Use deque with maxlen=5 to automatically maintain last 5 searches
        self.search_history = {}
        self.MAX_HISTORY_SIZE = 5

    def add_to_history(self, user_id: str, book_title: str, genres: List[str]) -> None:
        """Store a book search in memory using a fixed-size deque."""
        if user_id not in self.search_history:
            self.search_history[user_id] = deque(maxlen=self.MAX_HISTORY_SIZE)
        
        # Add new search to history - deque will automatically remove oldest item if full
        self.search_history[user_id].append({
            'title': book_title,
            'genres': genres,
            'timestamp': datetime.now().isoformat()
        })

    def get_user_history(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's complete search history."""
        if user_id not in self.search_history:
            return []
        return list(self.search_history[user_id])

    def recommend_books_based_on_genre(self, user_id: str, n_recommendations: int = 5) -> List[Dict[str, Any]]:
        """Recommend books based on the genres of the books in the user's search history."""
        if user_id not in self.search_history or not self.search_history[user_id]:
            return []

        # Get the genres from the user's search history
        genres = [genre for item in self.search_history[user_id] for genre in item['genres']]
        genre_counter = Counter(genres)
        most_common_genres = [genre for genre, _ in genre_counter.most_common()]

        # Query the collection for books with similar genres
        results = self.collection.query(
            query_texts=most_common_genres,
            n_results=n_recommendations,
            include=['documents', 'metadatas']
        )

        recommendations = []
        for doc, meta in zip(results['documents'][0], results['metadatas'][0]):
            recommendations.append({
                'title': doc,
                'author': meta.get('author', ''),
                'num_pages': meta.get('num_pages', ''),
                'cover_image_uri': meta.get('cover_image_uri', ''),
                'book_details': meta.get('book_details', ''),
                'genres': meta.get('genres', ''),
                'available': meta.get('available', True)
            })

        return recommendations

    def search_books(self, user_id: str, query_text: str, n_results: int = 10) -> List[Dict[str, Any]]:
        """Search for books based on a query text."""
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results,
            include=['documents', 'metadatas']
        )

        books = []
        for doc, meta in zip(results['documents'][0], results['metadatas'][0]):
            books.append({
                'title': doc,
                'author': meta.get('author', ''),
                'num_pages': meta.get('num_pages', ''),
                'cover_image_uri': meta.get('cover_image_uri', ''),
                'book_details': meta.get('book_details', ''),
                'genres': meta.get('genres', ''),
                'available': meta.get('available', True)
            })

        return books