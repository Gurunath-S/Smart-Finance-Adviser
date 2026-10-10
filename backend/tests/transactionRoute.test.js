const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { fetchTransactions } = require('../controllers/transactionController');
const ExpenseSchema = require('../models/ExpenseModel');
const IncomeSchema = require('../models/IncomeModel');

describe('Transaction Controller & Ownership Route Tests', () => {
  it('denies access when req.userId does not match targetUserId and user is not admin', async () => {
    const req = {
      params: { userId: 'user_456' },
      userId: 'user_123',
      userRole: 'user'
    };

    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(code) {
        statusSent = code;
        return {
          json(payload) {
            jsonSent = payload;
          }
        };
      }
    };

    await fetchTransactions(req, res);

    assert.equal(statusSent, 403);
    assert.equal(jsonSent.message, 'Access denied: you can only view your own transactions.');
  });

  it('resolves "me" alias parameter to operating user id and queries database', async () => {
    const origExpenseFind = ExpenseSchema.find;
    const origIncomeFind = IncomeSchema.find;

    // Fast unit test mock for find()
    ExpenseSchema.find = () => ({
      sort: () => ({
        lean: async () => [{ title: 'Coffee', amount: 5 }]
      })
    });
    IncomeSchema.find = () => ({
      sort: () => ({
        lean: async () => [{ title: 'Salary', amount: 5000 }]
      })
    });

    try {
      const req = {
        params: { userId: 'me' },
        userId: 'user_123',
        userRole: 'user'
      };

      let statusSent = null;
      let jsonSent = null;
      const res = {
        status(code) {
          statusSent = code;
          return {
            json(payload) {
              jsonSent = payload;
            }
          };
        }
      };

      await fetchTransactions(req, res);

      assert.equal(statusSent, 200);
      assert.equal(jsonSent.expenses.length, 1);
      assert.equal(jsonSent.incomes.length, 1);
    } finally {
      // Restore original methods
      ExpenseSchema.find = origExpenseFind;
      IncomeSchema.find = origIncomeFind;
    }
  });
});
