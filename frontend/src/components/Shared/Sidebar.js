// src/components/Shared/Sidebar.js
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaWallet, FaChartBar, FaExchangeAlt, FaUser, FaSignOutAlt, FaTimes, FaUsers, FaUserCircle } from 'react-icons/fa';
import { HiOutlineBanknotes } from "react-icons/hi2";

import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', icon: FaTachometerAlt, text: 'Dashboard' },
    { to: '/budgets', icon: FaWallet, text: 'Budgets' },
    { to: '/transactions', icon: FaExchangeAlt, text: 'Transactions' },
    { to: '/reports', icon: FaChartBar, text: 'Reports' },
    { to: '/sharing', icon: FaUsers, text: 'Sharing' },
  ];

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-gray-900 bg-opacity-50 lg:hidden transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
      <aside className={`fixed top-0 left-0 z-40 flex flex-col h-screen w-64 bg-gray-800 text-gray-100 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <div className="flex items-center">
            <HiOutlineBanknotes className="w-8 h-8 text-emerald-400" />
            <span className="ml-3 text-xl font-bold">WalletFlow</span>
          </div>
          <button className="text-gray-400 lg:hidden hover:text-white" onClick={() => setSidebarOpen(false)}>
            <FaTimes className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navLinks.map((link) => (
            <NavLink key={link.text} to={link.to} className={({ isActive }) => `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 group ${isActive ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
              onClick={() => setSidebarOpen(false)}>
              <link.icon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-white transition-colors duration-200" />
              {link.text}
            </NavLink>
          ))}
        </nav>
        <div className="px-2 py-4 border-t border-gray-700">
            <div className="flex items-center px-3 py-2 mb-2">
                {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                    <FaUserCircle className="w-10 h-10 text-gray-500" />
                )}
                <div className="ml-3">
                    <p className="text-sm font-semibold text-white truncate" title={user?.username}>{user?.username || 'User'}</p>
                    <p className="text-xs text-gray-400 truncate" title={user?.email}>{user?.email}</p>
                </div>
            </div>
            <NavLink to="/profile" className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white group"
                onClick={() => setSidebarOpen(false)}>
                <FaUser className="w-5 h-5 mr-3 text-gray-400 group-hover:text-white transition-colors duration-200"/>
                Profile
            </NavLink>
            <button onClick={handleLogout} className="flex items-center w-full px-3 py-2.5 mt-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white group">
                <FaSignOutAlt className="w-5 h-5 mr-3 text-gray-400 group-hover:text-white transition-colors duration-200"/>
                Sign Out
            </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;