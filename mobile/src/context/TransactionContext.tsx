import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  transactionService,
  FinancialSummary,
  computeFinancialSummary,
  sortUnifiedTransactions,
} from '../services/transactionService';
import { incomeService, CreateIncomeData } from '../services/incomeService';
import { expenseService, CreateExpenseData } from '../services/expenseService';
import { CashDenominationResponse } from '../services/cashService';
import { Income, Expense, UnifiedTransaction } from '../types';

interface TransactionContextType {
  incomes: Income[];
  expenses: Expense[];
  unifiedTransactions: UnifiedTransaction[];
  summary: FinancialSummary;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addIncome: (data: CreateIncomeData) => Promise<boolean>;
  deleteIncome: (id: string) => Promise<boolean>;
  addExpense: (data: CreateExpenseData) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  syncCashDenominations: (cashData: CashDenominationResponse) => void;
  clearError: () => void;
}

const defaultSummary: FinancialSummary = {
  totalIncome: 0,
  totalExpenses: 0,
  currentBalance: 0,
  savingsRate: 0,
  expenseRatio: 0,
  thisMonthIncome: 0,
  thisMonthExpense: 0,
  inHandBalance: 0,
  inAccountBalance: 0,
  inHandIncome: 0,
  inHandExpense: 0,
  inAccountIncome: 0,
  inAccountExpense: 0,
  omittedCash: 0,
  totalPhysicalCash: 0,
  omittedTransactionsCount: 0,
};

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [unifiedTransactions, setUnifiedTransactions] = useState<UnifiedTransaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>(defaultSummary);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Mutable refs to track current data for 0ms optimistic snapshots & rollback
  const incomesRef = useRef<Income[]>([]);
  const expensesRef = useRef<Expense[]>([]);
  const cashDataRef = useRef<CashDenominationResponse | null>(null);
  const isInitialLoadedRef = useRef<boolean>(false);

  // Fetch transactions from services
  const fetchTransactions = useCallback(
    async (isRefresh = false, silent = false) => {
      if (isRefresh && !silent) {
        setIsRefreshing(true);
      } else if (!isInitialLoadedRef.current && !silent) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await transactionService.fetchAllTransactions(isRefresh);
        incomesRef.current = data.incomes;
        expensesRef.current = data.expenses;
        cashDataRef.current = data.cashData;
        isInitialLoadedRef.current = true;

        setIncomes(data.incomes);
        setExpenses(data.expenses);
        setUnifiedTransactions(data.unifiedTransactions);
        setSummary(data.summary);
      } catch (err: any) {
        const msg =
          err.response?.data?.message || 'Failed to load transactions. Check connection.';
        if (!silent) setError(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Synchronize cash denominations instantly in memory
  const syncCashDenominations = useCallback((cashData: CashDenominationResponse) => {
    cashDataRef.current = cashData;
    const newSummary = computeFinancialSummary(
      incomesRef.current,
      expensesRef.current,
      cashData
    );
    setSummary(newSummary);
  }, []);

  // ── OPTIMISTIC ADD EXPENSE (0ms Latency) ───────────────────────────
  const addExpense = useCallback(
    async (data: CreateExpenseData): Promise<boolean> => {
      const tempId = `temp_exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const optimisticExpense: Expense = {
        _id: tempId,
        title: data.title,
        amount: data.amount,
        type: 'expense',
        category: data.category,
        description: data.description,
        date: data.date,
        paymentMode: data.paymentMode || 'online',
        excludeFromTotal: data.excludeFromTotal,
        omittedAmount: data.omittedAmount,
        userId: '',
        createdAt: new Date().toISOString(),
      };

      // 1. Snapshot previous state
      const prevExpenses = [...expensesRef.current];
      const prevIncomes = [...incomesRef.current];
      const prevCash = cashDataRef.current;

      // 2. Optimistic cash modification if in-hand cash
      let nextCash = prevCash;
      if (data.paymentMode === 'cash' && prevCash) {
        nextCash = {
          ...prevCash,
          totalInHandCash: Math.max(0, prevCash.totalInHandCash - data.amount),
        };
      }

      // 3. Immediately update UI state (0ms)
      const nextExpenses = [optimisticExpense, ...prevExpenses];
      const nextUnified = sortUnifiedTransactions(prevIncomes, nextExpenses);
      const nextSummary = computeFinancialSummary(prevIncomes, nextExpenses, nextCash);

      expensesRef.current = nextExpenses;
      cashDataRef.current = nextCash;
      setExpenses(nextExpenses);
      setUnifiedTransactions(nextUnified);
      setSummary(nextSummary);

      // 4. Background network persistence
      try {
        await expenseService.addExpense(data);
        transactionService.clearCache();
        // Silent sync in background to reconcile server IDs
        fetchTransactions(true, true);
        return true;
      } catch (err: any) {
        // Rollback state on error
        expensesRef.current = prevExpenses;
        cashDataRef.current = prevCash;
        setExpenses(prevExpenses);
        setUnifiedTransactions(sortUnifiedTransactions(prevIncomes, prevExpenses));
        setSummary(computeFinancialSummary(prevIncomes, prevExpenses, prevCash));
        setError(err.response?.data?.message || 'Failed to add expense');
        return false;
      }
    },
    [fetchTransactions]
  );

  // ── OPTIMISTIC ADD INCOME (0ms Latency) ────────────────────────────
  const addIncome = useCallback(
    async (data: CreateIncomeData): Promise<boolean> => {
      const tempId = `temp_inc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const optimisticIncome: Income = {
        _id: tempId,
        title: data.title,
        amount: data.amount,
        type: 'income',
        category: data.category,
        description: data.description,
        date: data.date,
        paymentMode: data.paymentMode || 'online',
        excludeFromTotal: data.excludeFromTotal,
        omittedAmount: data.omittedAmount,
        userId: '',
        createdAt: new Date().toISOString(),
      };

      // 1. Snapshot previous state
      const prevIncomes = [...incomesRef.current];
      const prevExpenses = [...expensesRef.current];
      const prevCash = cashDataRef.current;

      // 2. Optimistic cash modification
      let nextCash = prevCash;
      if (data.paymentMode === 'cash' && prevCash) {
        nextCash = {
          ...prevCash,
          totalInHandCash: prevCash.totalInHandCash + data.amount,
        };
      }

      // 3. Immediately update UI state (0ms)
      const nextIncomes = [optimisticIncome, ...prevIncomes];
      const nextUnified = sortUnifiedTransactions(nextIncomes, prevExpenses);
      const nextSummary = computeFinancialSummary(nextIncomes, prevExpenses, nextCash);

      incomesRef.current = nextIncomes;
      cashDataRef.current = nextCash;
      setIncomes(nextIncomes);
      setUnifiedTransactions(nextUnified);
      setSummary(nextSummary);

      // 4. Background network persistence
      try {
        await incomeService.addIncome(data);
        transactionService.clearCache();
        fetchTransactions(true, true);
        return true;
      } catch (err: any) {
        // Rollback on error
        incomesRef.current = prevIncomes;
        cashDataRef.current = prevCash;
        setIncomes(prevIncomes);
        setUnifiedTransactions(sortUnifiedTransactions(prevIncomes, prevExpenses));
        setSummary(computeFinancialSummary(prevIncomes, prevExpenses, prevCash));
        setError(err.response?.data?.message || 'Failed to add income');
        return false;
      }
    },
    [fetchTransactions]
  );

  // ── OPTIMISTIC DELETE EXPENSE (0ms Latency) ────────────────────────
  const deleteExpense = useCallback(
    async (id: string): Promise<boolean> => {
      const prevExpenses = [...expensesRef.current];
      const prevIncomes = [...incomesRef.current];
      const prevCash = cashDataRef.current;

      const target = prevExpenses.find((e) => e._id === id);
      const nextExpenses = prevExpenses.filter((e) => e._id !== id);

      let nextCash = prevCash;
      if (target?.paymentMode === 'cash' && prevCash) {
        nextCash = {
          ...prevCash,
          totalInHandCash: prevCash.totalInHandCash + target.amount,
        };
      }

      // Update state in 0ms
      expensesRef.current = nextExpenses;
      cashDataRef.current = nextCash;
      setExpenses(nextExpenses);
      setUnifiedTransactions(sortUnifiedTransactions(prevIncomes, nextExpenses));
      setSummary(computeFinancialSummary(prevIncomes, nextExpenses, nextCash));

      try {
        await expenseService.deleteExpense(id);
        transactionService.clearCache();
        fetchTransactions(true, true);
        return true;
      } catch (err: any) {
        // Rollback
        expensesRef.current = prevExpenses;
        cashDataRef.current = prevCash;
        setExpenses(prevExpenses);
        setUnifiedTransactions(sortUnifiedTransactions(prevIncomes, prevExpenses));
        setSummary(computeFinancialSummary(prevIncomes, prevExpenses, prevCash));
        setError(err.response?.data?.message || 'Failed to delete expense');
        return false;
      }
    },
    [fetchTransactions]
  );

  // ── OPTIMISTIC DELETE INCOME (0ms Latency) ─────────────────────────
  const deleteIncome = useCallback(
    async (id: string): Promise<boolean> => {
      const prevIncomes = [...incomesRef.current];
      const prevExpenses = [...expensesRef.current];
      const prevCash = cashDataRef.current;

      const target = prevIncomes.find((i) => i._id === id);
      const nextIncomes = prevIncomes.filter((i) => i._id !== id);

      let nextCash = prevCash;
      if (target?.paymentMode === 'cash' && prevCash) {
        nextCash = {
          ...prevCash,
          totalInHandCash: Math.max(0, prevCash.totalInHandCash - target.amount),
        };
      }

      // Update state in 0ms
      incomesRef.current = nextIncomes;
      cashDataRef.current = nextCash;
      setIncomes(nextIncomes);
      setUnifiedTransactions(sortUnifiedTransactions(nextIncomes, prevExpenses));
      setSummary(computeFinancialSummary(nextIncomes, prevExpenses, nextCash));

      try {
        await incomeService.deleteIncome(id);
        transactionService.clearCache();
        fetchTransactions(true, true);
        return true;
      } catch (err: any) {
        // Rollback
        incomesRef.current = prevIncomes;
        cashDataRef.current = prevCash;
        setIncomes(prevIncomes);
        setUnifiedTransactions(sortUnifiedTransactions(prevIncomes, prevExpenses));
        setSummary(computeFinancialSummary(prevIncomes, prevExpenses, prevCash));
        setError(err.response?.data?.message || 'Failed to delete income');
        return false;
      }
    },
    [fetchTransactions]
  );

  const clearError = useCallback(() => setError(null), []);

  const value = {
    incomes,
    expenses,
    unifiedTransactions,
    summary,
    isLoading,
    isRefreshing,
    error,
    refresh: () => fetchTransactions(true, false),
    addIncome,
    deleteIncome,
    addExpense,
    deleteExpense,
    syncCashDenominations,
    clearError,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactionContext must be used within a TransactionProvider');
  }
  return context;
};
