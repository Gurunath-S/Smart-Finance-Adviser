import React, { useState, useEffect } from "react";
import { useGlobalContext } from "../../context/globalContext";
import { Plus, Trash2, Target, Calendar, Loader2 } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { cn } from "../../lib/utils";

const Budget = () => {
  const { budgets, getBudgets, saveBudget, deleteBudget } = useGlobalContext();
  const [activeMonth, setActiveMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ category: "", limit: "" });

  useEffect(() => {
    getBudgets(activeMonth);
  }, [activeMonth, getBudgets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.limit) return;
    setLoading(true);
    await saveBudget({ ...form, month: activeMonth });
    setLoading(false);
    setForm({ category: "", limit: "" });
  };

  const getStatus = (spent, limit) => {
    const percent = (spent / limit) * 100;
    if (percent >= 100) return { label: 'Exceeded', color: 'text-red-600', bg: 'bg-red-100', bar: 'bg-red-600' };
    if (percent >= 80) return { label: 'Warning', color: 'text-amber-600', bg: 'bg-amber-100', bar: 'bg-amber-600' };
    return { label: 'On Track', color: 'text-emerald-600', bg: 'bg-emerald-100', bar: 'bg-emerald-600' };
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Budget Planner</h1>
          <p className="text-slate-500 dark:text-slate-400">Set limits and keep your spending under control.</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Calendar className="h-5 w-5 text-primary-600 ml-2" />
          <input 
            type="month" 
            value={activeMonth}
            onChange={(e) => setActiveMonth(e.target.value)}
            className="bg-transparent border-none text-sm font-bold focus:ring-0 dark:text-white cursor-pointer"
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary-600" />
                Create New Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Category</label>
                  <select 
                    className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all dark:text-white"
                    value={form.category}
                    onChange={(e) => setForm({...form, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    <option value="Education">Education</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Health">Health</option>
                    <option value="Subscriptions">Subscriptions</option>
                    <option value="Takeaways">Takeaways</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Travelling">Travelling</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Monthly Limit (₹)</label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 5000" 
                    value={form.limit}
                    onChange={(e) => setForm({...form, limit: e.target.value})}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Set Budget Target"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <div className="grid gap-6 sm:grid-cols-2">
            {budgets.length === 0 ? (
              <div className="sm:col-span-2 p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">No budgets set for this month yet.</p>
              </div>
            ) : (
              budgets.map((b) => {
                const status = getStatus(b.spent, b.limit);
                const percent = Math.min((b.spent / b.limit) * 100, 100);
                
                return (
                  <Card key={b._id} className="border-none shadow-md overflow-hidden group hover:ring-2 hover:ring-primary-500 transition-all">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{b.category}</CardTitle>
                        <button 
                          onClick={() => deleteBudget(b._id, activeMonth)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Spent / Limit</p>
                          <p className="text-lg font-black text-slate-900 dark:text-white">
                            ₹{b.spent.toLocaleString()} <span className="text-slate-400 font-medium text-sm">/ ₹{b.limit.toLocaleString()}</span>
                          </p>
                        </div>
                        <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", status.bg, status.color)}>
                          {status.label}
                        </div>
                      </div>

                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all duration-500", status.bar)}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>{Math.round(percent)}% Used</span>
                        <span>₹{(b.limit - b.spent).toLocaleString()} Left</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budget;
