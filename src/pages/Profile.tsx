import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Moon, Sun, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';

const Profile: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { apiCall } = useApi();
  const [isDarkMode, setIsDarkMode] = useState(user?.theme === 'dark');
  const [isLoading, setIsLoading] = useState(false);

  const handleThemeToggle = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const newTheme = isDarkMode ? 'light' : 'dark';
    
    try {
      await apiCall('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ theme: newTheme }),
      });
      
      setIsDarkMode(!isDarkMode);
      updateUser({ ...user, theme: newTheme });
    } catch (error) {
      console.error('Theme update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const joinedDate = user ? new Date(user.joinedAt || Date.now()).toLocaleDateString('en', {
    month: 'long',
    year: 'numeric'
  }) : '';

  return (
    <div className="p-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Profile Header */}
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{user?.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">Joined {joinedDate}</p>
        </div>

        {/* User Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>User Information</span>
            </h3>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </h3>
          </div>

          <div className="p-4 space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-500" />
                )}
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Dark Mode</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {isDarkMode ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>
              
              <motion.button
                onClick={handleThemeToggle}
                disabled={isLoading}
                whileTap={{ scale: 0.95 }}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <motion.div
                  animate={{ x: isDarkMode ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                />
              </motion.button>
            </div>

            {/* Logout Button */}
            <motion.button
              onClick={handleLogout}
              whileTap={{ scale: 0.95 }}
              className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white p-3 rounded-xl font-medium hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;