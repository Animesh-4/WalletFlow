// src/components/Collaboration/UserList.js
import React, { useEffect } from 'react';
import { useBudgets } from '../../hooks/useBudgets';
import { useAuth } from '../../hooks/useAuth';
import { FaCrown, FaTrash, FaUserCircle } from 'react-icons/fa';

const UserList = ({ budgetId, ownerId }) => {
  const { collaborators, fetchCollaborators, removeCollaborator } = useBudgets();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (budgetId) {
      fetchCollaborators(budgetId);
    }
  }, [budgetId, fetchCollaborators]);

  const handleRemove = (userId) => {
    if (window.confirm('Are you sure you want to remove this user from the budget?')) {
      removeCollaborator(budgetId, userId);
    }
  };

  // Check if the currently logged-in user is the owner of this budget
  const isCurrentUserOwner = currentUser.id === ownerId;

  return (
    <div className="mt-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Shared With</h3>
      <ul className="space-y-3">
        {Array.isArray(collaborators) && collaborators.length > 0 ? (
          collaborators.map((user) => (
            <li key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
              <div className="flex items-center">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <FaUserCircle className="w-10 h-10 text-gray-300" />
                )}
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{user.username} {user.role === 'owner' && <FaCrown className="inline mb-1 ml-1 text-yellow-500" title="Owner"/>}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 text-sm font-medium text-gray-700 capitalize bg-gray-200 rounded-full">
                  {user.role}
                </span>
                {/* Show the remove button ONLY if the current user is the owner AND this is not the owner's own entry */}
                {isCurrentUserOwner && user.id !== ownerId && (
                  <button onClick={() => handleRemove(user.id)} className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors" aria-label="Remove user">
                      <FaTrash />
                  </button>
                )}
              </div>
            </li>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">This budget has not been shared with anyone yet.</p>
        )}
      </ul>
    </div>
  );
};

export default UserList;
