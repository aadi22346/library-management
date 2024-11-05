import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Book, Search, ShoppingCart, List } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.displayName}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/search" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
          <Search className="w-12 h-12 text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Search Books</h2>
          <p>Find your next great read from our vast collection.</p>
        </Link>
        <Link to="/cart" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
          <ShoppingCart className="w-12 h-12 text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your Cart</h2>
          <p>Review and manage the books you want to borrow.</p>
        </Link>
        <Link to="/recommendations" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
          <Book className="w-12 h-12 text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Recommendations</h2>
          <p>Discover personalized book suggestions just for you.</p>
        </Link>
        <Link to="/transaction-history" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
          <List className="w-12 h-12 text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Transaction History</h2>
          <p>View your past and current book loans.</p>
        </Link>
      </div>
    </div>
  );
};

export default UserDashboard;