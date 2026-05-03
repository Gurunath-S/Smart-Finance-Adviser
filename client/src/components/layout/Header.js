import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useGlobalContext } from '../../context/globalContext';
import { Sun, Moon, LogOut, User, Bell, Search, Menu } from 'lucide-react';
import Button from '../ui/Button';
import { API_BASE_URL } from '../../config';

const Header = ({ setSidebarOpen }) => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { totalBalance } = useGlobalContext();
  const [avatarUrl, setAvatarUrl] = useState(null);

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
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setSidebarOpen(prev => !prev)}
          className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 w-64">
          <Search className="h-4 w-4 text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right: Balance, Actions, Profile */}
      <div className="flex items-center space-x-2 md:space-x-6">
        <div className="hidden lg:flex flex-col items-end mr-4">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Balance</span>
          <span className={totalBalance() >= 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-red-600 dark:text-red-400 font-bold"}>
            ₹{totalBalance().toLocaleString()}
          </span>
        </div>

        <div className="flex items-center space-x-1 md:space-x-2">
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="rounded-full w-9 h-9 p-0">
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </Button>
          
          <Button variant="ghost" size="sm" className="rounded-full w-9 h-9 p-0 relative">
            <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
          </Button>
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">
              {user?.username || 'User'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Standard Plan</span>
          </div>
          
          <div className="relative">
            {avatarUrl ? (
              <img 
                src={`${API_BASE_URL.replace('/api', '')}${avatarUrl}`} 
                alt="avatar" 
                className="h-9 w-9 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700" 
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm border-2 border-primary-200 dark:border-primary-800">
                {user?.username ? user.username[0].toUpperCase() : <User className="h-4 w-4" />}
              </div>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => logout("Successfully logged out")} 
            className="hidden md:flex text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
