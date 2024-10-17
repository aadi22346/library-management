import React from 'react';
import { Book, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecommendedBook {
  id: string;
  title: string;
  author: string;
  genre: string;
  coverImage: string;
}

const Recommendations: React.FC = () => {
  // In a real application, these would be fetched from your backend based on user preferences and history
  const recommendedBooks: RecommendedBook[] = [
    { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Classic', coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
    { id: '2', title: 'Dune', author: 'Frank Herbert', genre: 'Science Fiction', coverImage: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
    { id: '3', title: 'The Hobbit', author: 'J.R.R. Tolkien', genre: 'Fantasy', coverImage: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Recommended for You</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendedBooks.map((book) => (
          <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={book.coverImage} alt={book.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{book.title}</h2>
              <p className="text-gray-600 mb-2">{book.author}</p>
              <p className="text-gray-500 mb-4">{book.genre}</p>
              <Link
                to={`/book/${book.id}`}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300 flex items-center justify-center"
              >
                <Book className="mr-2" />
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;