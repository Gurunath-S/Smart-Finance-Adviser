const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const verifyToken = require('../middleware/verifyToken');

describe('Authorization & User Isolation Tests', () => {
  it('rejects requests missing both cookie and authorization header', () => {
    const req = { cookies: {}, headers: {} };
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

    let nextCalled = false;
    verifyToken(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(statusSent, 403);
    assert.equal(jsonSent.message, 'Authorization token or session cookie is required');
  });

  it('extracts bearer token from authorization header correctly', () => {
    const req = {
      cookies: {},
      headers: { authorization: 'Bearer mock_token_string' }
    };

    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(code) {
        statusSent = code;
        return {
          json(payload) { jsonSent = payload; }
        };
      }
    };

    // verifyToken will fail jwt.verify with invalid mock token, returning 401
    verifyToken(req, res, () => {});
    assert.equal(statusSent, 401);
    assert.equal(jsonSent.message, 'Invalid or expired session token');
  });
});
