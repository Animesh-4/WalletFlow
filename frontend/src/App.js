// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// Import Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import BudgetsPage from './pages/BudgetsPage';
import TransactionsPage from './pages/TransactionsPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import SharingPage from './pages/SharingPage';
import AcceptInvitationPage from './pages/AcceptInvitationPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Import Shared Components
import Header from './components/Shared/Header';
import Sidebar from './components/Shared/Sidebar';
import Loading from './components/Shared/Loading';

// Import Context Providers and Hooks
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { BudgetProvider } from './context/BudgetContext';
import { SocketProvider } from './context/SocketContext';

// Import Global Styles
import './styles/App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  return user ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BudgetProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Private Routes */}
              <Route path="/dashboard" element={<PrivateRoute><AppLayout><DashboardPage /></AppLayout></PrivateRoute>} />
              <Route path="/budgets" element={<PrivateRoute><AppLayout><BudgetsPage /></AppLayout></PrivateRoute>} />
              <Route path="/transactions" element={<PrivateRoute><AppLayout><TransactionsPage /></AppLayout></PrivateRoute>} />
              <Route path="/reports" element={<PrivateRoute><AppLayout><ReportsPage /></AppLayout></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><AppLayout><ProfilePage /></AppLayout></PrivateRoute>} />
              <Route path="/sharing" element={<PrivateRoute><AppLayout><SharingPage /></AppLayout></PrivateRoute>} />

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </BudgetProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
