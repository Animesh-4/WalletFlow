// src/components/Budget/BudgetCard.js
import React from 'react';
import { FaShareAlt, FaSyncAlt, FaCrown, FaEye, FaPlus, FaPencilAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const BudgetCard = ({ budget, onEdit, onDelete, onShare, onViewBudget, onAdjustBudget }) => {
  const { user } = useAuth();
  const { name, is_recurring, role } = budget;
  
  const amount = Number(budget.amount) || 0;
  const spent = Number(budget.spent) || 0;
  const remaining = amount - spent;
  const spentPercentage = amount > 0 ? (spent / amount) * 100 : 0;

  // This determines if the user has spent more than their allocated budget.
  const isOverBudget = spent > amount;

  const getProgressBarColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (spentPercentage >= 80) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  return (
    // The border color now changes dynamically based on the isOverBudget status.
    <div className={`p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between border-2 ${
      isOverBudget ? 'border-red-500' : 'border-transparent'
    }`}>
      <div>
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-800 truncate" title={name}>
            {role === 'owner' && <FaCrown className="inline-block text-yellow-500 mr-2" title="You are the owner" />}
            {name}
          </h3>
          {is_recurring && <FaSyncAlt className="text-blue-500 flex-shrink-0 ml-2" title="Recurring Monthly" />}
        </div>
        
        <div className="my-4 space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-gray-500">Spent:</span>
                <span className="font-semibold text-gray-800">${spent.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-gray-500">Remaining:</span>
                <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                  {isOverBudget ? `-$${Math.abs(remaining).toFixed(2)}` : `$${remaining.toFixed(2)}`}
                </span>
            </div>
            <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-800">Total:</span>
                <span className="font-semibold text-gray-900">${amount.toFixed(2)}</span>
            </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ease-out ${getProgressBarColor()}`}
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            ></div>
        </div>
      </div>
      
      <div className="flex items-center justify-end space-x-4 pt-3 border-t mt-4">
        <button onClick={() => onViewBudget(budget)} className="flex items-center text-sm font-medium text-gray-600 hover:text-emerald-600">
            <FaEye className="mr-1.5" /> View
        </button>
        {(role === 'editor' || role === 'owner') && (
            <>
                <button onClick={() => onAdjustBudget(budget)} className="flex items-center text-sm font-medium text-green-600 hover:text-green-800">
                    <FaPlus className="mr-1.5" /> Adjust
                </button>
                <button onClick={() => onShare(budget)} className="flex items-center text-sm font-medium text-gray-600 hover:text-emerald-600">
                    <FaShareAlt className="mr-1.5" /> Share
                </button>
            </>
        )}
        {role === 'owner' && (
            <>
                <button onClick={() => onEdit(budget)} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                    <FaPencilAlt className="mr-1.5" /> Edit
                </button>
                <button onClick={() => onDelete(budget.id)} className="flex items-center text-sm font-medium text-red-600 hover:text-red-800">
                    Delete
                </button>
            </>
        )}
      </div>
    </div>
  );
};

export default BudgetCard;
