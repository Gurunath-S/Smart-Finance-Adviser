const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

describe('Authentication & Security Hardening Tests', () => {
  it('generates valid JWT tokens with user id and role', () => {
    const secret = 'test_jwt_secret_key_123';
    const payload = { id: '65f1234567890abcdef12345', role: 'user' };
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    const decoded = jwt.verify(token, secret);
    assert.equal(decoded.id, payload.id);
    assert.equal(decoded.role, payload.role);
    assert.ok(decoded.exp);
  });

  it('rejects tampered or invalid JWT signatures', () => {
    const secret = 'test_jwt_secret_key_123';
    const token = jwt.sign({ id: 'user_123' }, secret, { expiresIn: '7d' });

    assert.throws(() => {
      jwt.verify(token, 'wrong_secret_key');
    }, /invalid signature/);
  });

  it('validates email format regex rules', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    assert.equal(emailRegex.test('valid@example.com'), true);
    assert.equal(emailRegex.test('user.name+tag@domain.co.in'), true);
    assert.equal(emailRegex.test('invalid-email'), false);
    assert.equal(emailRegex.test('user@domain'), false);
    assert.equal(emailRegex.test(''), false);
  });
});
