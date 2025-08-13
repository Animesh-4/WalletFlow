/**
 * @file index.js
 * @description The entry point of the React application.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import Tailwind CSS base styles
import './styles/index.css';

// Create a root element for React to render into.
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the main App component.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
