const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  toMinorUnits,
  fromMinorUnits,
  roundCurrency,
  parseMonetaryAmount,
  calculateFinancialSummary
} = require('../utils/currency');

describe('Currency Utility - Monetary Precision Tests', () => {
  it('converts major units to minor units (cents/paise) accurately', () => {
    assert.equal(toMinorUnits(10.50), 1050);
    assert.equal(toMinorUnits(0.1 + 0.2), 30); // 0.30000000000000004 -> 30
    assert.equal(toMinorUnits(99.99), 9999);
    assert.equal(toMinorUnits(0), 0);
  });

  it('converts minor units back to major units accurately', () => {
    assert.equal(fromMinorUnits(1050), 10.50);
    assert.equal(fromMinorUnits(30), 0.30);
    assert.equal(fromMinorUnits(9999), 99.99);
  });

  it('rounds monetary amounts to 2 decimal places', () => {
    assert.equal(roundCurrency(10.504), 10.50);
    assert.equal(roundCurrency(10.506), 10.51);
    assert.equal(roundCurrency(0.1 + 0.2), 0.30);
  });

  it('parses valid monetary inputs correctly', () => {
    const res1 = parseMonetaryAmount('150.75');
    assert.equal(res1.valid, true);
    assert.equal(res1.amount, 150.75);

    const res2 = parseMonetaryAmount(50);
    assert.equal(res2.valid, true);
    assert.equal(res2.amount, 50);
  });

  it('rejects invalid or negative monetary inputs', () => {
    assert.equal(parseMonetaryAmount('-50').valid, false);
    assert.equal(parseMonetaryAmount(0).valid, false);
    assert.equal(parseMonetaryAmount('invalid').valid, false);
    assert.equal(parseMonetaryAmount(null).valid, false);
    assert.equal(parseMonetaryAmount(undefined).valid, false);
  });

  it('calculates financial summaries without floating point drift', () => {
    const incomes = [{ amount: 100.10 }, { amount: 200.20 }];
    const expenses = [{ amount: 50.15 }, { amount: 25.05 }];

    const summary = calculateFinancialSummary(incomes, expenses);

    assert.equal(summary.totalIncome, 300.30);
    assert.equal(summary.totalExpenses, 75.20);
    assert.equal(summary.currentBalance, 225.10);
  });
});
