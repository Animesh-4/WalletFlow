// src/components/Budget/BudgetList.js
import React, { useEffect, useState, useMemo } from 'react';
import BudgetCard from './BudgetCard';
import { useBudgets } from '../../hooks/useBudgets';
import { FaWallet } from 'react-icons/fa';

// The component now accepts the onViewBudget prop
const BudgetList = ({ onEditBudget, onShareBudget, onViewBudget ,  onAdjustBudget}) => {
  const { budgets, loading, error, fetchBudgets, deleteBudget, categories } = useBudgets();
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const filteredAndSortedBudgets = useMemo(() => {
    let result = Array.isArray(budgets) ? [...budgets] : [];

    if (filterCategory !== 'all') {
      result = result.filter(b => b.category === filterCategory);
    }

    switch (sortBy) {
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'amount_desc':
        result.sort((a, b) => Number(b.amount) - Number(a.amount));
        break;
      case 'amount_asc':
        result.sort((a, b) => Number(a.amount) - Number(b.amount));
        break;
      case 'spent_desc':
        result.sort((a, b) => (Number(b.spent) / Number(b.amount)) - (Number(a.spent) / Number(a.amount)));
        break;
      default: // date_desc
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }
    return result;
  }, [budgets, filterCategory, sortBy]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      await deleteBudget(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter and Sort Controls */}
      <div className="p-4 bg-white rounded-lg shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
            <label htmlFor="filterCategory" className="text-sm font-medium text-gray-700">Filter by:</label>
            <select id="filterCategory" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500">
                <option value="all"><span className="">All Categories</span></option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
        </div>
        <div className="flex items-center gap-2">
            <label htmlFor="sortBy" className="text-sm font-medium text-gray-700">Sort by:</label>
            <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500">
                <option value="date_desc">Most Recent</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="amount_desc">Amount (High-Low)</option>
                <option value="amount_asc">Amount (Low-High)</option>
                <option value="spent_desc">Spending (%)</option>
            </select>
        </div>
      </div>

      {/* Budget Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedBudgets.map((budget) => (
          <BudgetCard 
            key={budget.id} 
            budget={budget} 
            onEdit={onEditBudget} 
            onDelete={handleDelete} 
            onShare={onShareBudget}
            // The onViewBudget function is now correctly passed down
            onViewBudget={onViewBudget} 
            onAdjustBudget={onAdjustBudget}
          />
        ))}
      </div>
      {!loading && filteredAndSortedBudgets.length === 0 && (
        <div className="p-12 text-center text-gray-500 bg-white border-2 border-dashed rounded-2xl col-span-full">
            <FaWallet className="mx-auto text-5xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold">No Budgets Found</h3>
            <p className="mt-2">No budgets match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default BudgetList;
