// src/components/Auth/Login.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { HiOutlineBanknotes } from "react-icons/hi2";

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-gray-100 to-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl">
        <div className="text-center">
          <HiOutlineBanknotes className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
          <h2 className="text-3xl font-extrabold text-gray-900">
            Welcome Back!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address" name="email" type="email" autoComplete="email" required
                className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white/80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Email address" value={email} onChange={onChange}
              />
            </div>
            {/* Password Input with Show/Hide Toggle */}
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required
                className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white/80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Password" value={password} onChange={onChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-emerald-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="font-semibold text-emerald-600 hover:text-emerald-500 hover:underline">
              Forgot your password?
            </Link>
          </div>

          {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}

          <div>
            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center px-4 py-3 text-sm font-medium text-white border border-transparent rounded-lg group bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
          
          <div className="text-sm text-center">
            <Link to="/" className="font-medium text-gray-600 hover:text-emerald-500">
              &larr; Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
