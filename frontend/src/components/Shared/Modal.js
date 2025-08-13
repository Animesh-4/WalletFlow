// src/components/Shared/Modal.js
import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, children }) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  // This effect handles the entrance and exit animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      // Delay hiding the modal to allow for the exit animation
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ease-in-out ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm"></div>
      <div
        className={`relative w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl transition-all duration-200 ease-in-out transform ${
            isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <button
          onClick={onClose}
          className="absolute top-0 right-0 mt-4 mr-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <FaTimes className="w-6 h-6" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
