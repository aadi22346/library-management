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

    def search_books(self, book_name: str) -> Tuple[Optional[str], Optional[List[str]]]:
        """Search for a book and return the book and its genres."""
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
                return document, genres
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

        try:
            # Get all genres from search history
            all_genres = [genre for _, genres in self.search_history for genre in genres]
            if not all_genres:
                print("No genres found in search history.")
                return

            # Find the most common genre
            genre_counts = Counter(all_genres)
            most_common_genre = genre_counts.most_common(1)[0][0]
            
            print(f"\nGenerating recommendations based on your search history in the '{most_common_genre}' genre:")
            similar_books, similar_metadata = self.gen_similar_books(most_common_genre)

            self._display_recommendations(similar_books, similar_metadata, 5)
        except Exception as e:
            print(f"Error generating recommendations: {e}")

    def _display_recommendations(self, books: List[str], metadata: List[Dict[str, Any]], limit: int) -> None:
        """Display book recommendations with their genres."""
        count = 1
        for book, meta in zip(books, metadata):
            if count > limit:
                break
            print(f"{count}. {book}")
            genres_list = ast.literal_eval(meta['genres']) if meta.get('genres') else []
            print(f"   Genres: {genres_list}")
            count += 1

    def run(self):
        """Main loop for the recommendation system."""
        while True:
            try:
                book_name = input("Enter the name of the book (or 'quit' to exit): ").strip()
                if book_name.lower() == 'quit':
                    break

                book, genres = self.search_books(book_name)
                if book:
                    print(f"\nSearch result for '{book_name}':")
                    print(f"Book: {book}")
                    print(f"Genres: {genres}")
                    
                    self.search_history.append((book, genres))
                    
                    if genres:
                        search_query = genres[0]
                        similar_books, similar_metadata = self.gen_similar_books(search_query)
                        
                        print(f"\nSimilar books in the '{search_query}' genre:")
                        filtered_books = [(b, m) for b, m in zip(similar_books, similar_metadata) 
                                        if b.lower() != book_name.lower()]
                        self._display_recommendations(
                            [b for b, _ in filtered_books[:5]], 
                            [m for _, m in filtered_books[:5]], 
                            5
                        )
                    else:
                        print("No genres found for this book")
                else:
                    print("The book is not present in the database")

                self.recommend_from_history()
            except Exception as e:
                print(f"An error occurred: {e}")

if __name__ == "__main__":
    DB_PATH = "C:\\Users\\Areeb\\Desktop\\VS CODE Workspace\\library-management\\backend\\db_storage"
    recommender = BookRecommendationSystem(DB_PATH)
    recommender.run()