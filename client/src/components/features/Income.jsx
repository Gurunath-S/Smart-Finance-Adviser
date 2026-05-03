import React, { useEffect } from 'react';
import { useGlobalContext } from '../../context/globalContext';
import TransactionForm from './TransactionForm';
import TransactionItem from './TransactionItem';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { TrendingUp, Plus } from 'lucide-react';

const Income = () => {
  const { addIncome, getIncomes, incomes, deleteIncome, totalIncome } = useGlobalContext();

  useEffect(() => {
    getIncomes();
  }, [getIncomes]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight text-center md:text-left">Income Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400 text-center md:text-left">Track and manage your revenue streams.</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm self-center md:self-auto">
          <div className="p-2 bg-emerald-500 rounded-lg text-white shadow-lg shadow-emerald-500/20">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none mb-1">Total Income</p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">₹{totalIncome().toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Card className="border-none shadow-md sticky top-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-600" />
                Add Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionForm type="income" onSubmit={addIncome} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Incomes</CardTitle>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {incomes.length} Records
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {incomes.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="font-medium italic">No income records found. Start adding some!</p>
                  </div>
                ) : (
                  [...incomes].reverse().map((income) => (
                    <TransactionItem
                      key={income._id}
                      {...income}
                      deleteItem={deleteIncome}
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

export default Income;
