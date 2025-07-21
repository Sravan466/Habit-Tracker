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
      updateUser({ theme: newTheme });
    } catch (error) {
      console.error('Theme update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const joinedDate = user ? new Date(user.totalStreakDays || Date.now()).toLocaleDateString('en', {
    month: 'long',
    year: 'numeric'
  }) : '';

  return (
    <div className="p-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-2 mb-6">
          <User className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        </div>

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-blue-100">{user?.email}</p>
              <p className="text-blue-100 text-sm">Member since {joinedDate}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{user?.achievements?.length || 0}</div>
            <div className="text-gray-600 text-sm">Achievements</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{user?.totalStreakDays || 0}</div>
            <div className="text-gray-600 text-sm">Total Streak Days</div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </h3>
          </div>

          <div className="p-4 space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-gray-600" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-500" />
                )}
                <div>
                  <div className="font-medium text-gray-900">Dark Mode</div>
                  <div className="text-sm text-gray-600">
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

            {/* Email */}
            <div className="flex items-center space-x-3 py-2">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Email</div>
                <div className="text-sm text-gray-600">{user?.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        {user?.achievements && user.achievements.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Recent Achievements</h3>
            </div>
            <div className="p-4 space-y-3">
              {user.achievements.slice(-3).map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-lg">
                    {achievement.icon}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{achievement.title}</div>
                    <div className="text-sm text-gray-600">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logout */}
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white py-4 rounded-2xl font-semibold"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Profile;