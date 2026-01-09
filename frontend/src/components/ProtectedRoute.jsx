import React from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const ProtectedRoute = ({ children }) => {
  const resolveStoredUserId = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.userId) {
          return parsedUser.userId;
        }
      } catch (error) {
        console.warn('Failed to parse stored user for ProtectedRoute:', error);
      }
    }
    return localStorage.getItem('userId');
  };

  const storedUserId = resolveStoredUserId();
  const isAuthenticated = (typeof authAPI?.isAuthenticated === 'function' && authAPI.isAuthenticated()) || Boolean(storedUserId);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center px-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Access Restricted</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to access the marketplace and your cart.
          </p>
          <Link
            to="/auth"
            className="block w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors"
          >
            Login Now
          </Link>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            New here?{' '}
            <Link to="/auth" className="text-green-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
