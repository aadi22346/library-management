import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface BookDetails {
  id: string;
  title: string;
  author: string;
  num_pages: number;
  cover_image_uri: string;
  book_details: string;
  genre: string;
  available: boolean;
}

const BookDetails: React.FC = () => {
  const { title } = useParams<{ title: string }>();
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        if (!title) {
          throw new Error('Book title is undefined');
        }
        
        const response = await fetch(
          `http://localhost:5000/api/book_details/${encodeURIComponent(title)}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch book details');
        }

        const data: BookDetails = await response.json();
        setBookDetails(data);
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load book details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookDetails();
  }, [title]);

  if (isLoading) {
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

  if (!bookDetails) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-yellow-50 text-yellow-600 p-4 rounded-lg">
          No book found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 p-4">
            {bookDetails.cover_image_uri && (
              <img 
                src={bookDetails.cover_image_uri} 
                alt={bookDetails.title} 
                className="w-full h-auto rounded-lg shadow-md"
              />
            )}
          </div>
          <div className="md:w-2/3 p-6">
            <h1 className="text-3xl font-bold mb-4">{bookDetails.title}</h1>
            <div className="space-y-3">
              <p className="text-lg">
                <span className="font-semibold">Author:</span> {bookDetails.author}
              </p>
              <p className="text-lg">
                <span className="font-semibold">Pages:</span> {bookDetails.num_pages}
              </p>
              <p className="text-lg">
                <span className="font-semibold">Genre:</span> {bookDetails.genre}
              </p>
              <p className="text-lg">
                <span className="font-semibold">Description:</span> {bookDetails.book_details}
              </p>
              <p className={`text-lg font-medium ${
                bookDetails.available ? 'text-green-600' : 'text-red-600'
              }`}>
                Status: {bookDetails.available ? 'Available' : 'Not Available'}
              </p>
              {bookDetails.available && (
                <button 
                  onClick={() => addToCart({
                    id: bookDetails.id,
                    title: bookDetails.title,
                    author: bookDetails.author
                  })}
                  className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition duration-200"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;