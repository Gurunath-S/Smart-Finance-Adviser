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

    const unifiedIncomes: UnifiedTransaction[] = incomes.map((i) => ({
      _id: i._id,
      title: i.title,
      amount: i.amount,
      type: 'income',
      date: i.date,
      category: i.category,
      description: i.description,
      userId: i.userId,
    }));

    const unifiedExpenses: UnifiedTransaction[] = expenses.map((e) => ({
      _id: e._id,
      title: e.title,
      amount: e.amount,
      type: 'expense',
      date: e.date,
      category: e.category,
      description: e.description,
      userId: e.userId,
    }));

    const unifiedTransactions = [...unifiedIncomes, ...unifiedExpenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const currentBalance = totalIncome - totalExpenses;

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
      },
    };
  },
};
