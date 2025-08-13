// src/components/Reports/Charts.js
import React, { useState, useEffect, useMemo } from 'react';
import ExpenseChart from './ExpenseChart';
import MonthlyReport from './MonthlyReport';
import * as reportAPI from '../../services/reportAPI';
import { useBudgets } from '../../hooks/useBudgets';
import { format } from 'date-fns';

const Charts = () => {
  const { transactions } = useBudgets();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [summaryData, setSummaryData] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      setError('');
      try {
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const [summary, report] = await Promise.all([
          reportAPI.getSpendingSummary(month, year),
          reportAPI.getMonthlyReport(month, year)
        ]);
        setSummaryData(summary);
        setReportData(report);
      } catch (err) {
        setError('Failed to load report data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [currentDate, transactions]);

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
    setCurrentDate(new Date(year, month - 1, 15));
  };

  const hasData = !loading && (summaryData.length > 0 || (reportData && (reportData.totalIncome > 0 || reportData.totalExpenses > 0)));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-end">
        <input
          id="month-select"
          type="month"
          value={format(currentDate, 'yyyy-MM')}
          onChange={handleDateChange}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {error && <div className="p-4 text-center text-red-600 bg-red-100 rounded-lg">{error}</div>}
      
      {loading ? (
        <div className="text-center text-gray-500">Loading reports...</div>
      ) : hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 p-6 bg-white rounded-2xl shadow-lg">
            <ExpenseChart data={dataForChart} loading={loading} />
          </div>
          <div className="lg:col-span-2 p-6 bg-white rounded-2xl shadow-lg">
            <MonthlyReport data={reportData} loading={loading} />
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500 bg-white border-2 border-dashed rounded-2xl">
            <h3 className="text-xl font-semibold">No Data for this Period</h3>
            <p className="mt-2">There are no transactions recorded for the selected month.</p>
        </div>
      )}
    </div>
  );
};

export default Charts;
