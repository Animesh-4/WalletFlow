// src/context/BudgetContext.js
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as budgetAPI from '../services/budgetAPI';
import * as transactionAPI from '../services/transactionAPI';
import * as collaborationAPI from '../services/collaborationAPI';
import * as categoryAPI from '../services/categoryAPI';

export const BudgetContext = createContext();
export const useBudgets = () => useContext(BudgetContext);

export const BudgetProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);


  const fetchCategories = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
        const data = await categoryAPI.getAllCategories();
        setCategories(data);
    } catch (err) {
        console.error("Failed to fetch categories:", err);
    }
  }, [isAuthenticated]);

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
      fetchCategories();
    } else {
      setBudgets([]);
      setTransactions([]);
      setCategories([]);
      setCollaborators([]);
      setLoading(false);
    }
  }, [isAuthenticated,fetchCategories, fetchBudgets, fetchTransactions]);

  const addBudget = useCallback(async (budgetData) => {
    const newBudget = await budgetAPI.createBudget(budgetData);
    setBudgets(prev => [...prev, newBudget]);
  }, []);
  
  const updateBudget = useCallback(async (id, budgetData) => {
    const updatedBudget = await budgetAPI.updateBudget(id, budgetData);
    setBudgets(prev => prev.map(b => (b.id === id ? updatedBudget : b)));
  }, []);

  const deleteBudget = useCallback(async (id) => {
    await budgetAPI.deleteBudget(id);
    setBudgets(prev => prev.filter(b => b.id !== id));
  }, []);

  // --- Transaction Functions ---
  const addTransaction = useCallback(async (transactionData) => {
    const newTransaction = await transactionAPI.createTransaction(transactionData);
    setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
    fetchBudgets(); // Refresh budgets to update spending totals
  }, [fetchBudgets]);
  
  const updateTransaction = useCallback(async (id, transactionData) => {
    const updatedTransaction = await transactionAPI.updateTransaction(id, transactionData);
    setTransactions(prev => prev.map(t => (t.id === id ? updatedTransaction : t)));
    fetchBudgets();
  }, [fetchBudgets]);

  const deleteTransaction = useCallback(async (id) => {
    await transactionAPI.deleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    fetchBudgets();
  }, [fetchBudgets]);
  
  // --- Collaboration Functions ---
  const fetchCollaborators = useCallback(async (budgetId) => {
    const data = await collaborationAPI.getCollaborators(budgetId);
    setCollaborators(data);
  }, []);

  const inviteUser = useCallback(async (budgetId, email, role) => {
    await collaborationAPI.inviteUser(budgetId, { email, role });
    // After sending, we can optionally refetch the list of collaborators
    // if we want to show "pending" invites in the UI.
    await fetchCollaborators(budgetId);
  }, [fetchCollaborators]);

  const removeCollaborator = useCallback(async (budgetId, userId) => {
    await collaborationAPI.removeUser(budgetId, userId);
    await fetchCollaborators(budgetId);
  }, [fetchCollaborators]);

  const acceptInvitation = useCallback(async (token) => {
    await collaborationAPI.acceptInvitation(token);
    // After accepting, refetch the budgets list to include the newly shared budget.
    await fetchBudgets();
  }, [fetchBudgets]);

  const value = React.useMemo(() => ({ 
    budgets, transactions, categories, collaborators, loading, error,
    fetchBudgets, addBudget, updateBudget, deleteBudget,
    fetchTransactions, addTransaction, updateTransaction, deleteTransaction,
    fetchCollaborators, inviteUser, removeCollaborator, acceptInvitation
  }), [
    budgets, transactions, categories, collaborators, loading, error,
    fetchBudgets, addBudget, updateBudget, deleteBudget,
    fetchTransactions, addTransaction, updateTransaction, deleteTransaction,
    fetchCollaborators, inviteUser, removeCollaborator, acceptInvitation
  ]);

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};
