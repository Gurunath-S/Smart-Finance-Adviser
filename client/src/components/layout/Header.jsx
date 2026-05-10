import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useGlobalContext } from '../../context/globalContext';
import { Sun, Moon, LogOut, User, Bell, Search, Menu } from 'lucide-react';
import Button from '../ui/Button';
import { API_BASE_URL } from '../../config';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

const Header = ({ setSidebarOpen }) => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { totalBalance, setSearchQuery, searchQuery } = useGlobalContext();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => { if (data.avatar) setAvatarUrl(data.avatar); })
        .catch(() => { });
    }
  }, []);

  return (
    <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 transition-all duration-300">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setSidebarOpen(prev => !prev)}
          className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-1.5 w-64 border border-transparent focus-within:border-primary-500/50 transition-all shadow-sm">
          <Search className="h-4 w-4 text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right: Balance, Actions, Profile */}
      <div className="flex items-center space-x-2 md:space-x-6">
        <div className="hidden lg:flex flex-col items-end mr-4 animate-in fade-in slide-in-from-right-4 duration-500">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Balance</span>
          <span className={totalBalance() >= 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-red-600 dark:text-red-400 font-bold"}>
            ₹{totalBalance().toLocaleString()}
          </span>
        </div>

        <div className="flex items-center space-x-1 md:space-x-2">
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="rounded-full w-9 h-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-transform active:scale-90">
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </Button>
          
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowNotifications(!showNotifications)}
              className="rounded-full w-9 h-9 p-0 relative hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
            </Button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                    <span className="text-[10px] bg-primary-100 dark:bg-primary-900 text-primary-600 px-2 py-0.5 rounded-full font-bold">2 NEW</span>
                  </div>
                  <div className="space-y-3">
                    <NotificationItem 
                      title="Salary Credited" 
                      time="2 hours ago" 
                      desc="Your monthly salary has been added to incomes."
                      isNew 
                    />
                    <NotificationItem 
                      title="Budget Alert" 
                      time="5 hours ago" 
                      desc="You have reached 80% of your Food budget."
                      isNew 
                    />
                  </div>
                  <button className="w-full mt-4 text-xs font-bold text-primary-600 hover:text-primary-500 transition-colors py-2 border-t border-slate-100 dark:border-slate-800">
                    View all notifications
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none group-hover:text-primary-600 transition-colors">
              {user?.username || 'User'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Standard Plan</span>
          </div>
          
          <div className="relative">
            {avatarUrl ? (
              <img 
                src={`${API_BASE_URL.replace('/api', '')}${avatarUrl}`} 
                alt="avatar" 
                className="h-9 w-9 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shadow-sm transition-transform group-hover:scale-105" 
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm border-2 border-primary-200 dark:border-primary-800 transition-transform group-hover:scale-105">
                {user?.username ? user.username[0].toUpperCase() : <User className="h-4 w-4" />}
              </div>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => logout("Successfully logged out")} 
            className="hidden md:flex text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

const NotificationItem = ({ title, time, desc, isNew }) => (
  <div className={cn(
    "p-3 rounded-lg transition-colors cursor-pointer",
    isNew ? "bg-primary-50/50 dark:bg-primary-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-800"
  )}>
    <div className="flex items-center justify-between mb-1">
      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{title}</h4>
      <span className="text-[10px] text-slate-400">{time}</span>
    </div>
    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">{desc}</p>
  </div>
);

export default Header;
