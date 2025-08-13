// src/context/SocketContext.js
import React, { createContext, useEffect, useState, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // This effect should only run when the authentication token changes.
    if (token) {
      // Establish a new connection if we have a token.
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        query: { token },
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket.IO connected successfully!');
      });

      newSocket.on('disconnect', () => {
        console.log('Socket.IO disconnected.');
      });

      // The cleanup function is crucial. It runs when the component unmounts
      // or when the effect re-runs (because the token changed).
      // This ensures we disconnect the old socket before creating a new one.
      return () => newSocket.close();
    } else {
      // If there's no token (user logged out), ensure any existing socket is disconnected.
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
    // By only depending on `token`, we prevent the infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); 

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
