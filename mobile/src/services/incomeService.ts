import { api } from './api';
import { Income } from '../types';

export interface CreateIncomeData {
  title: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export const incomeService = {
  async getIncomes(): Promise<Income[]> {
    const response = await api.get<Income[]>('/v1/get-incomes');
    return response.data;
  },

  async addIncome(data: CreateIncomeData): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/v1/add-income', data);
    return response.data;
  },

  async deleteIncome(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/v1/delete-income/${id}`);
    return response.data;
  },
};
