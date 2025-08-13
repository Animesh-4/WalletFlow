// src/components/Shared/Header.js
import React, { useState, useEffect,useRef, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBell, FaUserCircle, FaSignOutAlt, FaCog, FaBars } from 'react-icons/fa';
import NotificationsList from './NotificationsList';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import * as notificationAPI from '../../services/notificationAPI';

const Header = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const data = await notificationAPI.getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (socket) {
      socket.on('new_notification', (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
      });
      return () => socket.off('new_notification');
    }
  }, [socket]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <header className="sticky top-0 z-30 w-full px-4 py-3 bg-white shadow-sm sm:px-6">
      <div className="flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="text-gray-500 lg:hidden focus:outline-none">
          <FaBars className="w-6 h-6" />
        </button>
        <div className="hidden lg:block"></div>
        <div className="flex items-center space-x-4">
          {/* Notifications Bell */}
          <div className="relative">
            <button 
              onClick={() => setNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none"
            >
              <FaBell className="w-5 h-5" />
              {unreadCount > 0 && 
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {unreadCount}
                </span>
              }
            </button>
            {isNotificationsOpen && 
              <NotificationsList 
                notifications={notifications} 
                loading={loading}
                onClose={() => setNotificationsOpen(false)}
                onRefresh={fetchNotifications}
              />
            }
          </div>
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2 focus:outline-none">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <FaUserCircle className="w-9 h-9 text-gray-600" />
              )}
              {user && (
                <span className="hidden text-sm font-semibold text-gray-700 md:block">{user.username || user.name}</span>
              )}
            </button>
            <div className={`absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-200 ease-out ${isDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              <div className="p-1">
                <div className="px-3 py-2 border-b">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user?.username}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <NavLink to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center w-full px-3 py-2 mt-1 text-sm text-left text-gray-700 rounded-md hover:bg-gray-100">
                  <FaCog className="w-4 h-4 mr-2 text-gray-500" /> Profile
                </NavLink>
                <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 text-sm text-left text-red-600 rounded-md hover:bg-red-50">
                  <FaSignOutAlt className="w-4 h-4 mr-2" /> Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
