import { incomeService } from './incomeService';
import { expenseService } from './expenseService';
import { Income, Expense, UnifiedTransaction } from '../types';
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
}

export const transactionService = {
  async fetchAllTransactions(): Promise<{
    incomes: Income[];
    expenses: Expense[];
    unifiedTransactions: UnifiedTransaction[];
    summary: FinancialSummary;
  }> {
    const [incomes, expenses] = await Promise.all([
      incomeService.getIncomes(),
      expenseService.getExpenses(),
    ]);

    const toUnified = (item: Income | Expense, type: 'income' | 'expense'): UnifiedTransaction => ({
      _id: item._id,
      title: item.title,
      amount: item.amount,
      type,
      date: item.date,
      category: item.category,
      description: item.description,
      userId: item.userId,
      paymentMode: item.paymentMode === 'cash' ? 'cash' : 'online',
    });

    const unifiedIncomes = incomes.map((i) => toUnified(i, 'income'));
    const unifiedExpenses = expenses.map((e) => toUnified(e, 'expense'));

    const unifiedTransactions = [...unifiedIncomes, ...unifiedExpenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const currentBalance = totalIncome - totalExpenses;

    const inHandIncome = incomes
      .filter((i) => i.paymentMode === 'cash')
      .reduce((sum, item) => sum + item.amount, 0);
    const inHandExpense = expenses
      .filter((e) => e.paymentMode === 'cash')
      .reduce((sum, item) => sum + item.amount, 0);
    const inHandBalance = inHandIncome - inHandExpense;

    const inAccountIncome = incomes
      .filter((i) => i.paymentMode !== 'cash')
      .reduce((sum, item) => sum + item.amount, 0);
    const inAccountExpense = expenses
      .filter((e) => e.paymentMode !== 'cash')
      .reduce((sum, item) => sum + item.amount, 0);
    const inAccountBalance = inAccountIncome - inAccountExpense;

    const thisMonthIncome = incomes
      .filter((item) => isCurrentMonth(item.date))
      .reduce((sum, item) => sum + item.amount, 0);

    const thisMonthExpense = expenses
      .filter((item) => isCurrentMonth(item.date))
      .reduce((sum, item) => sum + item.amount, 0);

    const savingsRate =
      totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;

    const expenseRatio =
      totalIncome > 0 ? Math.min(100, Math.round((totalExpenses / totalIncome) * 100)) : 0;

    return {
      incomes,
      expenses,
      unifiedTransactions,
      summary: {
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
      },
    };
  },
};
