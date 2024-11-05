import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Book, Users, FileText, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  // In a real application, you would check if the user has admin privileges
  const isAdmin = true; // This should be determined by your authentication logic

  if (!isAdmin) {
    return <div>You do not have permission to access this page.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/book-management" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
          <Book className="w-12 h-12 text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Book Management</h2>
          <p>Add, update, or remove books from the library inventory.</p>
        </Link>
        <Link to="/reports" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
          <FileText className="w-12 h-12 text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Reports</h2>
          <p>View system-generated reports and analytics.</p>
        </Link>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Users className="w-12 h-12 text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">User Management</h2>
          <p>Manage user accounts and permissions.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Settings className="w-12 h-12 text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">System Settings</h2>
          <p>Configure library system settings and preferences.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;