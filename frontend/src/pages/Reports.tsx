import React from 'react';
import { BarChart, PieChart, LineChart, Calendar } from 'lucide-react';

const Reports: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BarChart className="w-6 h-6 mr-2 text-blue-600" />
            Most Borrowed Books
          </h2>
          <p className="text-gray-600">View the top 10 most borrowed books in the library.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <PieChart className="w-6 h-6 mr-2 text-blue-600" />
            Genre Distribution
          </h2>
          <p className="text-gray-600">See the distribution of books across different genres.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <LineChart className="w-6 h-6 mr-2 text-blue-600" />
            User Activity
          </h2>
          <p className="text-gray-600">Track user activity and engagement over time.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-blue-600" />
            Overdue Books
          </h2>
          <p className="text-gray-600">List of currently overdue books and associated users.</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;