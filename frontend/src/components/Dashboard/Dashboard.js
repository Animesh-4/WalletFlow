// src/components/Dashboard/Dashboard.js
import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import Summary from './Summary';
import RecentActivity from './RecentActivity';
import ExpenseChart from '../Reports/ExpenseChart';
import * as reportAPI from '../../services/reportAPI';
import { useBudgets } from '../../hooks/useBudgets';
import { useAuth } from '../../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const { transactions } = useBudgets(); 
  const [summaryData, setSummaryData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [activeDate, setActiveDate] = useState(new Date());

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
      setActiveDate(new Date(sortedTransactions[0].date));
    } else {
      setActiveDate(new Date());
    }
  }, [transactions]);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoadingChart(true);
      try {
        const month = activeDate.getMonth() + 1;
        const year = activeDate.getFullYear();
        
        // console.log(`[Dashboard] Fetching chart data for month: ${month}, year: ${year}`);
        
        const data = await reportAPI.getSpendingSummary(month, year);

        // console.log('[Dashboard] API response for chart data:', data);

        setSummaryData(data);
      } catch (error) {
        // console.error("[Dashboard] Error fetching chart data:", error);
        setSummaryData([]);
      } finally {
        setLoadingChart(false);
      }
    };
    fetchChartData();
  }, [activeDate]);

  // This ensures that the data passed to the chart is correctly formatted with numbers.
  const dataForChart = useMemo(() => {
    if (!Array.isArray(summaryData)) return [];
    return summaryData.map(item => ({
        ...item,
        total_spent: Number(item.total_spent)
    }));
  }, [summaryData]);

  const handleDateChange = (e) => {
    const [year, month] = e.target.value.split('-');
    setActiveDate(new Date(year, month - 1, 15));
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username || 'User'}!
          </h1>
          <p className="text-gray-600 mt-1">Here's a snapshot of your financial health.</p>
        </div>
        <div className="mt-4 md:mt-0">
            <label htmlFor="dashboard-month-select" className="sr-only">Select Month</label>
            <input
                id="dashboard-month-select"
                type="month"
                value={format(activeDate, 'yyyy-MM')}
                onChange={handleDateChange}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
        </div>
      </div>
      
      <Summary />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Spending Breakdown for {format(activeDate, 'MMMM yyyy')}
          </h3>
          <ExpenseChart data={dataForChart} loading={loadingChart} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
