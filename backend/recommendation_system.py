# recommendation_system.py
import chromadb
import ast
from collections import Counter
from typing import List, Dict, Any
from datetime import datetime

class BookRecommendationSystem:
    def __init__(self, collection):
        self.collection = collection
        # Store search history in memory for testing
        self.search_history = {}

    def add_to_history(self, user_id: str, book_title: str, genres: List[str]) -> None:
        """Store a book search in memory."""
        if user_id not in self.search_history:
            self.search_history[user_id] = []
        
        self.search_history[user_id].append({
            'title': book_title,
            'genres': genres,
            'timestamp': datetime.now().isoformat()
        })

    def get_user_history(self, user_id: str, limit: int = 20) -> List[tuple[str, List[str]]]:
        """Get user's search history with genres."""
        if user_id not in self.search_history:
            return []
        
        history = self.search_history[user_id][-limit:]  # Get last 'limit' searches
        return [(item['title'], item['genres']) for item in history]

    def generate_recommendations(self, user_id: str, limit: int = 6) -> List[Dict[str, Any]]:
        """Generate recommendations based on user's search history."""
        search_history = self.get_user_history(user_id)
        
        if not search_history:
            # Return some default recommendations for new users
            default_genres = ['fiction', 'mystery', 'romance']  # Example default genres
            recommendations = []
            for genre in default_genres:
                results = self.collection.query(
                    query_texts=[genre],
                    n_results=2,  # Get 2 books per genre
                    include=['documents', 'metadatas']
                )
                for doc, meta in zip(results['documents'][0], results['metadatas'][0]):
                    if len(recommendations) < limit:
                        genres = ast.literal_eval(meta['genres']) if isinstance(meta.get('genres'), str) else meta.get('genres', [])
                        recommendations.append({
                            'id': str(len(recommendations)),
                            'title': doc,
                            'author': meta.get('author', ''),
                            'genres': genres,
                            'cover_image_uri': meta.get('cover_image_uri', ''),
                            'book_details': meta.get('book_details', ''),
                            'num_pages': meta.get('num_pages', ''),
                            'available': meta.get('available', True)
                        })
            return recommendations

        # Aggregate genres from search history
        genre_counter = Counter()
        for _, genres in search_history:
            if isinstance(genres, str):
                genres = ast.literal_eval(genres)
            genre_counter.update(genres)

        if not genre_counter:
            return []

        # Get the top 3 most common genres
        common_genres = genre_counter.most_common(3)
        recommendations = []
        seen_titles = set()

        for genre, _ in common_genres:
            if len(recommendations) >= limit:
                break

            results = self.collection.query(
                query_texts=[genre],
                n_results=limit,
                include=['documents', 'metadatas']
            )

            for doc, meta in zip(results['documents'][0], results['metadatas'][0]):
                if doc not in seen_titles and len(recommendations) < limit:
                    genres = ast.literal_eval(meta['genres']) if isinstance(meta.get('genres'), str) else meta.get('genres', [])
                    recommendations.append({
                        'id': str(len(recommendations)),
                        'title': doc,
                        'author': meta.get('author', ''),
                        'genres': genres,
                        'cover_image_uri': meta.get('cover_image_uri', ''),
                        'book_details': meta.get('book_details', ''),
                        'num_pages': meta.get('num_pages', ''),
                        'available': meta.get('available', True)
                    })
                    seen_titles.add(doc)

        return recommendations

    def search_books(self, user_id: str, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search for books and update user history."""
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=limit,
                include=['documents', 'metadatas']
            )

            books = []
            for doc, meta in zip(results['documents'][0], results['metadatas'][0]):
                genres = ast.literal_eval(meta['genres']) if isinstance(meta.get('genres'), str) else meta.get('genres', [])
                # Add to search history
                self.add_to_history(user_id, doc, genres)
                
                books.append({
                    'id': str(len(books)),
                    'title': doc,
                    'author': meta.get('author', ''),
                    'genres': genres,
                    'cover_image_uri': meta.get('cover_image_uri', ''),
                    'book_details': meta.get('book_details', ''),
                    'num_pages': meta.get('num_pages', ''),
                    'available': meta.get('available', True)
                })

            return books
        except Exception as e:
            print(f"Error searching books: {e}")
            return []