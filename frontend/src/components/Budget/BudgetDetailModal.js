// src/components/Budget/BudgetDetailModal.js
import React, { useState, useEffect } from 'react';
import * as budgetAPI from '../../services/budgetAPI';
import { format } from 'date-fns';
import { FaPlus, FaMinus } from 'react-icons/fa';

const BudgetDetailModal = ({ budget }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await budgetAPI.getBudgetHistory(budget.id);
                setHistory(data);
            } catch (error) {
                console.error("Failed to fetch budget history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [budget.id]);

    return (
        <div className="p-6 bg-white rounded-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{budget.name}</h2>
            <p className="text-gray-500 mb-4">{budget.description || 'No description provided.'}</p>
            <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-2">Adjustment History</h3>
            {loading ? <p>Loading history...</p> : (
                <ul className="space-y-3">
                    {history.map(item => {
                        const isExpense = Number(item.amount) < 0;
                        return (
                            <li key={item.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${isExpense ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        {isExpense ? <FaMinus size={14} /> : <FaPlus size={14} />}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{item.description}</p>
                                        <p className="text-sm text-gray-500">By: {item.user_username} on {format(new Date(item.created_at), 'MMM dd, yyyy')}</p>
                                    </div>
                                </div>
                                <span className={`font-bold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
                                    {isExpense ? '' : '+'}${Number(item.amount).toFixed(2)}
                                </span>
                            </li>
                        );
                    })}
                    {history.length === 0 && <p className="text-gray-500">No adjustments or expenses recorded for this budget yet.</p>}
                </ul>
            )}
        </div>
    );
};

export default BudgetDetailModal;
