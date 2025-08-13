// src/pages/ReportsPage.js
import React from 'react';
import Charts from '../components/Reports/Chart'; // Corrected the import path

const ReportsPage = () => {
  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
        <p className="mt-1 text-gray-600">Visualize your spending and track your progress over time.</p>
      </div>
      
      {/* Charts Component */}
      <Charts />
    </>
  );
};

export default ReportsPage;
