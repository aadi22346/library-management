import React from 'react';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

interface Transaction {
  id: string;
  bookTitle: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'Borrowed' | 'Returned' | 'Overdue';
}

const TransactionHistory: React.FC = () => {
  // In a real application, this data would be fetched from your backend
  const transactions: Transaction[] = [
    { id: '1', bookTitle: 'To Kill a Mockingbird', borrowDate: '2023-03-01', dueDate: '2023-03-15', returnDate: '2023-03-14', status: 'Returned' },
    { id: '2', bookTitle: '1984', borrowDate: '2023-03-10', dueDate: '2023-03-24', returnDate: null, status: 'Borrowed' },
    { id: '3', bookTitle: 'Pride and Prejudice', borrowDate: '2023-02-20', dueDate: '2023-03-06', returnDate: null, status: 'Overdue' },
  ];

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'Returned':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Borrowed':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'Overdue':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Transaction History</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrow Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap">{transaction.bookTitle}</td>
                <td className="px-6 py-4 whitespace-nowrap">{transaction.borrowDate}</td>
                <td className="px-6 py-4 whitespace-nowrap">{transaction.dueDate}</td>
                <td className="px-6 py-4 whitespace-nowrap">{transaction.returnDate || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    transaction.status === 'Returned' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'Borrowed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {getStatusIcon(transaction.status)}
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;