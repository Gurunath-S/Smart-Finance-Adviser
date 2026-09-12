import { api } from './api';
import { Expense } from '../types';

export interface CreateExpenseData {
  title: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export const expenseService = {
  async getExpenses(): Promise<Expense[]> {
    const response = await api.get<Expense[]>('/v1/get-expenses');
    return response.data;
  },

  async addExpense(data: CreateExpenseData): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/v1/add-expense', data);
    return response.data;
  },

  async deleteExpense(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/v1/delete-expense/${id}`);
    return response.data;
  },
};
