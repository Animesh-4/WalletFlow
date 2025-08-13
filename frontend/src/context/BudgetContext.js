// src/context/BudgetContext.js
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as budgetAPI from '../services/budgetAPI';
import * as transactionAPI from '../services/transactionAPI';
import * as collaborationAPI from '../services/collaborationAPI';

export const BudgetContext = createContext();
export const useBudgets = () => useContext(BudgetContext);

export const BudgetProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Salary', 'Work', 'Other'];

  const fetchBudgets = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await budgetAPI.getAllBudgets();
      setBudgets(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchTransactions = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
        const data = await transactionAPI.getAllTransactions();
        setTransactions(data);
    } catch (err) {
        setError(err.message || 'Failed to fetch transactions');
    } finally {
        setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBudgets();
      fetchTransactions();
    } else {
      setBudgets([]);
      setTransactions([]);
      setCollaborators([]);
      setLoading(false);
    }
  }, [isAuthenticated, fetchBudgets, fetchTransactions]);

  // --- Budget Functions ---
  const addBudget = async (budgetData) => {
    const newBudget = await budgetAPI.createBudget(budgetData);
    setBudgets(prev => [...prev, newBudget]);
  };
  
  const updateBudget = async (id, budgetData) => {
    const updatedBudget = await budgetAPI.updateBudget(id, budgetData);
    setBudgets(prev => prev.map(b => (b.id === id ? updatedBudget : b)));
  };

  const deleteBudget = async (id) => {
    await budgetAPI.deleteBudget(id);
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  // --- Transaction Functions ---
  const addTransaction = async (transactionData) => {
    const newTransaction = await transactionAPI.createTransaction(transactionData);
    setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
    fetchBudgets(); // Refresh budgets to update spending totals
  };
  
  const updateTransaction = async (id, transactionData) => {
    const updatedTransaction = await transactionAPI.updateTransaction(id, transactionData);
    setTransactions(prev => prev.map(t => (t.id === id ? updatedTransaction : t)));
    fetchBudgets();
  };

  const deleteTransaction = async (id) => {
    await transactionAPI.deleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    fetchBudgets();
  };
  
  // --- Collaboration Functions ---
  const fetchCollaborators = async (budgetId) => {
    const data = await collaborationAPI.getCollaborators(budgetId);
    setCollaborators(data);
  };

  const inviteUser = async (budgetId, email, role) => {
    await collaborationAPI.inviteUser(budgetId, { email, role });
    // After sending, we can optionally refetch the list of collaborators
    // if we want to show "pending" invites in the UI.
    await fetchCollaborators(budgetId);
  };

  const removeCollaborator = async (budgetId, userId) => {
    await collaborationAPI.removeUser(budgetId, userId);
    await fetchCollaborators(budgetId);
  };

  const acceptInvitation = async (token) => {
    await collaborationAPI.acceptInvitation(token);
    // After accepting, refetch the budgets list to include the newly shared budget.
    await fetchBudgets();
  };

  const value = { 
    budgets, transactions, categories, collaborators, loading, error, 
    fetchBudgets, addBudget, updateBudget, deleteBudget,
    fetchTransactions, addTransaction, updateTransaction, deleteTransaction,
    fetchCollaborators, inviteUser, removeCollaborator, acceptInvitation
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};
