import { api } from './api';
import { incomeService } from './incomeService';
import { expenseService } from './expenseService';
import { cashService, CashDenominationResponse } from './cashService';
import { Income, Expense, UnifiedTransaction, TransactionQueryParams } from '../types';
import { isCurrentMonth } from '../utils/date';

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  savingsRate: number; // percentage
  expenseRatio: number; // percentage
  thisMonthIncome: number;
  thisMonthExpense: number;
  inHandBalance: number;
  inAccountBalance: number;
  inHandIncome: number;
  inHandExpense: number;
  inAccountIncome: number;
  inAccountExpense: number;
  omittedCash?: number;
  totalPhysicalCash?: number;
  omittedTransactionsCount?: number;
}

// Convert Income or Expense to UnifiedTransaction
export const toUnified = (
  item: Income | Expense,
  type: 'income' | 'expense'
): UnifiedTransaction => ({
  _id: item._id,
  title: item.title,
  amount: item.amount,
  type,
  date: item.date,
  category: item.category,
  description: item.description,
  userId: item.userId,
  paymentMode: item.paymentMode === 'cash' ? 'cash' : 'online',
  excludeFromTotal: item.excludeFromTotal,
  omittedAmount: item.omittedAmount,
});

// Sort unified transactions date-descending
export const sortUnifiedTransactions = (
  incomes: Income[],
  expenses: Expense[]
): UnifiedTransaction[] => {
  const unifiedIncomes = incomes.map((i) => toUnified(i, 'income'));
  const unifiedExpenses = expenses.map((e) => toUnified(e, 'expense'));
  return [...unifiedIncomes, ...unifiedExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

// Calculate effective amount (respecting excludeFromTotal and partial omitted amounts)
export const getEffectiveAmount = (item: Income | Expense): number => {
  if (item.excludeFromTotal) return 0;
  if (item.omittedAmount && item.omittedAmount > 0) {
    return Math.max(0, item.amount - item.omittedAmount);
  }
  return item.amount;
};

// Pure function: Computes FinancialSummary from datasets synchronously in 0ms
export const computeFinancialSummary = (
  incomes: Income[],
  expenses: Expense[],
  cashData?: CashDenominationResponse | null
): FinancialSummary => {
  let omittedTransactionsCount = 0;
  incomes.forEach((i) => {
    if (i.excludeFromTotal || (i.omittedAmount && i.omittedAmount > 0)) {
      omittedTransactionsCount++;
    }
  });
  expenses.forEach((e) => {
    if (e.excludeFromTotal || (e.omittedAmount && e.omittedAmount > 0)) {
      omittedTransactionsCount++;
    }
  });

  const totalIncome = incomes.reduce((sum, item) => sum + getEffectiveAmount(item), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + getEffectiveAmount(item), 0);

  const inHandIncome = incomes
    .filter((i) => i.paymentMode === 'cash')
    .reduce((sum, item) => sum + getEffectiveAmount(item), 0);
  const inHandExpense = expenses
    .filter((e) => e.paymentMode === 'cash')
    .reduce((sum, item) => sum + getEffectiveAmount(item), 0);

  const inAccountIncome = incomes
    .filter((i) => i.paymentMode !== 'cash')
    .reduce((sum, item) => sum + getEffectiveAmount(item), 0);
  const inAccountExpense = expenses
    .filter((e) => e.paymentMode !== 'cash')
    .reduce((sum, item) => sum + getEffectiveAmount(item), 0);
  const inAccountBalance = inAccountIncome - inAccountExpense;

  // In-Hand Cash Calculation
  let inHandBalance = inHandIncome - inHandExpense;
  let totalPhysicalCash = inHandBalance;
  let omittedCash = 0;

  if (cashData) {
    totalPhysicalCash = cashData.totalInHandCash;
    const isOmittedActive =
      cashData.isOmittedActive !== undefined
        ? cashData.isOmittedActive
        : Boolean((cashData.omittedAmount || 0) > 0);
    omittedCash = isOmittedActive ? cashData.omittedAmount || 0 : 0;

    if (cashData.totalInHandCash > 0 || (cashData.omittedAmount || 0) > 0) {
      inHandBalance = Math.max(0, totalPhysicalCash - omittedCash);
    }
  }

  const currentBalance = inAccountBalance + inHandBalance;

  const thisMonthIncome = incomes
    .filter((item) => isCurrentMonth(item.date))
    .reduce((sum, item) => sum + getEffectiveAmount(item), 0);

  const thisMonthExpense = expenses
    .filter((item) => isCurrentMonth(item.date))
    .reduce((sum, item) => sum + getEffectiveAmount(item), 0);

  const savingsRate =
    totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;

  const expenseRatio =
    totalIncome > 0 ? Math.min(100, Math.round((totalExpenses / totalIncome) * 100)) : 0;

  return {
    totalIncome,
    totalExpenses,
    currentBalance,
    savingsRate,
    expenseRatio,
    thisMonthIncome,
    thisMonthExpense,
    inHandBalance,
    inAccountBalance,
    inHandIncome,
    inHandExpense,
    inAccountIncome,
    inAccountExpense,
    omittedCash,
    totalPhysicalCash,
    omittedTransactionsCount,
  };
};

// In-flight request deduplication to prevent duplicate concurrent network bursts
let activeFetchPromise: Promise<{
  incomes: Income[];
  expenses: Expense[];
  cashData: CashDenominationResponse | null;
  unifiedTransactions: UnifiedTransaction[];
  summary: FinancialSummary;
}> | null = null;

let lastFetchTime = 0;
const CACHE_TTL_MS = 2500; // 2.5s TTL for deduplication

let cachedResult: {
  incomes: Income[];
  expenses: Expense[];
  cashData: CashDenominationResponse | null;
  unifiedTransactions: UnifiedTransaction[];
  summary: FinancialSummary;
} | null = null;

export const transactionService = {
  async fetchAllTransactions(
    forceRefresh = false,
    params?: TransactionQueryParams
  ): Promise<{
    incomes: Income[];
    expenses: Expense[];
    cashData: CashDenominationResponse | null;
    unifiedTransactions: UnifiedTransaction[];
    summary: FinancialSummary;
  }> {
    const hasParams = params && Object.keys(params).length > 0;
    const now = Date.now();

    // If cache is fresh and not forcing refresh and no custom query params, return immediately with 0 network latency
    if (!forceRefresh && !hasParams && cachedResult && now - lastFetchTime < CACHE_TTL_MS) {
      return cachedResult;
    }

    // If a request is already flying and no custom params, reuse it instead of spawning 3 more HTTP calls
    if (!hasParams && activeFetchPromise) {
      return activeFetchPromise;
    }

    const fetchPromise = (async () => {
      try {
        let incomes: Income[];
        let expenses: Expense[];
        let cashData: CashDenominationResponse | null = null;

        try {
          // Attempt unified single-roundtrip endpoint (fastest, saves 2 round-trips)
          const response = await api.get<{
            incomes: Income[];
            expenses: Expense[];
            cashData?: CashDenominationResponse | null;
          }>('/v1/financial-overview', { params });
          incomes = response.data.incomes || [];
          expenses = response.data.expenses || [];
          cashData = response.data.cashData || null;
        } catch {
          // Fallback to legacy parallel calls if connecting to older backend instance
          const [legacyIncomes, legacyExpenses, legacyCash] = await Promise.all([
            incomeService.getIncomes(params),
            expenseService.getExpenses(params),
            cashService.getCashDenominations().catch(() => null),
          ]);
          incomes = legacyIncomes;
          expenses = legacyExpenses;
          cashData = legacyCash;
        }

        const unifiedTransactions = sortUnifiedTransactions(incomes, expenses);
        const summary = computeFinancialSummary(incomes, expenses, cashData);

        const result = {
          incomes,
          expenses,
          cashData,
          unifiedTransactions,
          summary,
        };

        if (!hasParams) {
          cachedResult = result;
          lastFetchTime = Date.now();
        }
        return result;
      } finally {
        if (!hasParams) {
          activeFetchPromise = null;
        }
      }
    })();

    if (!hasParams) {
      activeFetchPromise = fetchPromise;
    }

    return fetchPromise;
  },

  clearCache() {
    cachedResult = null;
    lastFetchTime = 0;
    activeFetchPromise = null;
  },
};
