// src/components/Shared/Loading.js
import React from 'react';
import { PacmanLoader } from 'react-spinners';

const Loading = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
      <PacmanLoader color="#10B981" size={30} />
      <p className="mt-6 text-lg font-semibold text-gray-700">Loading...</p>
    </div>
  );
};

export default Loading;
