// src/components/Transaction/TransactionForm.js
import React, { useState, useEffect } from 'react';
import CategoryPicker from '../Budget/CategoryPicker';
import { useBudgets } from '../../hooks/useBudgets';
import Button from '../Shared/Button';

const TransactionForm = ({ transactionToEdit, onFormSubmit, onCancel }) => {
  const { addTransaction, updateTransaction, loading } = useBudgets();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');

  const isEditing = !!transactionToEdit;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        description: transactionToEdit.description,
        amount: transactionToEdit.amount,
        type: transactionToEdit.type,
        category: transactionToEdit.category_name,
        date: new Date(transactionToEdit.date).toISOString().split('T')[0],
      });
    }
  }, [transactionToEdit, isEditing]);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleCategoryChange = (e) => setFormData((prev) => ({ ...prev, category: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.description || !formData.amount || !formData.category || !formData.date) {
      return setError('All fields are required.');
    }
    try {
      const transactionData = { ...formData, amount: Number(formData.amount) };
      if (isEditing) {
        await updateTransaction(transactionToEdit.id, transactionData);
      } else {
        await addTransaction(transactionData);
      }
      onFormSubmit();
    } catch (err) {
      setError(err.message || 'Failed to save transaction.');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
        {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} placeholder="e.g., Coffee, Paycheck"
            className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} placeholder="e.g., 4.50"
                    className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
            </div>
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select name="type" id="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
            </div>
        </div>
        <CategoryPicker selectedCategory={formData.category} onCategoryChange={handleCategoryChange} />
        <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" name="date" id="date" value={formData.date} onChange={handleChange}
                className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
        </div>
        {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
        <div className="flex justify-end pt-4 space-x-3">
          <Button type="button" onClick={onCancel} variant="secondary">Cancel</Button>
          <Button type="submit" loading={loading} disabled={loading}>
            {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Transaction')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
