"use client";
import React, { useEffect } from 'react';
import { FaCheckCircle, FaTimes, FaShoppingCart } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface NotificationCardProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ 
  message, 
  isVisible, 
  onClose, 
  action,
  duration = 5000 
}) => {
  const router = useRouter();

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out transform translate-y-0 opacity-100">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-2 rounded-full">
              <FaCheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{message}</p>
              <p className="text-xs text-gray-500 mt-1">Item has been added to your cart</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>
        
        {action && (
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <button
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaShoppingCart className="h-4 w-4" />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCard; 