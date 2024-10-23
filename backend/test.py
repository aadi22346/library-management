import chromadb
import ast
from collections import Counter
from typing import Tuple, List, Optional, Dict, Any

class BookRecommendationSystem:
    def __init__(self, db_path: str):
        """Initialize the recommendation system with database path."""
        self.client = chromadb.PersistentClient(path=db_path)
        self.collection = self.client.get_collection("books")
        self.search_history: List[Tuple[str, List[str]]] = []

    def search_books(self, book_name: str) -> Tuple[Optional[str], Optional[Dict[str, Any]]]:
        """Search for a book and return the book and its metadata."""
        try:
            results = self.collection.query(
                query_texts=[book_name],
                n_results=1,
                include=['documents', 'metadatas']
            )
            
            if results['documents'][0]:
                document = results['documents'][0][0]
                metadata = results['metadatas'][0][0]
                genres = ast.literal_eval(metadata['genres']) if metadata.get('genres') else []
                self.search_history.append((document, genres))
                return document, metadata
            return None, None
        except Exception as e:
            print(f"Error searching for book: {e}")
            return None, None

    def gen_similar_books(self, search_query: str) -> Tuple[List[str], List[Dict[str, Any]]]:
        """Generate similar books based on a search query."""
        try:
            results = self.collection.query(
                query_texts=[search_query],
                n_results=6,
                include=['documents', 'metadatas']
            )
            return results['documents'][0], results['metadatas'][0]
        except Exception as e:
            print(f"Error generating similar books: {e}")
            return [], []

    def recommend_from_history(self) -> None:
        """Generate recommendations based on search history."""
        if not self.search_history:
            print("No search history available for recommendations.")
            return

        # Aggregate genres from search history
        genre_counter = Counter()
        for _, genres in self.search_history:
            genre_counter.update(genres)

        # Get the most common genre
        if not genre_counter:
            print("No genres found in search history.")
            return

        most_common_genre = genre_counter.most_common(1)[0][0]
        print(f"Most common genre in search history: {most_common_genre}")

        # Generate recommendations based on the most common genre
        similar_books, similar_books_metadata = self.gen_similar_books(most_common_genre)
        if similar_books:
            print("Recommended books based on search history:")
            for title, meta in zip(similar_books, similar_books_metadata):
                self.display_book_details(title, meta)
        else:
            print("No similar books found.")

    def display_book_details(self, book_title: str, metadata: Dict[str, Any]) -> None:
        """Display the details of a book."""
        print(f"""
        Title: {book_title}
        Author: {metadata.get('author', 'N/A')}
        Pages: {metadata.get('num_pages', 'N/A')}
        Cover: {metadata.get('cover_image_uri', 'N/A')}
        Details: {metadata.get('book_details', 'N/A')}
        Genres: {metadata.get('genres', 'N/A')}
        """)

# Example usage:
if __name__ == "__main__":
    db_path = "D:\\CITL project\\library-management\\backend\\db_storage"
    book_system = BookRecommendationSystem(db_path)
    
    search_query = input("Enter the name of the book to search: ")
    book_title, metadata = book_system.search_books(search_query)
    
    if book_title and metadata:
        book_system.display_book_details(book_title, metadata)
    else:
        print("Book not found.")
    
    similar_books, similar_books_metadata = book_system.gen_similar_books(search_query)
    if similar_books:
        print("Similar books:")
        for title, meta in zip(similar_books, similar_books_metadata):
            book_system.display_book_details(title, meta)
    else:
        print("No similar books found.")
    
    book_system.recommend_from_history()