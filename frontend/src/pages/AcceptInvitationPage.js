// src/pages/AcceptInvitationPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useBudgets } from '../hooks/useBudgets';
import Button from '../components/Shared/Button';
import { useAuth } from '../hooks/useAuth';
import { FaCheckCircle, FaExclamationCircle, FaSignInAlt } from 'react-icons/fa';

const AcceptInvitationPage = () => {
  const { acceptInvitation } = useBudgets();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setStatus('requiresLogin');
      return;
    }
    if (!token) {
      setError('No invitation token was found in the URL.');
      setStatus('error');
      return;
    }
    const processInvitation = async () => {
      try {
        await acceptInvitation(token);
        setStatus('success');
        setTimeout(() => navigate('/budgets'), 3000);
      } catch (err) {
        setError(err.message || 'Failed to accept the invitation.');
        setStatus('error');
      }
    };
    processInvitation();
  }, [isAuthenticated, authLoading, token, acceptInvitation, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return <p className="text-gray-600 animate-pulse">Verifying your invitation...</p>;
      case 'success':
        return (
            <div className="flex flex-col items-center">
                <FaCheckCircle className="text-green-500 text-5xl mb-4" />
                <p className="text-green-600 font-semibold text-lg">Invitation accepted!</p>
                <p className="text-gray-600 mt-2">Redirecting you to your budgets...</p>
            </div>
        );
      case 'error':
        return (
            <div className="flex flex-col items-center">
                <FaExclamationCircle className="text-red-500 text-5xl mb-4" />
                <p className="text-red-600 font-semibold text-lg">Failed to Accept Invitation</p>
                <p className="text-gray-600 mt-2">{error}</p>
                <Button onClick={() => navigate('/dashboard')} className="mt-6">Go to Dashboard</Button>
            </div>
        );
      case 'requiresLogin':
        return (
            <div className="flex flex-col items-center">
                <FaSignInAlt className="text-gray-400 text-5xl mb-4" />
                <p className="text-gray-800 mb-4">Please log in to accept this invitation.</p>
                <Button onClick={() => navigate(`/login?redirect=${location.pathname}${location.search}`)}>
                    Proceed to Login
                </Button>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Accept Budget Invitation</h2>
        {renderContent()}
      </div>
    </div>
  );
};

export default AcceptInvitationPage;
