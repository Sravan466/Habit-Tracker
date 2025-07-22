import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Flame } from 'lucide-react';
import { useApi } from '../hooks/useApi';

interface Achievement {
  type: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalStreakDays, setTotalStreakDays] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const { apiCall } = useApi();

  const allAchievements = [
    {
      type: 'first-habit',
      title: 'First Step',
      description: 'Created your first habit',
      icon: '🎯',
      requirement: 'Create 1 habit'
    },
    {
      type: '7-day-streak',
      title: 'Week Warrior',
      description: 'Completed 7 days in a row',
      icon: '🔥',
      requirement: '7-day streak'
    },
    {
      type: '30-day-streak',
      title: 'Consistency Champion',
      description: 'Completed 30 days in a row',
      icon: '🏆',
      requirement: '30-day streak'
    },
    {
      type: '100-day-streak',
      title: 'Legendary Streak',
      description: 'Completed 100 days in a row',
      icon: '👑',
      requirement: '100-day streak'
    },
    {
      type: 'week-warrior',
      title: 'Weekly Champion',
      description: 'Completed all habits for a week',
      icon: '⭐',
      requirement: 'Perfect week'
    }
  ];

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const data = await apiCall('/users/achievements');
      setAchievements(data.achievements || []);
      setTotalStreakDays(data.totalStreakDays || 0);
    } catch (error) {
      console.error('Fetch achievements error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const earnedTypes = achievements.map(a => a.type);
  const completionRate = Math.round((achievements.length / allAchievements.length) * 100);

  if (isLoading) {
    return (
      <div className="p-6 pb-24">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-2 mb-6">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Achievements</h1>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-4 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="w-5 h-5" />
              <span className="text-sm text-yellow-100">Earned</span>
            </div>
            <div className="text-2xl font-bold">{achievements.length}</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="w-5 h-5" />
              <span className="text-sm text-purple-100">Progress</span>
            </div>
            <div className="text-2xl font-bold">{completionRate}%</div>
          </div>
        </div>

        {/* Total Streak Days */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Total Streak Days</h3>
              <p className="text-blue-100 text-sm">Your combined streak power</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <Flame className="w-6 h-6" />
                <div className="text-3xl font-bold">{totalStreakDays}</div>
              </div>
              <div className="text-blue-100 text-sm">days</div>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Achievements</h2>
          
          {allAchievements.map((achievement) => {
            const isEarned = earnedTypes.includes(achievement.type);
            const earnedAchievement = achievements.find(a => a.type === achievement.type);
            
            return (
              <motion.div
                key={achievement.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-6 border transition-all ${
                  isEarned
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                    isEarned 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    {isEarned ? achievement.icon : '🔒'}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-semibold ${isEarned ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                        {achievement.title}
                      </h3>
                      {isEarned && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Trophy className="w-5 h-5 text-yellow-500" />
                        </motion.div>
                      )}
                    </div>
                    
                    <p className={`text-sm mb-2 ${isEarned ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                      {achievement.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${isEarned ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {achievement.requirement}
                      </span>
                      
                      {isEarned && earnedAchievement && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Earned {new Date(earnedAchievement.earnedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {achievements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No achievements yet</h3>
            <p className="text-gray-600 dark:text-gray-400">Start completing habits to earn your first achievement!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Achievements;