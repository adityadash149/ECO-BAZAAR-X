import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { authAPI, customerAPI } from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Retrieve stored user and extract userId, since Login.jsx stores the full object
  const currentUser = authAPI.getCurrentUser();
  const userId = currentUser?.userId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!userId) {
          if (localStorage.getItem('token')) {
            throw new Error('Session data invalid. Please log out and log in again.');
          }
          throw new Error('No user ID found. Please log in.');
        }

        const response = await customerAPI.getCustomerProfile(userId);
        console.log('Fetched Profile Data:', response.data);
        setProfile(response.data);
        setError(null);
      } catch (err) {
        console.error('Error loading profile data', err);
        setError(err.message || 'Could not load profile. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleLogout = () => {
    authAPI.logout();
    navigate('/');
    window.location.reload();
  };

  const formatAddress = (p) => {
    if (!p) return 'Not Set';
    const parts = [p.streetAddress, p.city, p.state, p.zipCode, p.country].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
    return p.address || 'Not Set';
  };

  const formatName = (p) => {
    if (!p) return 'N/A';
    if (p.firstName || p.lastName) {
      return `${p.firstName || ''} ${p.lastName || ''}`.trim();
    }
    return p.name || 'User';
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center">
        <div className="text-xl dark:text-white">Loading Profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 flex justify-center">
        {/* Offer login navigation when auth state is invalid */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-red-500">{error}</div>
          <button
            onClick={() => navigate('/auth')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pt-24 flex justify-center">
        <div className="text-xl dark:text-white">User not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-10 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">User Profile</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <FaSignOutAlt />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b dark:border-gray-600 pb-2">
            Personal Details
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-500 dark:text-gray-400">Name:</span>
              <span className="text-gray-900 dark:text-white font-medium">{formatName(profile)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-500 dark:text-gray-400">Email:</span>
              <span className="text-gray-900 dark:text-white">{profile.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-500 dark:text-gray-400">Contact:</span>
              <span className="text-gray-900 dark:text-white">{profile.phone || 'Not Set'}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="font-medium text-gray-500 dark:text-gray-400 mt-1">Address:</span>
              <span className="text-gray-900 dark:text-white text-right max-w-xs leading-tight">{formatAddress(profile)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b dark:border-gray-600 pb-2">
            Carbon Analytics
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800 text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Carbon Saved</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {profile.carbonSaved || 0} <span className="text-base font-normal text-gray-500">kg</span>
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Eco Points</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{profile.ecoPoints || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
