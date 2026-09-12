export type UserRole = 'user' | 'admin';

export interface User {
  _id?: string;
  id?: string;
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  profileImage?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export type TransactionType = 'income' | 'expense';

export type IncomeCategory =
  | 'salary'
  | 'freelancing'
  | 'investments'
  | 'stocks'
  | 'bitcoin'
  | 'bank'
  | 'youtube'
  | 'other';

export type ExpenseCategory =
  | 'education'
  | 'groceries'
  | 'health'
  | 'subscriptions'
  | 'takeaways'
  | 'clothing'
  | 'travelling'
  | 'other';

export interface Income {
  _id: string;
  title: string;
  amount: number;
  type?: 'income';
  date: string;
  category: IncomeCategory | string;
  description: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  type?: 'expense';
  date: string;
  category: ExpenseCategory | string;
  description: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UnifiedTransaction {
  _id: string;
  title: string;
  amount: number;
  type: TransactionType;
  date: string;
  category: string;
  description: string;
  userId: string;
}

export interface SuggestionHistoryItem {
  _id: string;
  userId: string;
  suggestions: string[];
  itemsUsedCount: number;
  date: string;
  createdAt: string;
}

export interface SuggestionApiResponse {
  balance: number;
  suggestions: string[];
}

// Navigation Param Lists
export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  TransactionsTab: undefined;
  ToolsTab: undefined;
  ProfileTab: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  AddIncome: undefined;
  AddExpense: undefined;
  Suggestions: undefined;
  SIPCalculator: undefined;
  SWPCalculator: undefined;
  FDCalculator: undefined;
  MutualFundCalculator: undefined;
  PPFCalculator: undefined;
  GoldCalculator: undefined;
};

// Calculator Types
export interface SIPResult {
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
  yearlyData: number[];
}

export interface SWPResult {
  totalWithdrawn: number;
  remainingCorpus: number;
  finalValue: number;
  yearlyData: number[];
}

export interface FDResult {
  principal: number;
  interestEarned: number;
  maturityValue: number;
  yearlyData: number[];
}

export interface MFResult {
  principal: number;
  estimatedReturns: number;
  totalValue: number;
  yearlyData: number[];
}

export interface PPFResult {
  totalInvested: number;
  interestEarned: number;
  maturityValue: number;
  yearlyData: number[];
}

export interface GoldResult {
  initialInvestment: number;
  estimatedGain: number;
  totalValue: number;
  yearlyData: number[];
}
