import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthHandler from './components/AuthHandler'; // Add this import
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Search from './pages/Search';
import BookDetails from './pages/BookDetails';
import Cart from './pages/Cart';
import Recommendations from './pages/Recommendations';
import TransactionHistory from './pages/TransactionHistory';
import Logout from './pages/Logout';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AuthHandler /> {/* Add AuthHandler here, before Navbar */}
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/search" element={<Search />} />
          <Route path="/book-details" element={<BookDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/transaction-history" element={<TransactionHistory />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;