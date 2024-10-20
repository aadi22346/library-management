import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Book, User, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center">
          <Book className="mr-2" /> Intelligent Library
        </Link>
        <div className="space-x-4">
          <Link to="/search" className="hover:text-blue-200">Search</Link>
          {user ? (
            <>
              <Link to="/user-dashboard" className="hover:text-blue-200">Dashboard</Link>
              <Link to="/cart" className="hover:text-blue-200">Cart</Link>
              <Link to="/logout" className="hover:text-blue-200">
                <LogOut className="inline-block mr-1" /> Logout
              </Link>
            </>
          ) : (
            <Link to="/login" className="hover:text-blue-200">
              <User className="inline-block mr-1" /> Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;