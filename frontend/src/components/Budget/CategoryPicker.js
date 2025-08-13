// src/components/Budget/CategoryPicker.js
import React from 'react';
import { useBudgets } from '../../hooks/useBudgets';

const CategoryPicker = ({ selectedCategory, onCategoryChange }) => {
  const { categories } = useBudgets();

  return (
    <div>
      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
        Category
      </label>
      <select
        id="category"
        name="category"
        value={selectedCategory}
        onChange={onCategoryChange}
        className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
      >
        <option value="">Select a category</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryPicker;
