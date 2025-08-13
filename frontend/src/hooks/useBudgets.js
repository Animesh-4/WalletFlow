// src/hooks/useBudgets.js
import { useContext } from 'react';
import { BudgetContext } from '../context/BudgetContext';

/**
 * Custom hook to access the BudgetContext.
 * This is the single, authoritative source for this hook.
 * It simplifies accessing budget and transaction data throughout the app.
 */
export const useBudgets = () => {
  const context = useContext(BudgetContext);
  
  // This check is a helpful debugging tool. If a component that is not
  // wrapped in the BudgetProvider tries to use this hook, this error will
  // immediately point to the problem.
  if (context === undefined) {
    throw new Error('useBudgets must be used within a BudgetProvider');
  }
  
  return context;
};
