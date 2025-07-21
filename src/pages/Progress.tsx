import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, TrendingUp, Flame } from 'lucide-react';
import { useApi } from '../hooks/useApi';

interface Habit {
  _id: string;
  name: string;
  color: string;
  currentStreak: number;
  longestStreak: number;
}

interface ProgressData {
  date: string;
  completed: boolean;
  dayName: string;
}

const Progress: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<string>('');
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { apiCall } = useApi();

  const colorMap: { [key: string]: string } = {
    blue: '#3B82F6',
    green: '#10B981',
    purple: '#8B5CF6',
    orange: '#F97316',
    red: '#EF4444',
    pink: '#EC4899',
    indigo: '#6366F1',
    teal: '#14B8A6',
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  useEffect(() => {
    if (selectedHabit) {
      fetchProgressData(selectedHabit);
    }
  }, [selectedHabit]);

  const fetchHabits = async () => {
    try {
      const data = await apiCall('/habits');
      setHabits(data);
      if (data.length > 0) {
        setSelectedHabit(data[0]._id);
      }
    } catch (error) {
      console.error('Fetch habits error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProgressData = async (habitId: string) => {
    try {
      const data = await apiCall(`/habits/${habitId}/progress`);
      setProgressData(data);
    } catch (error) {
      console.error('Fetch progress error:', error);
    }
  };

  const selectedHabitData = habits.find(h => h._id === selectedHabit);
  const completionRate = progressData.length > 0 
    ? Math.round((progressData.filter(d => d.completed).length / progressData.length) * 100)
    : 0;

  const chartData = progressData.slice(-14).map((item, index) => ({
    day: item.dayName,
    completed: item.completed ? 1 : 0,
    date: item.date,
  }));

  if (isLoading) {
    return (
      <div className="p-6 pb-24">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
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
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Progress</h1>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No data yet</h3>
            <p className="text-gray-600">Create habits to see your progress!</p>
          </div>
        ) : (
          <>
            {/* Habit Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Habit
              </label>
              <select
                value={selectedHabit}
                onChange={(e) => setSelectedHabit(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {habits.map((habit) => (
                  <option key={habit._id} value={habit._id}>
                    {habit.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedHabitData && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <Flame className="w-5 h-5" />
                      <span className="text-sm text-blue-100">Current Streak</span>
                    </div>
                    <div className="text-2xl font-bold">{selectedHabitData.currentStreak}</div>
                  </div>
                  <div className={`bg-gradient-to-r from-${selectedHabitData.color}-500 to-${selectedHabitData.color}-600 rounded-2xl p-4 text-white`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-5 h-5" />
                      <span className="text-sm opacity-90">Completion Rate</span>
                    </div>
                    <div className="text-2xl font-bold">{completionRate}%</div>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Last 14 Days
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis 
                          dataKey="day" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#6B7280' }}
                        />
                        <YAxis hide />
                        <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.completed ? colorMap[selectedHabitData.color] : '#E5E7EB'} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Best Streak */}
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Best Streak</h3>
                      <p className="text-yellow-100 text-sm">Your longest streak so far</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{selectedHabitData.longestStreak}</div>
                      <div className="text-yellow-100 text-sm">days</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Progress;