import React, { useEffect } from 'react';
import { useGlobalContext } from '../../context/globalContext';
import Chart from './Chart';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight } from 'lucide-react';
import History from '../../features/history/History';
import { cn } from '../../lib/utils';

const Dashboard = () => {
  const { 
    totalExpenses, incomes, expenses, totalIncome, totalBalance, 
    getIncomes, getExpenses 
  } = useGlobalContext();

  useEffect(() => {
    getIncomes();
    getExpenses();
  }, [getIncomes, getExpenses]);

  const stats = [
    {
      title: 'Total Income',
      amount: totalIncome(),
      icon: <TrendingUp className="h-4 w-4 text-emerald-600" />,
      trend: '+12%',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/10',
    },
    {
      title: 'Total Expenses',
      amount: totalExpenses(),
      icon: <TrendingDown className="h-4 w-4 text-red-600" />,
      trend: '+5%',
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/10',
    },
    {
      title: 'Total Balance',
      amount: totalBalance(),
      icon: <Wallet className="h-4 w-4 text-primary-600" />,
      trend: '+8%',
      color: 'text-primary-600',
      bg: 'bg-primary-50 dark:bg-primary-900/10',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome back! Here's what's happening with your money.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => (
          <Card key={i} className="overflow-hidden border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</CardTitle>
              <div className={cn(stat.bg, "p-2 rounded-lg")}>{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{stat.amount.toLocaleString()}</div>
              <div className="flex items-center text-xs mt-1">
                <ArrowUpRight className={cn("h-4 w-4 mr-1", stat.color)} />
                <span className={cn("font-medium mr-1", stat.color)}>{stat.trend}</span>
                <span className="text-slate-400">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-md">
          <CardHeader><CardTitle>Cash Flow</CardTitle></CardHeader>
          <CardContent className="h-[400px]">
            <Chart />
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent><History /></CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader><CardTitle>Range Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <RangeItem label="Income" items={incomes} />
              <RangeItem label="Expense" items={expenses} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const RangeItem = ({ label, items }) => (
  <div className="space-y-2">
    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label} Range</div>
    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
      <div className="flex flex-col">
        <span className="text-[10px] text-slate-400 uppercase">Min</span>
        <span className="font-bold">₹{items.length ? Math.min(...items.map(i => i.amount)).toLocaleString() : 0}</span>
      </div>
      <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
      <div className="flex flex-col items-end">
        <span className="text-[10px] text-slate-400 uppercase">Max</span>
        <span className="font-bold">₹{items.length ? Math.max(...items.map(i => i.amount)).toLocaleString() : 0}</span>
      </div>
    </div>
  </div>
);

export default Dashboard;
