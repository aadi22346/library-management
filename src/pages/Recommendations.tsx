import React, { useState, useEffect } from 'react';

interface Recommendation {
  title: string;
  author: string;
  num_pages: number | string;
  cover_image_uri: string;
  book_details: string;
  genres: string;
  available: boolean;
}

const Recommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/recommendations/test_user`);
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        const data = await response.json();
        setRecommendations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      }
    };

    fetchRecommendations();
  }, []);

  const handleViewDetails = (title: string) => {
    window.location.href = `/book/${encodeURIComponent(title)}`;
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Recommended Books</h1>
      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-white shadow-md rounded-lg p-4">
              {rec.cover_image_uri && (
                <img src={rec.cover_image_uri} alt={rec.title} className="rounded-lg mb-4" />
              )}
              <h2 className="text-lg font-semibold text-gray-900">{rec.title}</h2>
              <p className="text-sm text-gray-600 mt-1">Author: {rec.author}</p>
              <p className="text-sm text-gray-600 mt-1">Pages: {rec.num_pages}</p>
              <p className="text-sm text-gray-600 mt-1">Genre: {rec.genres}</p>
              <p className="text-sm text-gray-600 mt-1">Details: {rec.book_details}</p>
              <p className={`text-sm font-medium ${rec.available ? 'text-green-600' : 'text-red-600'}`}>
                {rec.available ? 'Available' : 'Not Available'}
              </p>
              <button 
                onClick={() => handleViewDetails(rec.title)} 
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline mt-2"
                type="button"
              >
                View Details →
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-center">No recommendations available.</div>
      )}
    </div>
  );
};

export default Recommendations;
