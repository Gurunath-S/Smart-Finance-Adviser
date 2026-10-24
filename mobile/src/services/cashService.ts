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
 * Greedily allocates available denominations to match a target amount.
 * If allowHigherTender is true and exact smaller change is unavailable,
 * selects the smallest single denomination in hand that can cover the target amount.
 */
export const autoSelectDenominationsForAmount = (
  availableNotes: CashDenominationNotes,
  availableCoins: CashDenominationCoins,
  targetAmount: number,
  allowHigherTender: boolean = false
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

  let totalSelected = calculateCashTotal(selectedNotes, selectedCoins).totalCash;

  // If exact match was not found and higher tender is permitted (e.g. paying cash expense when lacking small change)
  if (allowHigherTender && totalSelected < targetAmount) {
    // Check smallest note in hand that is >= targetAmount
    const sortedNoteKeysAsc: (keyof CashDenominationNotes)[] = ['n10', 'n20', 'n50', 'n100', 'n200', 'n500'];
    const candidateNote = sortedNoteKeysAsc.find(
      (k) => NOTE_VALUES[k] >= targetAmount && (availableNotes[k] || 0) > 0
    );
    if (candidateNote) {
      return {
        notes: { [candidateNote]: 1 },
        coins: {},
        matchedAmount: NOTE_VALUES[candidateNote],
      };
    }

    // Check smallest coin in hand that is >= targetAmount
    const sortedCoinKeysAsc: (keyof CashDenominationCoins)[] = ['c1', 'c2', 'c5', 'c10', 'c20'];
    const candidateCoin = sortedCoinKeysAsc.find(
      (k) => COIN_VALUES[k] >= targetAmount && (availableCoins[k] || 0) > 0
    );
    if (candidateCoin) {
      return {
        notes: {},
        coins: { [candidateCoin]: 1 },
        matchedAmount: COIN_VALUES[candidateCoin],
      };
    }
  }

  return { notes: selectedNotes, coins: selectedCoins, matchedAmount: totalSelected };
};

/**
 * Greedily breaks down change amount into standard Indian currency denominations:
 * Notes: 500, 200, 100, 50, 20, 10
 * Coins: 20, 10, 5, 2, 1
 */
export const calculateChangeDenominations = (
  changeAmount: number
): { notes: Partial<CashDenominationNotes>; coins: Partial<CashDenominationCoins>; totalChange: number } => {
  let remaining = Math.round(changeAmount);
  if (remaining <= 0) {
    return { notes: {}, coins: {}, totalChange: 0 };
  }

  const notes: Partial<CashDenominationNotes> = {};
  const coins: Partial<CashDenominationCoins> = {};

  const noteKeys: (keyof CashDenominationNotes)[] = ['n500', 'n200', 'n100', 'n50', 'n20', 'n10'];
  for (const key of noteKeys) {
    const val = NOTE_VALUES[key];
    if (remaining >= val) {
      const count = Math.floor(remaining / val);
      notes[key] = count;
      remaining -= count * val;
    }
  }

  const coinKeys: (keyof CashDenominationCoins)[] = ['c20', 'c10', 'c5', 'c2', 'c1'];
  for (const key of coinKeys) {
    const val = COIN_VALUES[key];
    if (remaining >= val) {
      const count = Math.floor(remaining / val);
      coins[key] = count;
      remaining -= count * val;
    }
  }

  const total = calculateCashTotal(notes, coins).totalCash;
  return { notes, coins, totalChange: total };
};

/**
 * Formats a denomination breakdown into a user-friendly string
 * e.g. "1× ₹50 note, 1× ₹10 note, 1× ₹5 coin"
 */
export const formatDenominationBreakdown = (
  notes: Partial<CashDenominationNotes>,
  coins: Partial<CashDenominationCoins>
): string => {
  const parts: string[] = [];
  const noteKeys: (keyof CashDenominationNotes)[] = ['n500', 'n200', 'n100', 'n50', 'n20', 'n10'];
  for (const key of noteKeys) {
    const count = notes[key] || 0;
    if (count > 0) {
      parts.push(`${count}× ₹${NOTE_VALUES[key]} note`);
    }
  }
  const coinKeys: (keyof CashDenominationCoins)[] = ['c20', 'c10', 'c5', 'c2', 'c1'];
  for (const key of coinKeys) {
    const count = coins[key] || 0;
    if (count > 0) {
      parts.push(`${count}× ₹${COIN_VALUES[key]} coin`);
    }
  }
  return parts.length > 0 ? parts.join(', ') : 'None';
};

/**
 * Applies a cash expense transaction with change returned to user denominations:
 * - Given notes/coins are subtracted from wallet
 * - Change notes/coins are added to wallet
 */
export const applyCashExpenseWithChange = (
  currentNotes: CashDenominationNotes,
  currentCoins: CashDenominationCoins,
  givenNotes: Partial<CashDenominationNotes>,
  givenCoins: Partial<CashDenominationCoins>,
  changeNotes?: Partial<CashDenominationNotes>,
  changeCoins?: Partial<CashDenominationCoins>
): { notes: CashDenominationNotes; coins: CashDenominationCoins } => {
  const updatedNotes: CashDenominationNotes = { ...currentNotes };
  const safeChangeNotes = changeNotes || {};
  (Object.keys(NOTE_VALUES) as (keyof CashDenominationNotes)[]).forEach((key) => {
    const given = givenNotes[key] || 0;
    const change = safeChangeNotes[key] || 0;
    const current = currentNotes[key] || 0;
    updatedNotes[key] = Math.max(0, current - given) + change;
  });

  const updatedCoins: CashDenominationCoins = { ...currentCoins };
  const safeChangeCoins = changeCoins || {};
  (Object.keys(COIN_VALUES) as (keyof CashDenominationCoins)[]).forEach((key) => {
    const given = givenCoins[key] || 0;
    const change = safeChangeCoins[key] || 0;
    const current = currentCoins[key] || 0;
    updatedCoins[key] = Math.max(0, current - given) + change;
  });

  return { notes: updatedNotes, coins: updatedCoins };
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
