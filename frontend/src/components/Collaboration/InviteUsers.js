// src/components/Collaboration/InviteUsers.js
import React, { useState } from 'react';
import { useBudgets } from '../../hooks/useBudgets';
import Button from '../Shared/Button';

const InviteUsers = ({ budgetId }) => {
  const { inviteUser } = useBudgets(); 
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ message: '', type: '' });
    try {
      await inviteUser(budgetId, email, role);
      setFeedback({ message: 'Invitation sent successfully!', type: 'success' });
      setEmail('');
      setRole('viewer');
    } catch (error) {
      const errorMessage = error.message || 'An unknown error occurred.';
      setFeedback({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6 mt-6 border-t">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Invite New Collaborator</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-grow">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">User's Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com"
            className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)}
            className="w-full pl-3 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
        </div>
        <Button type="submit" loading={loading} disabled={loading} className="sm:w-auto w-full">
          {loading ? 'Sending...' : 'Invite'}
        </Button>
      </form>
      {feedback.message && (
        <p className={`mt-3 text-sm ${feedback.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
          {feedback.message}
        </p>
      )}
    </div>
  );
};

export default InviteUsers;
