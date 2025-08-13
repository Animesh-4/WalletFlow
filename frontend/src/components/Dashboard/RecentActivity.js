// src/components/Dashboard/RecentActivity.js
import React from 'react';
import { useBudgets } from '../../hooks/useBudgets';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const RecentActivity = () => {
  const { transactions, loading } = useBudgets();

  const recentTransactions = Array.isArray(transactions) ? transactions.slice(0, 5) : [];

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg h-full">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
      {loading && recentTransactions.length === 0 ? (
        <p className="text-gray-500">Loading activity...</p>
      ) : (
        <ul className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {tx.type === 'income' ? <FaArrowUp size={14} /> : <FaArrowDown size={14} />}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 truncate">{tx.description}</p>
                        <p className="text-sm text-gray-500">{tx.category_name || 'General'}</p>
                    </div>
                </div>
                <p className={`font-bold flex-shrink-0 ml-2 ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                </p>
              </li>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No recent transactions to display.</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default RecentActivity;
