// src/components/Transaction/TransactionItem.js
import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';

const TransactionItem = ({ transaction, onEdit, onDelete }) => {
  const { description, amount, type, category_name, date } = transaction;

  const formattedDate = format(new Date(date), 'MMM dd, yyyy');
  const amountColor = type === 'income' ? 'text-green-600' : 'text-red-600';
  const amountSign = type === 'income' ? '+' : '-';

  return (
    <tr className="bg-white border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-200 group">
      <td className="px-6 py-4 font-medium text-gray-900">{description}</td>
      <td className={`px-6 py-4 font-semibold ${amountColor}`}>
        {amountSign} ${Number(amount).toFixed(2)}
      </td>
      <td className="px-6 py-4">
        <span className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">
            {category_name || 'General'}
        </span>
      </td>
      <td className="px-6 py-4 text-gray-600">{formattedDate}</td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(transaction)}
              className="p-2 text-blue-600 rounded-full hover:bg-blue-100"
              aria-label="Edit transaction"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => onDelete(transaction.id)}
              className="p-2 text-red-600 rounded-full hover:bg-red-100"
              aria-label="Delete transaction"
            >
              <FaTrash />
            </button>
        </div>
      </td>
    </tr>
  );
};

export default TransactionItem;
