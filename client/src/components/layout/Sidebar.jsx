import React from 'react';
import { cn } from '../../lib/utils';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  History, 
  Lightbulb, 
  Wallet, 
  UserCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ active, setActive, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 1, title: 'Dashboard', icon: <LayoutDashboard /> },
    { id: 2, title: 'Incomes', icon: <TrendingUp /> },
    { id: 3, title: 'Expenses', icon: <TrendingDown /> },
    { id: 4, title: 'Transactions', icon: <History /> },
    { id: 5, title: 'Suggestions', icon: <Lightbulb /> },
    { id: 6, title: 'Budget', icon: <Wallet /> },
    { id: 7, title: 'Profile', icon: <UserCircle /> },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 280 : 80 }}
      className={cn(
        "relative z-20 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out",
        !isOpen && "items-center"
      )}
    >
      {/* Logo Section */}
      <div className={cn(
        "h-16 flex items-center px-6 mb-4 border-b border-slate-100 dark:border-slate-800/50",
        !isOpen && "px-0 justify-center"
      )}>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-600 rounded-lg text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          {isOpen && (
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              SFA
            </span>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-20 bg-primary-600 text-white rounded-full p-1 shadow-lg border-2 border-white dark:border-slate-950 hover:bg-primary-700 transition-colors"
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {/* Menu Items */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
              active === item.id 
                ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400" 
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
            )}
          >
            <div className={cn(
              "shrink-0 transition-transform duration-200 group-hover:scale-110",
              active === item.id ? "text-primary-600 dark:text-primary-400" : "text-slate-400"
            )}>
              {React.cloneElement(item.icon, { size: 22 })}
            </div>
            
            {isOpen && (
              <span className="text-sm font-semibold whitespace-nowrap">
                {item.title}
              </span>
            )}

            {!isOpen && (
              <div className="absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                {item.title}
              </div>
            )}

            {active === item.id && (
              <motion.div 
                layoutId="active-pill"
                className="absolute left-0 w-1 h-6 bg-primary-600 rounded-r-full"
              />
            )}
          </button>
        ))}
      </nav>

      {/* Footer Info (Optional) */}
      {isOpen && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
            Smart Finance Adviser v2.0
          </p>
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
