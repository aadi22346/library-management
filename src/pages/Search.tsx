import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  available: boolean;
}

const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would be an API call to your backend
    const mockResults: Book[] = [
      { id: '1', title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'Fiction', available: true },
      { id: '2', title: '1984', author: 'George Orwell', genre: 'Science Fiction', available: false },
      { id: '3', title: 'Pride and Prejudice', author: 'Jane Austen', genre: 'Romance', available: true },
    ];
    setSearchResults(mockResults);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Search Books</h1>
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, author, or genre"
            className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded-r-md hover:bg-blue-700 transition duration-300">
            <SearchIcon className="w-6 h-6" />
          </button>
        </div>
      </form>
      <div className="space-y-4">
        {searchResults.map((book) => (
          <div key={book.id} className="bg-white p-4 rounded-md shadow">
            <h2 className="text-xl font-semibold mb-2">{book.title}</h2>
            <p className="text-gray-600">Author: {book.author}</p>
            <p className="text-gray-600">Genre: {book.genre}</p>
            <p className={`font-semibold ${book.available ? 'text-green-600' : 'text-red-600'}`}>
              {book.available ? 'Available' : 'Not Available'}
            </p>
            <Link to={`/book/${book.id}`} className="mt-2 inline-block text-blue-600 hover:underline">
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;