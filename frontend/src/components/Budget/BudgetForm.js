// src/components/Budget/BudgetForm.js
import React, { useState, useEffect } from 'react';
import CategoryPicker from './CategoryPicker';
import { useBudgets } from '../../hooks/useBudgets';
import Button from '../Shared/Button';

const BudgetForm = ({ budgetToEdit, onFormSubmit, onCancel }) => {
  const { addBudget, updateBudget, loading } = useBudgets();
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    is_recurring: false,
    description: '',
  });
  const [error, setError] = useState('');

  const isEditing = !!budgetToEdit;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        name: budgetToEdit.name || '',
        amount: budgetToEdit.amount || '',
        category: budgetToEdit.category || '',
        is_recurring: budgetToEdit.is_recurring || false,
        description: budgetToEdit.description || '',
      });
    }
  }, [budgetToEdit, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
    }));
  };
  
  const handleCategoryChange = (e) => {
    setFormData((prev) => ({ ...prev, category: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.amount || !formData.category) {
      return setError('All fields are required.');
    }
    try {
      const budgetData = { ...formData, amount: Number(formData.amount) };
      if (isEditing) {
        await updateBudget(budgetToEdit.id, budgetData);
      } else {
        await addBudget(budgetData);
      }
      onFormSubmit();
    } catch (err) {
      setError(err.message || 'Failed to save budget.');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
        {isEditing ? 'Edit Budget' : 'Create New Budget'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Budget Name</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} placeholder="e.g., Groceries"
                className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Total Amount ($)</label>
            <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} placeholder="e.g., 500"
                className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <CategoryPicker selectedCategory={formData.category} onCategoryChange={handleCategoryChange} />
        <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="3"
                className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Add a short description for this budget..."></textarea>
        </div>
        <div className="flex items-center justify-between pt-2">
            <label htmlFor="is_recurring" className="text-sm font-medium text-gray-700">Recurring Monthly Budget</label>
            <input type="checkbox" name="is_recurring" id="is_recurring" checked={formData.is_recurring} onChange={handleChange}
                className="h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
        </div>
        {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
        <div className="flex justify-end pt-4 space-x-3">
          <Button type="button" onClick={onCancel} variant="secondary">Cancel</Button>
          <Button type="submit" loading={loading} disabled={loading}>
            {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Budget')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BudgetForm;
