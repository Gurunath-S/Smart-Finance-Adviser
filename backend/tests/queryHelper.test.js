const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  escapeRegex,
  buildTransactionFilter,
  parsePaginationOptions,
  fetchTransactionsClean
} = require('../utils/queryHelper');

describe('Query Helper & Database Sanitization Tests', () => {
  it('escapes special regex characters to prevent ReDoS', () => {
    const dangerousInput = 'test.*+?^${}()|[]\\';
    const escaped = escapeRegex(dangerousInput);
    assert.equal(escaped, 'test\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
    assert.doesNotThrow(() => new RegExp(escaped, 'i'));
  });

  it('builds a transaction filter restricted to userId', () => {
    const filter = buildTransactionFilter('user_123', {});
    assert.deepEqual(filter, { userId: 'user_123' });
  });

  it('filters by valid paymentMode and ignores invalid values', () => {
    const validCash = buildTransactionFilter('user_123', { paymentMode: 'cash' });
    assert.equal(validCash.paymentMode, 'cash');

    const validOnline = buildTransactionFilter('user_123', { paymentMode: 'online' });
    assert.equal(validOnline.paymentMode, 'online');

    const invalid = buildTransactionFilter('user_123', { paymentMode: 'crypto' });
    assert.equal(invalid.paymentMode, undefined);
  });

  it('filters by category with trimming', () => {
    const filter = buildTransactionFilter('user_123', { category: '  Groceries  ' });
    assert.equal(filter.category, 'Groceries');
  });

  it('parses valid date ranges safely', () => {
    const filter = buildTransactionFilter('user_123', {
      startDate: '2026-01-01',
      endDate: '2026-01-31'
    });
    assert.ok(filter.date);
    assert.ok(filter.date.$gte instanceof Date);
    assert.ok(filter.date.$lte instanceof Date);
    assert.equal(filter.date.$gte.toISOString().slice(0, 10), '2026-01-01');
  });

  it('sanitizes text search query into safe case-insensitive regex', () => {
    const filter = buildTransactionFilter('user_123', { search: 'uber (airport)' });
    assert.ok(filter.$or);
    assert.equal(filter.$or.length, 2);
    assert.ok(filter.$or[0].title.test('Uber (Airport)'));
    assert.ok(filter.$or[1].description.test('Took Uber (airport)'));
  });

  it('parses pagination options and caps limit at 200 items', () => {
    const normal = parsePaginationOptions({ limit: '25', page: '2' });
    assert.equal(normal.limit, 25);
    assert.equal(normal.page, 2);
    assert.equal(normal.skip, 25);
    assert.equal(normal.isPaginated, false);

    const excessive = parsePaginationOptions({ limit: '5000' });
    assert.equal(excessive.limit, 200); // capped at 200
  });

  it('executes lean transaction query and attaches pagination headers if limit used', async () => {
    let capturedFilter = null;
    let selectedFields = null;

    const mockModel = {
      find(filter) {
        capturedFilter = filter;
        return {
          sort() {
            return {
              select(fields) {
                selectedFields = fields;
                return {
                  lean() {
                    return {
                      limit(n) {
                        return {
                          async exec() {
                            return [{ title: 'Salary', amount: 5000 }];
                          }
                        };
                      }
                    };
                  }
                };
              }
            };
          }
        };
      }
    };

    const headersSet = {};
    const mockRes = {
      set(key, val) {
        headersSet[key] = val;
      }
    };

    const results = await fetchTransactionsClean(
      mockModel,
      'user_999',
      { paymentMode: 'cash', limit: '10' },
      mockRes
    );

    assert.equal(capturedFilter.userId, 'user_999');
    assert.equal(capturedFilter.paymentMode, 'cash');
    assert.equal(selectedFields, '-__v');
    assert.equal(results.length, 1);
    assert.equal(headersSet['X-Page-Limit'], '10');
  });
});
