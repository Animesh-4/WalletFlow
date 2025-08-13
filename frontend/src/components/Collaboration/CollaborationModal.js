// src/components/Collaboration/CollaborationModal.js
import React from 'react';
import UserList from './UserList';
import InviteUsers from './InviteUsers';

const CollaborationModal = ({ budget }) => {
  return (
    <div className="p-6 bg-white rounded-lg">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">
                Share "{budget.name}"
            </h2>
            <p className="text-sm text-gray-500 mt-1">Invite others to view or edit this budget.</p>
        </div>
        {/* This now passes the budget's owner ID to the UserList component */}
        <UserList budgetId={budget.id} ownerId={budget.user_id} />
        <InviteUsers budgetId={budget.id} />
    </div>
  );
};

export default CollaborationModal;
