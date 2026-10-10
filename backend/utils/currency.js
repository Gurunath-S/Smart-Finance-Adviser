/**
 * Financial & Currency Precision Utility
 * 
 * Provides integer minor-unit arithmetic (cents/paise) to prevent IEEE 754 floating point drift
 * during financial aggregations, balance calculations, and validation routines.
 */

/**
 * Converts a major unit currency amount (e.g., 10.50) to integer minor units (e.g., 1050).
 * Uses Math.round to safely convert floating points.
 */
const toMinorUnits = (amount) => {
  const num = Number(amount);
  if (isNaN(num) || !isFinite(num)) return 0;
  return Math.round(num * 100);
};

/**
 * Converts integer minor units (e.g., 1050) back to major currency units (e.g., 10.50).
 */
const fromMinorUnits = (minorUnits) => {
  const num = Number(minorUnits);
  if (isNaN(num) || !isFinite(num)) return 0;
  return Math.round(num) / 100;
};

/**
 * Rounds a financial amount to exactly 2 decimal places.
 */
const roundCurrency = (amount) => {
  return fromMinorUnits(toMinorUnits(amount));
};

/**
 * Validates and parses monetary inputs.
 * Returns { valid: boolean, amount: number, error?: string }
 */
const parseMonetaryAmount = (input) => {
  if (input === undefined || input === null || input === "") {
    return { valid: false, amount: 0, error: "Amount is required" };
  }

  const num = Number(input);
  if (isNaN(num) || !isFinite(num)) {
    return { valid: false, amount: 0, error: "Amount must be a valid number" };
  }

  if (num <= 0) {
    return { valid: false, amount: 0, error: "Amount must be a positive number" };
  }

  // Cap at reasonable maximum (1 billion) to prevent overflow
  if (num > 1000000000) {
    return { valid: false, amount: 0, error: "Amount exceeds maximum limit" };
  }

  return { valid: true, amount: roundCurrency(num) };
};

/**
 * Safely calculates summary totals (totalIncome, totalExpenses, currentBalance)
 * using integer minor-unit math to guarantee floating-point precision.
 */
const calculateFinancialSummary = (incomeItems = [], expenseItems = []) => {
  const totalIncomeMinor = incomeItems.reduce((acc, item) => acc + toMinorUnits(item.amount || 0), 0);
  const totalExpenseMinor = expenseItems.reduce((acc, item) => acc + toMinorUnits(item.amount || 0), 0);
  const balanceMinor = totalIncomeMinor - totalExpenseMinor;

  return {
    totalIncome: fromMinorUnits(totalIncomeMinor),
    totalExpenses: fromMinorUnits(totalExpenseMinor),
    currentBalance: fromMinorUnits(balanceMinor)
  };
};

module.exports = {
  toMinorUnits,
  fromMinorUnits,
  roundCurrency,
  parseMonetaryAmount,
  calculateFinancialSummary
};
