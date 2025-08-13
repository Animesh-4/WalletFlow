// src/components/Budget/AdjustBudgetForm.js
import React, { useState } from 'react';
import { useBudgets } from '../../hooks/useBudgets';
import Button from '../Shared/Button';

const AdjustBudgetForm = ({ budget, onFormSubmit, onCancel }) => {
  const { addTransaction, updateBudget } = useBudgets();
  const [actionType, setActionType] = useState('spend');
  const [formData, setFormData] = useState({ amount: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const amount = Number(formData.amount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid positive amount.');
      setLoading(false);
      return;
    }
    try {
      if (actionType === 'spend') {
        if (!formData.description) {
            setError('Description is required for an expense.');
            setLoading(false);
            return;
        }
        await addTransaction({
          amount,
          description: formData.description,
          type: 'expense',
          category: budget.category,
          budget_id: budget.id,
          date: new Date().toISOString(),
        });
      } else if (actionType === 'add') {
        const updatedBudgetData = { ...budget, amount: Number(budget.amount) + amount };
        await updateBudget(budget.id, updatedBudgetData);
      }
      onFormSubmit();
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="mb-4 text-2xl font-bold text-center text-gray-800">Adjust "{budget.name}"</h2>
      <div className="flex justify-center mb-6 space-x-2">
        <button onClick={() => setActionType('spend')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${actionType === 'spend' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
          Add Expense
        </button>
        <button onClick={() => setActionType('add')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${actionType === 'add' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
          Add Money to Budget
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
          <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange}
            className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        {actionType === 'spend' && (
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input type="text" name="description" id="description" value={formData.description} onChange={handleChange}
              className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., Weekly groceries" />
          </div>
        )}
        {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
        <div className="flex justify-end pt-4 space-x-3">
          <Button type="button" onClick={onCancel} variant="secondary">Cancel</Button>
          <Button type="submit" loading={loading} disabled={loading}>
            {loading ? 'Saving...' : 'Submit Change'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdjustBudgetForm;
