import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
import BookManagement from './pages/BookManagement';
import Reports from './pages/Reports';
import AboutUs from './pages/AboutUs';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/search" element={<Search />} />
              <Route path="/book/:id" element={<BookDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/transaction-history" element={<TransactionHistory />} />
              <Route path="/book-management" element={<BookManagement />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/about" element={<AboutUs />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;