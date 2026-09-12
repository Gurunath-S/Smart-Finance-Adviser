import { useState, useEffect, useCallback } from 'react';
import { transactionService, FinancialSummary } from '../services/transactionService';
import { incomeService, CreateIncomeData } from '../services/incomeService';
import { expenseService, CreateExpenseData } from '../services/expenseService';
import { Income, Expense, UnifiedTransaction } from '../types';

const defaultSummary: FinancialSummary = {
  totalIncome: 0,
  totalExpenses: 0,
  currentBalance: 0,
  savingsRate: 0,
  expenseRatio: 0,
  thisMonthIncome: 0,
  thisMonthExpense: 0,
};

export const useTransactions = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [unifiedTransactions, setUnifiedTransactions] = useState<UnifiedTransaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>(defaultSummary);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await transactionService.fetchAllTransactions();
      setIncomes(data.incomes);
      setExpenses(data.expenses);
      setUnifiedTransactions(data.unifiedTransactions);
      setSummary(data.summary);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to load transactions. Check connection.';
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addIncome = async (data: CreateIncomeData): Promise<boolean> => {
    try {
      await incomeService.addIncome(data);
      await fetchTransactions(true);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to add income';
      setError(msg);
      return false;
    }
  };

  const deleteIncome = async (id: string): Promise<boolean> => {
    try {
      await incomeService.deleteIncome(id);
      await fetchTransactions(true);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete income';
      setError(msg);
      return false;
    }
  };

  const addExpense = async (data: CreateExpenseData): Promise<boolean> => {
    try {
      await expenseService.addExpense(data);
      await fetchTransactions(true);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to add expense';
      setError(msg);
      return false;
    }
  };

  const deleteExpense = async (id: string): Promise<boolean> => {
    try {
      await expenseService.deleteExpense(id);
      await fetchTransactions(true);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete expense';
      setError(msg);
      return false;
    }
  };

  return {
    incomes,
    expenses,
    unifiedTransactions,
    summary,
    isLoading,
    isRefreshing,
    error,
    refresh: () => fetchTransactions(true),
    addIncome,
    deleteIncome,
    addExpense,
    deleteExpense,
    clearError: () => setError(null),
  };
};
