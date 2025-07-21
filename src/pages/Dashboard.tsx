import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Flame, Calendar } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import HabitCard from '../components/habits/HabitCard';
import AddHabitModal from '../components/habits/AddHabitModal';
import AchievementModal from '../components/achievements/AchievementModal';

interface Habit {
  _id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
}

const Dashboard: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [achievementToShow, setAchievementToShow] = useState<any>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  
  const { apiCall } = useApi();
  const { user } = useAuth();

  const today = new Date().toLocaleDateString('en', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const data = await apiCall('/habits');
      setHabits(data);
    } catch (error) {
      console.error('Fetch habits error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHabit = async (habitData: {
    name: string;
    description: string;
    color: string;
    icon: string;
  }) => {
    try {
      const newHabit = await apiCall('/habits', {
        method: 'POST',
        body: JSON.stringify(habitData),
      });

      setHabits([newHabit, ...habits]);

      // Show achievement if unlocked
      if (newHabit.achievementUnlocked) {
        const achievementTypes = {
          'first-habit': {
            type: 'first-habit',
            title: 'First Step',
            description: 'Created your first habit',
            icon: '🎯'
          }
        };
        
        const achievement = achievementTypes[newHabit.achievementUnlocked as keyof typeof achievementTypes];
        if (achievement) {
          setAchievementToShow(achievement);
          setShowAchievementModal(true);
        }
      }
    } catch (error) {
      console.error('Add habit error:', error);
      throw error;
    }
  };

  const handleToggleHabit = async (habitId: string) => {
    try {
      const result = await apiCall(`/habits/${habitId}/toggle`, {
        method: 'POST',
      });

      // Update local state
      setHabits(habits.map(habit => 
        habit._id === habitId 
          ? { 
              ...habit, 
              completedToday: result.completed,
              currentStreak: result.currentStreak,
              longestStreak: result.longestStreak
            }
          : habit
      ));

      // Show achievement if unlocked
      if (result.achievementUnlocked) {
        const achievementTypes = {
          '7-day-streak': {
            type: '7-day-streak',
            title: 'Week Warrior',
            description: 'Completed 7 days in a row',
            icon: '🔥'
          },
          '30-day-streak': {
            type: '30-day-streak',
            title: 'Consistency Champion',
            description: 'Completed 30 days in a row',
            icon: '🏆'
          },
          '100-day-streak': {
            type: '100-day-streak',
            title: 'Legendary Streak',
            description: 'Completed 100 days in a row',
            icon: '👑'
          }
        };
        
        const achievement = achievementTypes[result.achievementUnlocked as keyof typeof achievementTypes];
        if (achievement) {
          setAchievementToShow(achievement);
          setShowAchievementModal(true);
        }
      }

      return result;
    } catch (error) {
      console.error('Toggle habit error:', error);
      throw error;
    }
  };

  const completedToday = habits.filter(h => h.completedToday).length;
  const totalStreakDays = habits.reduce((sum, habit) => sum + habit.currentStreak, 0);

  if (isLoading) {
    return (
      <div className="p-6 pb-24">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
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
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Hello, {user?.name}! 👋
          </h1>
          <div className="flex items-center space-x-1 text-orange-500">
            <Flame className="w-5 h-5" />
            <span className="font-semibold">{totalStreakDays}</span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 mb-4">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{today}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
            <div className="text-2xl font-bold">{completedToday}</div>
            <div className="text-blue-100 text-sm">Completed Today</div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 text-white">
            <div className="text-2xl font-bold">{habits.length}</div>
            <div className="text-orange-100 text-sm">Total Habits</div>
          </div>
        </div>
      </motion.div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Today's Habits</h2>
        <motion.button
          onClick={() => setShowAddModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Add</span>
        </motion.button>
      </div>

      <div className="space-y-4">
        {habits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No habits yet</h3>
            <p className="text-gray-600 mb-6">Start building better habits today!</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium"
            >
              Create Your First Habit
            </button>
          </motion.div>
        ) : (
          habits.map((habit) => (
            <HabitCard
              key={habit._id}
              habit={habit}
              onToggle={handleToggleHabit}
            />
          ))
        )}
      </div>

      <AddHabitModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddHabit}
      />

      <AchievementModal
        isOpen={showAchievementModal}
        onClose={() => setShowAchievementModal(false)}
        achievement={achievementToShow}
      />
    </div>
  );
};

export default Dashboard;