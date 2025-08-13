// src/pages/SharingPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { useBudgets } from '../hooks/useBudgets';
import { useAuth } from '../hooks/useAuth';
import { FaShareAlt, FaWallet, FaUserLock, FaUsers } from 'react-icons/fa';
import Modal from '../components/Shared/Modal';
import CollaborationModal from '../components/Collaboration/CollaborationModal';
import Loading from '../components/Shared/Loading';
import Button from '../components/Shared/Button';

const SharingPage = () => {
  const { budgets, fetchBudgets, loading } = useBudgets();
  const { user: currentUser } = useAuth();
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false);
  const [budgetToShare, setBudgetToShare] = useState(null);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const { personalBudgets, sharedBudgets } = useMemo(() => {
    const personal = [];
    const shared = [];
    if (Array.isArray(budgets)) {
      budgets.forEach(budget => {
        // A budget is personal if the current user is the owner AND it has only 1 collaborator (themselves).
        if (budget.user_id === currentUser.id && Number(budget.collaborator_count) === 1) {
          personal.push(budget);
        } else {
          shared.push(budget);
        }
      });
    }
    return { personalBudgets: personal, sharedBudgets: shared };
  }, [budgets, currentUser.id]);

  const handleShareBudget = (budget) => {
    setBudgetToShare(budget);
    setIsSharingModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsSharingModalOpen(false);
    setBudgetToShare(null);
  };

  const BudgetListItem = ({ budget }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div>
        <p className="font-bold text-gray-900">{budget.name}</p>
        <p className="text-sm text-gray-500">
          Total Amount: ${Number(budget.amount).toFixed(2)}
        </p>
      </div>
      <Button onClick={() => handleShareBudget(budget)} size="sm">
        <FaShareAlt className="mr-2" />
        Manage Sharing
      </Button>
    </div>
  );

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Budget Sharing</h1>
        <p className="mt-1 text-gray-600">
          Manage who has access to your budgets. Invite collaborators to view or edit.
        </p>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-8">
          {/* Personal Budgets Section */}
          <div className="p-6 bg-white rounded-2xl shadow-lg">
            <div className="flex items-center mb-4">
              <FaUserLock className="text-2xl text-gray-400 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">Personal Budgets</h2>
            </div>
            <div className="space-y-4">
              {personalBudgets.length > 0 ? (
                personalBudgets.map((budget) => <BudgetListItem key={budget.id} budget={budget} />)
              ) : (
                <p className="text-center text-gray-500 py-8">You have no personal, unshared budgets.</p>
              )}
            </div>
          </div>

          {/* Shared Budgets Section */}
          <div className="p-6 bg-white rounded-2xl shadow-lg">
            <div className="flex items-center mb-4">
              <FaUsers className="text-2xl text-emerald-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">Shared Budgets</h2>
            </div>
            <div className="space-y-4">
              {sharedBudgets.length > 0 ? (
                sharedBudgets.map((budget) => <BudgetListItem key={budget.id} budget={budget} />)
              ) : (
                <p className="text-center text-gray-500 py-8">No budgets have been shared with you or by you.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={isSharingModalOpen} onClose={handleCloseModal}>
        {budgetToShare && <CollaborationModal budget={budgetToShare} />}
      </Modal>
    </>
  );
};

export default SharingPage;
