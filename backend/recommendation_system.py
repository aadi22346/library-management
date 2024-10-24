import chromadb
from collections import Counter, deque
from typing import List, Dict, Any
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BookRecommendationSystem:
    def __init__(self, collection):
        self.collection = collection
        self.view_history = {}  # Changed from search_history to view_history
        self.MAX_HISTORY_SIZE = 5
        logger.info("Recommendation system initialized")

    def add_to_view_history(
        self, user_id: str, book_title: str, genres: List[str]
    ) -> None:
        """Store a book view in memory using a fixed-size deque."""
        if not user_id or not book_title or not genres:
            logger.warning(
                f"Invalid input: user_id={user_id}, title={book_title}, genres={genres}"
            )
            return

        if user_id not in self.view_history:
            self.view_history[user_id] = deque(maxlen=self.MAX_HISTORY_SIZE)

        # Ensure genres is a list
        if isinstance(genres, str):
            try:
                genres = eval(genres) if genres.startswith("[") else [genres]
            except:
                genres = [genres]

        view_entry = {
            "title": book_title,
            "genres": genres,
            "timestamp": datetime.now().isoformat(),
        }

        # Only add if it's not already the most recent entry
        if (
            not self.view_history[user_id]
            or self.view_history[user_id][0]["title"] != book_title
        ):
            self.view_history[user_id].appendleft(view_entry)  # Add to front of deque
            logger.info(f"Added to view history for user {user_id}: {view_entry}")

    def get_user_view_history(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's complete view history."""
        history = list(self.view_history.get(user_id, []))
        logger.info(f"Retrieved view history for user {user_id}: {history}")
        return history

    def recommend_books_based_on_history(
        self, user_id: str, n_recommendations: int = 5
    ) -> List[Dict[str, Any]]:
        """Recommend books based on the genres of the books in the user's view history."""
        logger.info(f"Generating recommendations for user {user_id}")

        if user_id not in self.view_history or not self.view_history[user_id]:
            logger.info(
                f"No view history found for user {user_id}, returning default recommendations"
            )
            return self._get_default_recommendations(n_recommendations)

        # Get the genres from the user's view history
        genres = []
        viewed_titles = (
            set()
        )  # Track viewed titles to exclude them from recommendations

        for item in self.view_history[user_id]:
            viewed_titles.add(item["title"])
            item_genres = item["genres"]
            if isinstance(item_genres, str):
                try:
                    genre_list = (
                        eval(item_genres)
                        if item_genres.startswith("[")
                        else [item_genres]
                    )
                    genres.extend(genre_list)
                except:
                    genres.append(item_genres)
            else:
                genres.extend(item_genres)

        # Weight recent views more heavily by counting them multiple times
        genre_counter = Counter()
        for i, item in enumerate(self.view_history[user_id]):
            weight = len(self.view_history[user_id]) - i  # More recent = higher weight
            item_genres = item["genres"]
            if isinstance(item_genres, str):
                try:
                    genre_list = (
                        eval(item_genres)
                        if item_genres.startswith("[")
                        else [item_genres]
                    )
                except:
                    genre_list = [item_genres]
            else:
                genre_list = item_genres

            for genre in genre_list:
                genre_counter[genre] += weight

        most_common_genres = [genre for genre, _ in genre_counter.most_common()]

        logger.info(f"Most common genres for user {user_id}: {most_common_genres}")

        if not most_common_genres:
            logger.warning("No genres found in user history")
            return self._get_default_recommendations(n_recommendations)

        try:
            # Query the collection for books with similar genres
            results = self.collection.query(
                query_texts=[", ".join(most_common_genres[:3])],  # Use top 3 genres
                n_results=n_recommendations
                + len(viewed_titles),  # Get extra results to account for filtering
                include=["documents", "metadatas"],
            )

            recommendations = []
            for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
                if doc not in viewed_titles:  # Only recommend books not in view history
                    book = {
                        "id": meta.get("id", str(hash(doc))),
                        "title": doc,
                        "author": meta.get("author", ""),
                        "num_pages": meta.get("num_pages", ""),
                        "cover_image_uri": meta.get("cover_image_uri", ""),
                        "book_details": meta.get("book_details", ""),
                        "genres": meta.get("genres", []),
                        "available": meta.get("available", True),
                    }
                    recommendations.append(book)
                    if len(recommendations) >= n_recommendations:
                        break

            logger.info(f"Generated {len(recommendations)} recommendations")
            return recommendations

        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return self._get_default_recommendations(n_recommendations)

    def search_books(
        self, user_id: str, query_text: str, n_results: int = 10
    ) -> List[Dict[str, Any]]:
        """Search for books and update user history."""
        try:
            results = self.collection.query(
                query_texts=[query_text],
                n_results=n_results,
                include=["documents", "metadatas"],
            )

            # Debugging: Print the raw results
            print(
                f"Raw search results for query '{query_text}' by user {user_id}: {results}"
            )

            books = []
            for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
                genres = meta.get("genres", [])
                if not isinstance(genres, list):
                    genres = [genres]
                books.append(
                    {
                        "title": doc,
                        "author": meta.get("author", ""),
                        "num_pages": meta.get("num_pages", ""),
                        "cover_image_uri": meta.get("cover_image_uri", ""),
                        "book_details": meta.get("book_details", ""),
                        "genres": genres,
                        "available": meta.get("available", True),
                    }
                )
                print(
                    f"Search results for query '{query_text}' by user {user_id}: {books}"
                )
            return books
        except Exception as e:
            print(
                f"Error searching books for query '{query_text}' by user {user_id}: {e}"
            )
            return []

    def _get_default_recommendations(
        self, n_recommendations: int
    ) -> List[Dict[str, Any]]:
        """Get default recommendations when no history is available."""
        try:
            results = self.collection.query(
                query_texts=["popular books"],
                n_results=n_recommendations,
                include=["documents", "metadatas"],
            )

            recommendations = []
            for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
                book = {
                    "id": meta.get("id", str(hash(doc))),
                    "title": doc,
                    "author": meta.get("author", ""),
                    "num_pages": meta.get("num_pages", ""),
                    "cover_image_uri": meta.get("cover_image_uri", ""),
                    "book_details": meta.get("book_details", ""),
                    "genres": meta.get("genres", []),
                    "available": meta.get("available", True),
                }
                recommendations.append(book)

            logger.info(f"Generated {len(recommendations)} default recommendations")
            return recommendations

        except Exception as e:
            logger.error(f"Error generating default recommendations: {e}")
            return []
