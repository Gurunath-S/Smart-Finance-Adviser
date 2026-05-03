import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/globalContext';
import { Card, CardHeader } from '../ui/Card';
import { Search, Download, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { cn } from '../../lib/utils';
import * as XLSX from 'xlsx';

const ViewTransactions = () => {
    const { incomes, expenses, getIncomes, getExpenses } = useGlobalContext();
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, income, expense
    const [page, setPage] = useState(1);
    const limit = 10;

    useEffect(() => {
        getIncomes();
        getExpenses();
    }, [getIncomes, getExpenses]);

    const combined = [...incomes.map(i => ({...i, type: 'income'})), ...expenses.map(e => ({...e, type: 'expense'}))]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const filtered = combined.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                             t.category?.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesType;
    });

    const totalPages = Math.ceil(filtered.length / limit);
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filtered.map(t => ({
            Title: t.title,
            Amount: t.amount,
            Type: t.type,
            Date: new Date(t.date).toLocaleDateString(),
            Category: t.category,
            Description: t.description
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Transactions");
        XLSX.writeFile(wb, "SFA_Transactions_Report.xlsx");
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Transaction History</h1>
                    <p className="text-slate-500 dark:text-slate-400">Detailed view and export of all your financial movements.</p>
                </div>
                <Button onClick={exportToExcel} className="shadow-lg shadow-primary-500/20">
                    <Download className="mr-2 h-4 w-4" /> Export to Excel
                </Button>
            </div>

            <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-900/50 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Search by title or category..." 
                                className="pl-10" 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                            {['all', 'income', 'expense'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => { setFilterType(t); setPage(1); }}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                        filterType === t 
                                            ? "bg-primary-600 text-white shadow-md shadow-primary-500/20" 
                                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Transaction</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">
                                        No matching transactions found.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((t) => (
                                    <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 dark:text-white">{t.title}</span>
                                                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Ref: {t._id.slice(-6)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                                                {t.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 flex items-center gap-2">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(t.date).toLocaleDateString()}
                                        </td>
                                        <td className={cn(
                                            "px-6 py-4 text-right font-black text-lg",
                                            t.type === 'expense' ? "text-red-600" : "text-emerald-600"
                                        )}>
                                            {t.type === 'expense' ? '-' : '+'}₹{t.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 border-t dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-medium">
                        Showing <span className="font-bold text-slate-900 dark:text-white">{(page-1)*limit + 1}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(page*limit, filtered.length)}</span> of <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> records
                    </p>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="h-8 w-8 p-0"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-xs font-bold text-slate-900 dark:text-white px-2">Page {page} of {totalPages}</div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="h-8 w-8 p-0"
                        >
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ViewTransactions;
