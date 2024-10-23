import React, { useEffect, useState } from "react";
import { Book } from "lucide-react";
import { Link } from "react-router-dom";

interface RecommendedBook {
  id: string;
  title: string;
  author: string;
  genre: string[];
  cover_image_uri: string;
  book_details: string;
  num_pages: number;
  available: boolean;
}
const Recommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Remove token from headers for testing
        const response = await fetch(
          "http://localhost:5000/api/recommendations",
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }

        const data = await response.json();
        setRecommendations(data.recommendations);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load recommendations"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Recommended for You</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Recommended for You</h1>
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Recommended for You</h1>
      {recommendations.length === 0 ? (
        <div className="text-gray-500 text-center p-8 bg-gray-50 rounded-lg">
          Search for some books to get personalized recommendations!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="aspect-w-3 aspect-h-4">
                <img
                  src={book.cover_image_uri}
                  alt={book.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder-book.jpg";
                  }}
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                  {book.title}
                </h2>
                <p className="text-gray-600 mb-2">{book.author}</p>
                <p className="text-gray-500 mb-2">
                  {Array.isArray(book.genre) ? book.genre[0] : book.genre}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {book.num_pages} pages
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      book.available
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {book.available ? "Available" : "Checked Out"}
                  </span>
                </div>
                <Link
                  to={`/book/${encodeURIComponent(book.title)}`}
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                >
                  <Book className="mr-2" size={16} />
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
