import React from 'react';
import { dateFormat } from '../../utils/dateFormat';
import { 
  Briefcase, 
  User, 
  TrendingUp, 
  CreditCard, 
  PlayCircle, 
  Wallet, 
  Bitcoin,
  Book,
  ShoppingCart,
  Activity,
  Tv,
  Utensils,
  Shirt,
  Map,
  Circle,
  Trash2,
  Edit2,
  Calendar,
  MessageSquare
} from 'lucide-react';
import Button from '../ui/Button';
import { cn } from '../../lib/utils';

function TransactionItem({
    id, title, amount, date, category, description, deleteItem, type, onEdit
}) {

    const getIcon = () => {
        if (type === 'expense') {
            switch (category) {
                case 'education': return <Book size={24} />;
                case 'groceries': return <ShoppingCart size={24} />;
                case 'health': return <Activity size={24} />;
                case 'subscriptions': return <Tv size={24} />;
                case 'takeaways': return <Utensils size={24} />;
                case 'clothing': return <Shirt size={24} />;
                case 'travelling': return <Map size={24} />;
                default: return <Circle size={24} />;
            }
        } else {
            switch (category) {
                case 'salary': return <Briefcase size={24} />;
                case 'freelancing': return <TrendingUp size={24} />;
                case 'investments': return <Wallet size={24} />;
                case 'stocks': return <User size={24} />;
                case 'bitcoin': return <Bitcoin size={24} />;
                case 'bank': return <CreditCard size={24} />;
                case 'youtube': return <PlayCircle size={24} />;
                default: return <Wallet size={24} />;
            }
        }
    }

    const isExpense = type === 'expense';

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 group transition-all hover:shadow-md">
            <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border-2",
                isExpense ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/10 dark:border-red-900/20" : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20"
            )}>
                {getIcon()}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <div className={cn("w-2 h-2 rounded-full", isExpense ? "bg-red-500" : "bg-emerald-500")} />
                    <h5 className="text-base font-bold text-slate-900 dark:text-white truncate">{title}</h5>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                        <span className={isExpense ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}>
                            {isExpense ? '-' : '+'}₹{amount.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                        <Calendar size={14} />
                        {dateFormat(date)}
                    </div>
                    {description && (
                        <div className="flex items-center gap-1.5 text-xs italic truncate max-w-[200px]">
                            <MessageSquare size={14} />
                            {description}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onEdit()}
                        className="rounded-full w-9 h-9 p-0 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
                    >
                        <Edit2 size={16} />
                    </Button>
                )}
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteItem(id)}
                    className="rounded-full w-9 h-9 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10 dark:hover:text-red-400"
                >
                    <Trash2 size={16} />
                </Button>
            </div>
        </div>
    );
}

export default TransactionItem;
