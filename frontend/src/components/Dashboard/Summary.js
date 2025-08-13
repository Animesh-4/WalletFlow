// src/components/Dashboard/Summary.js
import React, { useMemo } from 'react';
import { FaArrowUp, FaArrowDown, FaBalanceScale } from 'react-icons/fa';
import { useBudgets } from '../../hooks/useBudgets';

const SummaryCard = ({ title, amount, icon, colorClass }) => (
  <div className={`p-6 bg-white rounded-2xl shadow-lg group transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1`}>
    <div className="flex items-center space-x-4">
        <div className={`p-4 rounded-full ${colorClass.bg} transition-transform duration-300 group-hover:scale-110`}>
          {React.createElement(icon, { className: `h-6 w-6 ${colorClass.text}` })}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">${amount.toFixed(2)}</p>
        </div>
    </div>
  </div>
);

const Summary = () => {
  const { transactions, loading } = useBudgets();

  const { totalIncome, totalExpenses, netBalance } = useMemo(() => {
    let income = 0;
    let expenses = 0;

    if (Array.isArray(transactions)) {
      transactions.forEach(tx => {
        if (tx.type === 'income') {
          income += Number(tx.amount);
        } else {
          expenses += Number(tx.amount);
        }
      });
    }

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: income - expenses,
    };
  }, [transactions]);

  if (loading && (!transactions || transactions.length === 0)) {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Skeleton loaders for a better loading experience */}
            <div className="p-6 bg-gray-200 rounded-2xl animate-pulse h-[96px]"></div>
            <div className="p-6 bg-gray-200 rounded-2xl animate-pulse h-[96px]"></div>
            <div className="p-6 bg-gray-200 rounded-2xl animate-pulse h-[96px]"></div>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <SummaryCard
        title="Total Income"
        amount={totalIncome}
        icon={FaArrowUp}
        colorClass={{ bg: 'bg-green-100', text: 'text-green-600' }}
      />
      <SummaryCard
        title="Total Expenses"
        amount={totalExpenses}
        icon={FaArrowDown}
        colorClass={{ bg: 'bg-red-100', text: 'text-red-600' }}
      />
      <SummaryCard
        title="Net Balance"
        amount={netBalance}
        icon={FaBalanceScale}
        colorClass={{ bg: 'bg-blue-100', text: 'text-blue-600' }}
      />
    </div>
  );
};

export default Summary;
