import { api } from './api';
import { CashDenominations, CashDenominationNotes, CashDenominationCoins } from '../types';

export interface CashDenominationResponse {
  denominations: CashDenominations;
  totalNotes: number;
  totalCoins: number;
  totalInHandCash: number;
  message?: string;
}

export const defaultNotes: CashDenominationNotes = {
  n500: 0,
  n200: 0,
  n100: 0,
  n50: 0,
  n20: 0,
  n10: 0,
};

export const defaultCoins: CashDenominationCoins = {
  c20: 0,
  c10: 0,
  c5: 0,
  c2: 0,
  c1: 0,
};

export const calculateCashTotal = (
  notes: Partial<CashDenominationNotes>,
  coins: Partial<CashDenominationCoins>
): { totalNotes: number; totalCoins: number; totalCash: number } => {
  const n = { ...defaultNotes, ...notes };
  const c = { ...defaultCoins, ...coins };

  const totalNotes =
    n.n500 * 500 +
    n.n200 * 200 +
    n.n100 * 100 +
    n.n50 * 50 +
    n.n20 * 20 +
    n.n10 * 10;

  const totalCoins =
    c.c20 * 20 +
    c.c10 * 10 +
    c.c5 * 5 +
    c.c2 * 2 +
    c.c1 * 1;

  return {
    totalNotes,
    totalCoins,
    totalCash: totalNotes + totalCoins,
  };
};

export const cashService = {
  async getCashDenominations(): Promise<CashDenominationResponse> {
    const response = await api.get<CashDenominationResponse>('/users/cash-denominations');
    return response.data;
  },

  async updateCashDenominations(
    notes: CashDenominationNotes,
    coins: CashDenominationCoins
  ): Promise<CashDenominationResponse> {
    const response = await api.put<CashDenominationResponse>('/users/cash-denominations', {
      notes,
      coins,
    });
    return response.data;
  },
};
