import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import AuthForm from './components/auth/AuthForm';
import Dashboard from './pages/Dashboard';
import Progress from './pages/Progress';
import Achievements from './pages/Achievements';
import Profile from './pages/Profile';
import BottomNav from './components/navigation/BottomNav';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  // Apply dark mode class based on user preference
  useEffect(() => {
    if (user?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user?.theme]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔥</span>
          </div>
          <div className="animate-pulse text-gray-600 dark:text-gray-400">Loading HabitFlow...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthForm
        isLogin={isLogin}
        onToggle={() => setIsLogin(!isLogin)}
      />
    );
  }

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard />;
      case 'progress':
        return <Progress />;
      case 'achievements':
        return <Achievements />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AnimatePresence mode="wait">
        {renderCurrentPage()}
      </AnimatePresence>
      
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;