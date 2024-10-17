import React, { useState } from 'react';
import { Book, Plus, Edit, Trash2 } from 'lucide-react';

interface BookItem {
  id: string;
  title: string;
  author: string;
  genre: string;
  available: boolean;
}

const BookManagement: React.FC = () => {
  const [books, setBooks] = useState<BookItem[]>([
    { id: '1', title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'Fiction', available: true },
    { id: '2', title: '1984', author: 'George Orwell', genre: 'Science Fiction', available: false },
  ]);

  const [newBook, setNewBook] = useState<Omit<BookItem, 'id'>>({
    title: '',
    author: '',
    genre: '',
    available: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewBook(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    const bookWithId = { ...newBook, id: Date.now().toString() };
    setBooks(prev => [...prev, bookWithId]);
    setNewBook({ title: '', author: '', genre: '', available: true });
  };

  const handleDeleteBook = (id: string) => {
    setBooks(prev => prev.filter(book => book.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Book Management</h1>
      <form onSubmit={handleAddBook} className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Book</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="title"
            value={newBook.title}
            onChange={handleInputChange}
            placeholder="Title"
            className="p-2 border border-gray-300 rounded"
            required
          />
          <input
            type="text"
            name="author"
            value={newBook.author}
            onChange={handleInputChange}
            placeholder="Author"
            className="p-2 border border-gray-300 rounded"
            required
          />
          <input
            type="text"
            name="genre"
            value={newBook.genre}
            onChange={handleInputChange}
            placeholder="Genre"
            className="p-2 border border-gray-300 rounded"
            required
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              name="available"
              checked={newBook.available}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label>Available</label>
          </div>
        </div>
        <button type="submit" className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300 flex items-center">
          <Plus className="mr-2" />
          Add Book
        </button>
      </form>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {books.map((book) => (
              <tr key={book.id}>
                <td className="px-6 py-4 whitespace-nowrap">{book.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{book.author}</td>
                <td className="px-6 py-4 whitespace-nowrap">{book.genre}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    book.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {book.available ? 'Available' : 'Not Available'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-2">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDeleteBook(book.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookManagement;