// src/pages/TransactionsPage.js
import React, { useState } from 'react';
import TransactionList from '../components/Transaction/TransactionList';
import TransactionForm from '../components/Transaction/TransactionForm';
import Modal from '../components/Shared/Modal';
import Button from '../components/Shared/Button';
import { useBudgets } from '../hooks/useBudgets';

const TransactionsPage = () => {
  const { fetchTransactions } = useBudgets();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  const handleOpenModal = () => {
    setTransactionToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction) => {
    setTransactionToEdit(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTransactionToEdit(null);
  };

  const handleFormSubmit = () => {
    handleCloseModal();
    fetchTransactions();
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">All Transactions</h1>
            <p className="mt-1 text-gray-600">
                View, add, and manage all your income and expenses.
            </p>
        </div>
        <div className="mt-4 md:mt-0">
            <Button onClick={handleOpenModal} size="md">Add Transaction</Button>
        </div>
      </div>
      
      <TransactionList onEditTransaction={handleEditTransaction} />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <TransactionForm
          transactionToEdit={transactionToEdit}
          onFormSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
    </>
  );
};

export default TransactionsPage;
