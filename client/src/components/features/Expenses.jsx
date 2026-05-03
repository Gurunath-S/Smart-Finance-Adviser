import React, { useEffect } from 'react';
import { useGlobalContext } from '../../context/globalContext';
import TransactionForm from './TransactionForm';
import TransactionItem from './TransactionItem';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { TrendingDown, Plus } from 'lucide-react';

const Expenses = () => {
  const { addExpense, getExpenses, expenses, deleteExpense, totalExpenses } = useGlobalContext();

  useEffect(() => {
    getExpenses();
  }, [getExpenses]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight text-center md:text-left">Expense Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400 text-center md:text-left">Monitor and categorize your spending habits.</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm self-center md:self-auto">
          <div className="p-2 bg-red-500 rounded-lg text-white shadow-lg shadow-red-500/20">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest leading-none mb-1">Total Expenses</p>
            <p className="text-2xl font-black text-red-700 dark:text-red-300">₹{totalExpenses().toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Card className="border-none shadow-md sticky top-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-red-600" />
                Add Expense
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionForm type="expense" onSubmit={addExpense} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Expenses</CardTitle>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {expenses.length} Records
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="font-medium italic">No expenses recorded. You're doing great!</p>
                  </div>
                ) : (
                  [...expenses].reverse().map((expense) => (
                    <TransactionItem
                      key={expense._id}
                      {...expense}
                      deleteItem={deleteExpense}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
