// src/components/Transaction/TransactionList.js
import React, { useEffect } from 'react';
import TransactionItem from './TransactionItem';
import { PacmanLoader } from 'react-spinners';
import { useBudgets } from '../../hooks/useBudgets';

const TransactionList = ({ onEditTransaction }) => {
  const { transactions, loading, error, fetchTransactions, deleteTransaction } = useBudgets();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id);
      } catch (err) {
        console.error("Failed to delete transaction:", err);
      }
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <PacmanLoader color="#10B981" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-600 bg-red-100 rounded-lg">{error}</div>;
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white border-2 border-dashed rounded-2xl">
        <h3 className="text-xl font-semibold">No Transactions Yet</h3>
        <p className="mt-2">Add your first income or expense to see it here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-4">Description</th>
            <th scope="col" className="px-6 py-4">Amount</th>
            <th scope="col" className="px-6 py-4">Category</th>
            <th scope="col" className="px-6 py-4">Date</th>
            <th scope="col" className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onEdit={onEditTransaction}
              onDelete={handleDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
