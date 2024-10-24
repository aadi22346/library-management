import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Book } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to the Intelligent Library</h1>
      <Book className="mx-auto w-24 h-24 text-blue-600 mb-6" />
      {currentUser ? (
        <p className="text-xl mb-4">Welcome back, {currentUser.displayName || currentUser.email}!</p>
      ) : (
        <p className="text-xl mb-4">Discover a world of knowledge at your fingertips.</p>
      )}
      <p className="mb-8">
        Our Intelligent Library Management System offers a seamless experience for book lovers and researchers alike.
        Explore our vast collection, get personalized recommendations, and manage your reading journey with ease.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Smart Search</h2>
          <p>Find the perfect book with our advanced search capabilities.</p>
          <Link to="/search" className="text-blue-500 hover:underline mt-2 block">
            Start Searching
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Personalized Recommendations</h2>
          <p>Discover new reads tailored to your interests and reading history.</p>
          <Link to="/recommendations" className="text-blue-500 hover:underline mt-2 block">
            View Recommendations
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Easy Management</h2>
          <p>Keep track of your borrowed books and due dates effortlessly.</p>
          <Link to="/management" className="text-blue-500 hover:underline mt-2 block">
            Manage Your Books
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;