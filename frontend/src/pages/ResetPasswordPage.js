// src/pages/ResetPasswordPage.js
import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Button from '../components/Shared/Button';
import { useAuth } from '../hooks/useAuth';
import { FaKey, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPasswordPage = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = new URLSearchParams(location.search).get('token');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (!token) {
      return setError('Invalid or missing reset token.');
    }
    setStatus('loading');
    setError('');
    try {
      await resetPassword(token, formData.password);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
      setStatus('error');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-gray-100 to-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl">
        <div className="text-center">
            <FaKey className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
            <h2 className="text-3xl font-extrabold text-gray-900">Reset Your Password</h2>
        </div>
        
        {status === 'success' ? (
          <div className="text-center flex flex-col items-center">
            <FaCheckCircle className="text-green-500 text-5xl mb-4" />
            <p className="text-green-600 font-semibold text-lg">Password reset successfully!</p>
            <Link to="/login" className="mt-4 inline-block font-semibold text-emerald-600 hover:underline">
              Proceed to Login &rarr;
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 sr-only">New Password</label>
              <input type={showPassword ? 'text' : 'password'} name="password" id="password" required minLength="6"
                value={formData.password} onChange={handleChange} placeholder="New Password"
                className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white/80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-emerald-600">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 sr-only">Confirm New Password</label>
              <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" id="confirmPassword" required
                value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm New Password"
                className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white/80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-emerald-600">
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
            <Button type="submit" loading={status === 'loading'} className="w-full !mt-6">
              {status === 'loading' ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
