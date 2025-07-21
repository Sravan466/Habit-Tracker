const express = require('express');
const { body, validationResult } = require('express-validator');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Helper function to calculate streak
const calculateStreak = async (habitId, userId) => {
  const logs = await HabitLog.find({ habitId, userId, completed: true })
    .sort({ date: -1 });

  if (logs.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let expectedDate = new Date();
  expectedDate.setHours(0, 0, 0, 0);

  // Calculate current streak
  for (let i = 0; i < logs.length; i++) {
    const logDate = new Date(logs[i].date + 'T00:00:00');
    const expectedDateStr = formatDate(expectedDate);
    
    if (logs[i].date === expectedDateStr) {
      currentStreak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak
  for (let i = 0; i < logs.length; i++) {
    const currentDate = new Date(logs[i].date + 'T00:00:00');
    
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(logs[i - 1].date + 'T00:00:00');
      const dayDiff = (prevDate - currentDate) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak };
};

// Get all habits for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isActive: true })
      .sort({ createdAt: -1 });

    // Get today's logs for each habit
    const today = formatDate(new Date());
    const habitIds = habits.map(h => h._id);
    
    const todayLogs = await HabitLog.find({
      habitId: { $in: habitIds },
      userId: req.user._id,
      date: today
    });

    const logsMap = todayLogs.reduce((acc, log) => {
      acc[log.habitId.toString()] = log.completed;
      return acc;
    }, {});

    const habitsWithStatus = habits.map(habit => ({
      ...habit.toObject(),
      completedToday: logsMap[habit._id.toString()] || false
    }));

    res.json(habitsWithStatus);
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create habit
router.post('/', authMiddleware, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name required (1-100 characters)'),
  body('color').isIn(['blue', 'green', 'purple', 'orange', 'red', 'pink', 'indigo', 'teal']).withMessage('Valid color required'),
  body('icon').trim().notEmpty().withMessage('Icon required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, color, icon, frequency, targetDays } = req.body;

    const habit = new Habit({
      name,
      description,
      color,
      icon,
      frequency: frequency || 'daily',
      targetDays: targetDays || [1, 2, 3, 4, 5, 6, 0],
      userId: req.user._id
    });

    await habit.save();

    // Award first habit achievement
    const user = await User.findById(req.user._id);
    const hasFirstHabitAchievement = user.achievements.some(a => a.type === 'first-habit');
    
    if (!hasFirstHabitAchievement) {
      user.achievements.push({
        type: 'first-habit',
        title: 'First Step',
        description: 'Created your first habit',
        icon: '🎯'
      });
      await user.save();
    }

    res.status(201).json({
      ...habit.toObject(),
      completedToday: false,
      achievementUnlocked: !hasFirstHabitAchievement ? 'first-habit' : null
    });
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle habit completion
router.post('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const habitId = req.params.id;
    const today = formatDate(new Date());

    // Find habit
    const habit = await Habit.findOne({ _id: habitId, userId: req.user._id });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Find or create today's log
    let log = await HabitLog.findOne({ habitId, userId: req.user._id, date: today });
    
    if (log) {
      log.completed = !log.completed;
      log.completedAt = log.completed ? new Date() : null;
    } else {
      log = new HabitLog({
        habitId,
        userId: req.user._id,
        date: today,
        completed: true
      });
    }

    await log.save();

    // Recalculate streaks
    const { currentStreak, longestStreak } = await calculateStreak(habitId, req.user._id);
    
    habit.currentStreak = currentStreak;
    habit.longestStreak = Math.max(habit.longestStreak, longestStreak);
    habit.lastCompletedDate = log.completed ? new Date() : habit.lastCompletedDate;
    
    await habit.save();

    // Check for achievements
    const user = await User.findById(req.user._id);
    let achievementUnlocked = null;

    if (log.completed && currentStreak > 0) {
      const achievements = [
        { streak: 7, type: '7-day-streak', title: 'Week Warrior', description: 'Completed 7 days in a row', icon: '🔥' },
        { streak: 30, type: '30-day-streak', title: 'Consistency Champion', description: 'Completed 30 days in a row', icon: '🏆' },
        { streak: 100, type: '100-day-streak', title: 'Legendary Streak', description: 'Completed 100 days in a row', icon: '👑' }
      ];

      for (const achievement of achievements) {
        if (currentStreak >= achievement.streak) {
          const hasAchievement = user.achievements.some(a => a.type === achievement.type);
          if (!hasAchievement) {
            user.achievements.push({
              type: achievement.type,
              title: achievement.title,
              description: achievement.description,
              icon: achievement.icon
            });
            achievementUnlocked = achievement.type;
            break;
          }
        }
      }

      // Update total streak days
      user.totalStreakDays = Math.max(user.totalStreakDays, currentStreak);
      await user.save();
    }

    res.json({
      completed: log.completed,
      currentStreak,
      longestStreak: habit.longestStreak,
      achievementUnlocked
    });
  } catch (error) {
    console.error('Toggle habit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get habit streak info
router.get('/:id/streak', authMiddleware, async (req, res) => {
  try {
    const habitId = req.params.id;
    const today = formatDate(new Date());

    const habit = await Habit.findOne({ _id: habitId, userId: req.user._id });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const todayLog = await HabitLog.findOne({
      habitId,
      userId: req.user._id,
      date: today
    });

    const { currentStreak, longestStreak } = await calculateStreak(habitId, req.user._id);

    res.json({
      currentStreak,
      longestStreak: Math.max(habit.longestStreak, longestStreak),
      todayCompleted: todayLog ? todayLog.completed : false
    });
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get habit progress (last 30 days)
router.get('/:id/progress', authMiddleware, async (req, res) => {
  try {
    const habitId = req.params.id;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29); // Last 30 days

    const habit = await Habit.findOne({ _id: habitId, userId: req.user._id });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const logs = await HabitLog.find({
      habitId,
      userId: req.user._id,
      date: {
        $gte: formatDate(startDate),
        $lte: formatDate(endDate)
      }
    }).sort({ date: 1 });

    // Create array of last 30 days with completion status
    const progressData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      
      const log = logs.find(l => l.date === dateStr);
      progressData.push({
        date: dateStr,
        completed: log ? log.completed : false,
        dayName: date.toLocaleDateString('en', { weekday: 'short' })
      });
    }

    res.json(progressData);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete habit
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;