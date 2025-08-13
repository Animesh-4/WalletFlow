// src/components/Auth/ForgotPassword.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HiOutlineBanknotes } from "react-icons/hi2";

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setMessage('If an account with that email exists, a password reset link has been sent.');
    } catch (err) {
      setMessage('If an account with that email exists, a password reset link has been sent.');
      console.error("Forgot password error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-gray-100 to-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl">
        <div className="text-center">
          <HiOutlineBanknotes className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
          <h2 className="text-3xl font-extrabold text-gray-900">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email to receive a reset link
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          {message ? (
            <p className="p-4 text-center text-green-800 bg-green-100 rounded-lg">
              {message}
            </p>
          ) : (
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address" name="email" type="email" autoComplete="email" required
                className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white/80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}

          {!message && (
            <div>
              <button
                type="submit" disabled={loading}
                className="w-full flex justify-center px-4 py-3 text-sm font-medium text-white border border-transparent rounded-lg group bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          )}

          <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500 hover:underline">
              Back to Log In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
