// src/hooks/useSocket.js
import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

export const useSocket = () => {
  // The socket can be null if the user is not authenticated, so we don't throw an error here.
  // Components using this hook should handle the null case.
  return useContext(SocketContext);
};