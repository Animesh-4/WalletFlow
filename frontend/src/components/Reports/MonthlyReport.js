// src/components/Reports/MonthlyReport.js
import React from 'react';
import { format } from 'date-fns';

const MonthlyReport = ({ data, loading }) => {
  if (loading) {
    return <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded-md w-3/4"></div>
        <div className="h-6 bg-gray-200 rounded-md w-full"></div>
        <div className="h-6 bg-gray-200 rounded-md w-full"></div>
        <div className="h-6 bg-gray-200 rounded-md w-full"></div>
    </div>;
  }

  if (!data) {
    return <p className="text-gray-500">No report data available.</p>;
  }

  const reportMonth = data.month ? format(new Date(data.month), 'MMMM yyyy') : 'Current Month';

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">Report for {reportMonth}</h3>
      <div className="space-y-3">
        <div className="flex justify-between p-3 bg-green-50 rounded-lg">
          <span className="font-medium text-gray-600">Total Income</span>
          <span className="font-semibold text-green-600">+${Number(data.totalIncome).toFixed(2)}</span>
        </div>
        <div className="flex justify-between p-3 bg-red-50 rounded-lg">
          <span className="font-medium text-gray-600">Total Expenses</span>
          <span className="font-semibold text-red-600">-${Number(data.totalExpenses).toFixed(2)}</span>
        </div>
        <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
          <span className="font-bold text-gray-800">Net Savings</span>
          <span className="font-bold text-blue-600">${Number(data.netSavings).toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-semibold text-gray-800 mb-2">Top Spending Categories</h4>
        <ul className="space-y-2">
          {data.topCategories && data.topCategories.length > 0 ? (
            data.topCategories.map((item) => (
              <li key={item.category_name} className="flex justify-between p-2 bg-gray-100 rounded-md text-sm">
                <span>{item.category_name}</span>
                <span className="font-medium">${Number(item.amount).toFixed(2)}</span>
              </li>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No expenses recorded for this month.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default MonthlyReport;
