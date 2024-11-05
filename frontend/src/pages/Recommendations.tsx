import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Recommendation {
  id: string;
  title: string;
  author: string;
  num_pages: number;
  cover_image_uri: string;
  book_details: string;
  genres: string[];
  available: boolean;
}

interface ViewHistory {
  title: string;
  genres: string[];
  timestamp: string;
}

const Recommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [viewHistory, setViewHistory] = useState<ViewHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Fetch recommendations whenever view history changes
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const userId = currentUser?.uid || 'test_user';
        const response = await fetch(`http://localhost:5000/api/recommendations/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        
        const data = await response.json();
        setRecommendations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentUser, viewHistory]); // Add viewHistory as dependency to trigger updates

  const handleViewDetails = async (book: Recommendation) => {
    try {
      const userId = currentUser?.uid || 'test_user';
      
      // Store the view history
      const response = await fetch(`http://localhost:5000/api/store_search_history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          book_title: book.title,
          genres: book.genres,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to store view history');
      }

      // Update local view history
      setViewHistory(prev => [
        {
          title: book.title,
          genres: book.genres,
          timestamp: new Date().toISOString()
        },
        ...prev.slice(0, 4) // Keep last 5 items
      ]);

      // Navigate to book details
      window.location.href = `/book/${encodeURIComponent(book.title)}`;
    } catch (err) {
      console.error('Error storing view history:', err);
      // Still navigate even if history storage fails
      window.location.href = `/book/${encodeURIComponent(book.title)}`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {viewHistory.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recently Viewed</h2>
          <div className="flex overflow-x-auto gap-4 pb-4">
            {viewHistory.map((item, index) => (
              <div key={index} className="flex-shrink-0 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-600">{item.genres.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">Recommended Books</h1>
      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <div key={rec.id} className="bg-white shadow-md rounded-lg overflow-hidden transition-transform duration-200 hover:scale-105">
              <div className="relative pb-[140%]">
                {rec.cover_image_uri ? (
                  <img 
                    src={rec.cover_image_uri} 
                    alt={rec.title} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{rec.title}</h2>
                <p className="text-gray-600 mb-1">By {rec.author}</p>
                <p className="text-gray-600 mb-1">{rec.num_pages} pages</p>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Genres:</span> {Array.isArray(rec.genres) ? rec.genres.join(', ') : rec.genres}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className={`px-2 py-1 rounded-full text-sm ${rec.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {rec.available ? 'Available' : 'Not Available'}
                  </span>
                  <button
                    onClick={() => handleViewDetails(rec)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No recommendations available.</p>
      )}
    </div>
  );
};

export default Recommendations;