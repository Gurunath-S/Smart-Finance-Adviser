import { api } from './api';
import { CashDenominations, CashDenominationNotes, CashDenominationCoins } from '../types';

export interface CashDenominationResponse {
  denominations: CashDenominations;
  totalNotes: number;
  totalCoins: number;
  totalInHandCash: number;
  omittedAmount?: number;
  isOmittedActive?: boolean;
  effectiveInHandCash?: number;
  message?: string;
}

export const NOTE_VALUES: Record<keyof CashDenominationNotes, number> = {
  n500: 500,
  n200: 200,
  n100: 100,
  n50: 50,
  n20: 20,
  n10: 10,
};

export const COIN_VALUES: Record<keyof CashDenominationCoins, number> = {
  c20: 20,
  c10: 10,
  c5: 5,
  c2: 2,
  c1: 1,
};

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

/**
 * Applies a transaction's selected notes/coins to current user denominations
 * @param currentNotes Current notes in hand
 * @param currentCoins Current coins in hand
 * @param deltaNotes Notes to add or subtract
 * @param deltaCoins Coins to add or subtract
 * @param type 'expense' (subtract) or 'income' (add)
 */
export const applyCashTransactionToDenominations = (
  currentNotes: CashDenominationNotes,
  currentCoins: CashDenominationCoins,
  deltaNotes: Partial<CashDenominationNotes>,
  deltaCoins: Partial<CashDenominationCoins>,
  type: 'expense' | 'income'
): { notes: CashDenominationNotes; coins: CashDenominationCoins } => {
  const multiplier = type === 'expense' ? -1 : 1;

  const updatedNotes: CashDenominationNotes = { ...currentNotes };
  (Object.keys(NOTE_VALUES) as (keyof CashDenominationNotes)[]).forEach((key) => {
    const delta = (deltaNotes[key] || 0) * multiplier;
    updatedNotes[key] = Math.max(0, (currentNotes[key] || 0) + delta);
  });

  const updatedCoins: CashDenominationCoins = { ...currentCoins };
  (Object.keys(COIN_VALUES) as (keyof CashDenominationCoins)[]).forEach((key) => {
    const delta = (deltaCoins[key] || 0) * multiplier;
    updatedCoins[key] = Math.max(0, (currentCoins[key] || 0) + delta);
  });

  return { notes: updatedNotes, coins: updatedCoins };
};

/**
 * Greedily allocates available denominations to match a target amount
 */
export const autoSelectDenominationsForAmount = (
  availableNotes: CashDenominationNotes,
  availableCoins: CashDenominationCoins,
  targetAmount: number
): { notes: Partial<CashDenominationNotes>; coins: Partial<CashDenominationCoins>; matchedAmount: number } => {
  let remaining = Math.round(targetAmount);
  const selectedNotes: Partial<CashDenominationNotes> = {};
  const selectedCoins: Partial<CashDenominationCoins> = {};

  const noteKeys: (keyof CashDenominationNotes)[] = ['n500', 'n200', 'n100', 'n50', 'n20', 'n10'];
  for (const key of noteKeys) {
    const val = NOTE_VALUES[key];
    const available = availableNotes[key] || 0;
    if (val <= remaining && available > 0) {
      const needed = Math.floor(remaining / val);
      const used = Math.min(needed, available);
      if (used > 0) {
        selectedNotes[key] = used;
        remaining -= used * val;
      }
    }
  }

  const coinKeys: (keyof CashDenominationCoins)[] = ['c20', 'c10', 'c5', 'c2', 'c1'];
  for (const key of coinKeys) {
    const val = COIN_VALUES[key];
    const available = availableCoins[key] || 0;
    if (val <= remaining && available > 0) {
      const needed = Math.floor(remaining / val);
      const used = Math.min(needed, available);
      if (used > 0) {
        selectedCoins[key] = used;
        remaining -= used * val;
      }
    }
  }

  const totalSelected = calculateCashTotal(selectedNotes, selectedCoins).totalCash;
  return { notes: selectedNotes, coins: selectedCoins, matchedAmount: totalSelected };
};

export const cashService = {
  async getCashDenominations(): Promise<CashDenominationResponse> {
    const response = await api.get<CashDenominationResponse>('/users/cash-denominations');
    return response.data;
  },

  async updateCashDenominations(
    notes: CashDenominationNotes,
    coins: CashDenominationCoins,
    omittedAmount?: number,
    isOmittedActive?: boolean
  ): Promise<CashDenominationResponse> {
    const response = await api.put<CashDenominationResponse>('/users/cash-denominations', {
      notes,
      coins,
      omittedAmount,
      isOmittedActive,
    });
    return response.data;
  },
};
