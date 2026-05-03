import React, { useState } from 'react';
import { useGlobalContext } from '../../context/globalContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Plus, Loader2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { cn } from '../../lib/utils';

const TransactionForm = ({ type = 'income' }) => {
  const { addIncome, addExpense } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [inputState, setInputState] = useState({
    title: '',
    amount: '',
    date: new Date(),
    category: '',
    description: '',
  });

  const { title, amount, date, category, description } = inputState;

  const handleInput = name => e => {
    setInputState({ ...inputState, [name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    
    const data = { ...inputState, type };
    if (type === 'income') {
      await addIncome(data);
    } else {
      await addExpense(data);
    }
    
    setLoading(false);
    setInputState({
      title: '',
      amount: '',
      date: new Date(),
      category: '',
      description: '',
    });
  };

  const incomeCategories = ['Salary', 'Freelancing', 'Investments', 'Stocks', 'Bitcoin', 'Bank Transfer', 'Youtube', 'Other'];
  const expenseCategories = ['Education', 'Groceries', 'Health', 'Subscriptions', 'Takeaways', 'Clothing', 'Travelling', 'Other'];
  const categories = type === 'income' ? incomeCategories : expenseCategories;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="text"
          value={title}
          name="title"
          placeholder={`${type === 'income' ? 'Income' : 'Expense'} Title`}
          onChange={handleInput('title')}
          required
        />
      </div>
      <div className="space-y-2">
        <Input
          value={amount}
          type="number"
          name="amount"
          placeholder="Amount"
          onChange={handleInput('amount')}
          required
        />
      </div>
      <div className="space-y-2">
        <div className="relative">
          <DatePicker
            id="date"
            placeholderText="Select Date"
            selected={date}
            dateFormat="dd/MM/yyyy"
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:placeholder:text-slate-400"
            onChange={(date) => {
              setInputState({ ...inputState, date: date });
            }}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <select
          required
          value={category}
          name="category"
          onChange={handleInput('category')}
          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
        >
          <option value="" disabled>Select Category</option>
          {categories.map(c => (
            <option key={c} value={c.toLowerCase()}>{c}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <textarea
          name="description"
          value={description}
          placeholder="Add a description..."
          rows="3"
          onChange={handleInput('description')}
          className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:placeholder:text-slate-400 resize-none"
        />
      </div>
      <Button 
        type="submit" 
        className={cn("w-full shadow-lg transition-all active:scale-[0.98]", type === 'income' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700")}
        disabled={loading}
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
        Add {type === 'income' ? 'Income' : 'Expense'}
      </Button>
    </form>
  );
};

export default TransactionForm;
