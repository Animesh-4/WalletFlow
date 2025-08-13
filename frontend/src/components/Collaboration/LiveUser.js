// src/components/Collaboration/LiveUsers.js
import React, { useEffect, useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { FaUserCircle } from 'react-icons/fa';

const LiveUsers = () => {
  const socket = useSocket();
  const [liveUsers, setLiveUsers] = useState([]);

  useEffect(() => {
    if (socket) {
      // Listen for updates to the list of live users
      socket.on('liveUsers', (users) => {
        setLiveUsers(users);
      });

      // Clean up the listener when the component unmounts
      return () => {
        socket.off('liveUsers');
      };
    }
  }, [socket]);

  // Don't render the component if there's only one user (yourself) or none
  if (!liveUsers || liveUsers.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex -space-x-2 overflow-hidden">
        {liveUsers.map((user) => (
          <div key={user.id} className="group relative">
            <FaUserCircle 
              className="inline-block w-8 h-8 rounded-full ring-2 ring-white text-gray-300 bg-white transition-transform transform group-hover:scale-110"
              title={user.username || user.email}
            />
            <div className="absolute bottom-full mb-2 w-max px-2 py-1 text-xs text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {user.username || user.email}
            </div>
          </div>
        ))}
      </div>
      <span className="text-sm font-medium text-gray-600 hidden sm:block">
        {liveUsers.length} users online
      </span>
    </div>
  );
};

export default LiveUsers;
