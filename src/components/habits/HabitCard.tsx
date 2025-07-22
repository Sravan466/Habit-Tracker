import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Check } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

interface HabitCardProps {
  habit: {
    _id: string;
    name: string;
    color: string;
    icon: string;
    currentStreak: number;
    longestStreak: number;
    completedToday: boolean;
  };
  onToggle: (habitId: string) => Promise<{
    completed: boolean;
    currentStreak: number;
    longestStreak: number;
    achievementUnlocked?: string;
  }>;
}

const colorClasses = {
  blue: 'from-blue-400 to-blue-600',
  green: 'from-green-400 to-green-600',
  purple: 'from-purple-400 to-purple-600',
  orange: 'from-orange-400 to-orange-600',
  red: 'from-red-400 to-red-600',
  pink: 'from-pink-400 to-pink-600',
  indigo: 'from-indigo-400 to-indigo-600',
  teal: 'from-teal-400 to-teal-600',
};

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [localStreak, setLocalStreak] = useState(habit.currentStreak);
  const [isCompleted, setIsCompleted] = useState(habit.completedToday);
  const { width, height } = useWindowSize();

  const handleToggle = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await onToggle(habit._id);
      setIsCompleted(result.completed);
      setLocalStreak(result.currentStreak);

      // Show confetti for streak milestones or achievements
      if (result.completed && (result.currentStreak % 7 === 0 || result.achievementUnlocked)) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (error) {
      console.error('Toggle habit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[habit.color]} rounded-xl flex items-center justify-center text-2xl`}>
              {habit.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{habit.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{habit.description}</p>
            </div>
          </div>

          <motion.button
            onClick={handleToggle}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
              isCompleted
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <AnimatePresence mode="wait">
              {isCompleted ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Check className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-6 h-6"
                />
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{localStreak}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Current</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{habit.longestStreak}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Best</div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default HabitCard;