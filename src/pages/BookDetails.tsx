import React from 'react';
import { useParams } from 'react-router-dom';
import { Book, ShoppingCart } from 'lucide-react';

interface BookDetails {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  available: boolean;
  coverImage: string;
}

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // In a real application, this would be fetched from your backend
  const bookDetails: BookDetails = {
    id: id || '1',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Fiction',
    description: 'To Kill a Mockingbird is a novel by Harper Lee published in 1960. It was immediately successful, winning the Pulitzer Prize, and has become a classic of modern American literature.',
    available: true,
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  };

  const handleAddToCart = () => {
    // In a real application, this would add the book to the user's cart
    console.log('Book added to cart:', bookDetails.title);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row">
          <img src={bookDetails.coverImage} alt={bookDetails.title} className="w-full md:w-1/3 rounded-md mb-4 md:mb-0 md:mr-6" />
          <div className="flex-grow">
            <h1 className="text-3xl font-bold mb-2">{bookDetails.title}</h1>
            <p className="text-xl text-gray-600 mb-4">by {bookDetails.author}</p>
            <p className="mb-2"><strong>Genre:</strong> {bookDetails.genre}</p>
            <p className={`font-semibold mb-4 ${bookDetails.available ? 'text-green-600' : 'text-red-600'}`}>
              {bookDetails.available ? 'Available' : 'Not Available'}
            </p>
            <p className="mb-6">{bookDetails.description}</p>
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300 flex items-center"
              disabled={!bookDetails.available}
            >
              <ShoppingCart className="mr-2" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;