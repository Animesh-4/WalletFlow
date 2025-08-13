// src/pages/BudgetsPage.js
import React, { useState } from 'react';
import BudgetList from '../components/Budget/BudgetList';
import BudgetForm from '../components/Budget/BudgetForm';
import AdjustBudgetForm from '../components/Budget/AdjustBudgetForm';
import BudgetDetailModal from '../components/Budget/BudgetDetailModal';
import CollaborationModal from '../components/Collaboration/CollaborationModal'; // Import the collaboration modal
import Modal from '../components/Shared/Modal';
import Button from '../components/Shared/Button';
import { useBudgets } from '../hooks/useBudgets';

const BudgetsPage = () => {
  const { fetchBudgets } = useBudgets();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false);
  
  const [budgetToEdit, setBudgetToEdit] = useState(null);
  const [budgetToAdjust, setBudgetToAdjust] = useState(null);
  const [budgetToView, setBudgetToView] = useState(null);
  const [budgetToShare, setBudgetToShare] = useState(null);

  const handleOpenFormModal = () => {
    setBudgetToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditBudget = (budget) => {
    setBudgetToEdit(budget);
    setIsFormModalOpen(true);
  };

  const handleAdjustBudget = (budget) => {
    setBudgetToAdjust(budget);
    setIsAdjustModalOpen(true);
  };

  const handleViewBudget = (budget) => {
    setBudgetToView(budget);
    setIsDetailModalOpen(true);
  };
  
  const handleShareBudget = (budget) => {
    setBudgetToShare(budget);
    setIsSharingModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsAdjustModalOpen(false);
    setIsDetailModalOpen(false);
    setIsSharingModalOpen(false);
    setBudgetToEdit(null);
    setBudgetToAdjust(null);
    setBudgetToView(null);
    setBudgetToShare(null);
  };

  const handleFormSubmit = () => {
    handleCloseModals();
    fetchBudgets();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Budgets</h1>
        <Button onClick={handleOpenFormModal}>Add New Budget</Button>
      </div>
      
      <BudgetList 
        onEditBudget={handleEditBudget} 
        onAdjustBudget={handleAdjustBudget}
        onViewBudget={handleViewBudget}
        onShareBudget={handleShareBudget}
      />

      <Modal isOpen={isFormModalOpen} onClose={handleCloseModals}>
        <BudgetForm budgetToEdit={budgetToEdit} onFormSubmit={handleFormSubmit} onCancel={handleCloseModals} />
      </Modal>

      <Modal isOpen={isAdjustModalOpen} onClose={handleCloseModals}>
        {budgetToAdjust && <AdjustBudgetForm budget={budgetToAdjust} onFormSubmit={handleFormSubmit} onCancel={handleCloseModals} />}
      </Modal>

      <Modal isOpen={isDetailModalOpen} onClose={handleCloseModals}>
        {budgetToView && <BudgetDetailModal budget={budgetToView} />}
      </Modal>

      {/* This modal for sharing was missing and has now been added back. */}
      <Modal isOpen={isSharingModalOpen} onClose={handleCloseModals}>
        {budgetToShare && <CollaborationModal budget={budgetToShare} />}
      </Modal>
    </>
  );
};

export default BudgetsPage;
