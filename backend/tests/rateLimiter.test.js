const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createRateLimiter } = require('../middleware/rateLimiter');

describe('Rate Limiter Middleware Unit Tests', () => {
  it('allows requests within maxLimit and passes to next()', () => {
    const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 2 });
    const req = { ip: '192.168.1.1' };
    let nextCalled = 0;

    const res = {
      setHeader() {},
      status() {}
    };

    limiter(req, res, () => { nextCalled++; });
    limiter(req, res, () => { nextCalled++; });

    assert.equal(nextCalled, 2);
  });

  it('blocks requests exceeding maxLimit with HTTP 429 and Retry-After header', () => {
    const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 2 });
    const req = { ip: '192.168.1.2' };
    let nextCalled = 0;
    let statusSent = null;
    let jsonSent = null;
    let retryAfterHeader = null;

    const res = {
      setHeader(name, value) {
        if (name === 'Retry-After') retryAfterHeader = value;
      },
      status(code) {
        statusSent = code;
        return {
          json(payload) {
            jsonSent = payload;
          }
        };
      }
    };

    limiter(req, res, () => { nextCalled++; });
    limiter(req, res, () => { nextCalled++; });
    limiter(req, res, () => { nextCalled++; });

    assert.equal(nextCalled, 2);
    assert.equal(statusSent, 429);
    assert.ok(retryAfterHeader > 0);
    assert.ok(jsonSent.message.includes('Too many requests'));
  });

  it('isolates state per IP address', () => {
    const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 1 });
    const req1 = { ip: '10.0.0.1' };
    const req2 = { ip: '10.0.0.2' };
    let count1 = 0;
    let count2 = 0;

    const res = { setHeader() {}, status() {} };

    limiter(req1, res, () => { count1++; });
    limiter(req2, res, () => { count2++; });

    assert.equal(count1, 1);
    assert.equal(count2, 1);
  });
});
