import React from 'react';
import { useGlobalContext } from '../../context/globalContext';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

function History() {
    const { transactionHistory } = useGlobalContext();
    const history = transactionHistory();

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <p className="text-sm">No recent transactions</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {history.map((item) => {
                const { _id, title, amount, type } = item;
                const isExpense = type === 'expense';
                
                return (
                    <div 
                        key={_id} 
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <div className="flex items-center space-x-3">
                            <div className={cn(
                                "p-2 rounded-lg",
                                isExpense ? "bg-red-100 text-red-600 dark:bg-red-900/20" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20"
                            )}>
                                {isExpense ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none mb-1">
                                    {title}
                                </p>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                                    {isExpense ? 'Expense' : 'Income'}
                                </p>
                            </div>
                        </div>

                        <div className={cn(
                            "text-sm font-bold",
                            isExpense ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                        )}>
                            {isExpense ? '-' : '+'}₹{Math.abs(amount).toLocaleString()}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default History;
