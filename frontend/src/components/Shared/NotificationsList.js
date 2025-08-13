// src/components/Shared/NotificationsList.js
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { FaInbox } from 'react-icons/fa';
import * as notificationAPI from '../../services/notificationAPI';
import Button from './Button';

const NotificationsList = ({ notifications, loading, onClose, onRefresh }) => {
    
    const handleMarkAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            onRefresh(); // Refresh the list to show the changes
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.is_read) {
            try {
                await notificationAPI.markAsRead(notif.id);
                onRefresh();
            } catch (error) {
                console.error("Failed to mark notification as read:", error);
            }
        }
        onClose();
    };

    const hasUnread = notifications.some(n => !n.is_read);

    return (
        <div className="absolute right-0 w-80 mt-2 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                {hasUnread && (
                    <Button onClick={handleMarkAllAsRead} size="sm" variant="secondary">
                        Mark all as read
                    </Button>
                )}
            </div>
            <div className="py-1 max-h-96 overflow-y-auto">
                {loading ? (
                    <p className="p-4 text-sm text-gray-500 text-center">Loading...</p>
                ) : notifications.length > 0 ? (
                    notifications.map(notif => (
                        <Link 
                            key={notif.id} 
                            to={notif.link_url || '#'} 
                            onClick={() => handleNotificationClick(notif)}
                            className={`block px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-100 ${
                                !notif.is_read ? 'bg-emerald-50' : ''
                            }`}
                        >
                            <p className={!notif.is_read ? 'font-semibold' : ''}>{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                            </p>
                        </Link>
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        <FaInbox className="mx-auto text-4xl text-gray-300 mb-2" />
                        <p>You have no new notifications.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsList;
