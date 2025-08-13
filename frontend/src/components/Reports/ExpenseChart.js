// src/components/Reports/ExpenseChart.js
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FaChartBar } from 'react-icons/fa';

// A new, more diverse color palette for the chart slices
const COLORS = ['#10B981', '#14B8A6', '#38BDF8', '#6366F1', '#8B5CF6', '#EC4899'];

// A custom label function to prevent labels from overlapping on small slices
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Don't render a label if the slice is less than 5% of the total
  if (percent < 0.05) {
    return null;
  }

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-semibold pointer-events-none">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const ExpenseChart = ({ data, loading }) => {
  if (loading) {
    return (
        <div className="flex items-center justify-center h-full min-h-[350px] animate-pulse">
            <div className="text-center text-gray-400">
                <FaChartBar className="mx-auto text-4xl mb-2" />
                <p>Loading Chart Data...</p>
            </div>
        </div>
    );
  }
  
  if (!data || data.length === 0) {
    return (
        <div className="flex items-center justify-center h-full min-h-[350px]">
            <div className="text-center text-gray-500">
                <FaChartBar className="mx-auto text-4xl text-gray-300 mb-2" />
                <p className="font-semibold">No expense data available</p>
                <p className="text-sm">Add some expenses to see them here.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full h-[350px]"> 
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={140}
            fill="#8884d8"
            dataKey="total_spent"
            nameKey="category_name"
            // These two props disable the default click and hover expansion effect
            activeIndex={null}
            activeShape={null}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                // Add a subtle border for better separation
                stroke="#ffffff" 
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => `$${Number(value).toFixed(2)}`}
            cursor={false} // This disables the cursor effect on hover/click
            contentStyle={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                border: '1px solid #e5e7eb'
            }}
          />
          <Legend iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseChart;
