const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  generateDeterministicAdvice,
  queryOllamaProvider,
  getFinancialAdvice
} = require('../services/advisoryEngine');

describe('Zero-Cost Advisory Engine Unit Tests', () => {
  it('generates structured advice for positive monthly cash flow', () => {
    const result = generateDeterministicAdvice(50000, 100000, 40000);
    assert.equal(result.balance, 50000);
    assert.equal(result.provider, 'deterministic');
    assert.equal(result.suggestions.length, 4);

    // 50% of surplus (60k) = 30,000 for SIP
    assert.ok(result.suggestions[0].includes('30000'));
    // 30% of surplus = 18,000 for FD
    assert.ok(result.suggestions[1].includes('18000'));
    // 20% of surplus = 12,000 for PPF/Gold
    assert.ok(result.suggestions[2].includes('12000'));
    assert.ok(result.suggestions[3].includes('savings rate is 60%'));
  });

  it('handles zero income and zero expenses safely', () => {
    const result = generateDeterministicAdvice(10000, 0, 0);
    assert.equal(result.balance, 10000);
    assert.equal(result.provider, 'deterministic');
    assert.ok(result.suggestions[0].includes('No active monthly cash flow'));
    assert.ok(result.suggestions[2].includes('Current balance available: ₹10000'));
  });

  it('handles expense deficit (expenses > income) with warnings', () => {
    const result = generateDeterministicAdvice(5000, 30000, 40000);
    assert.equal(result.balance, 5000);
    assert.equal(result.provider, 'deterministic');
    assert.ok(result.suggestions[0].includes('Budget Warning'));
    assert.ok(result.suggestions[0].includes('exceed income (₹30000) by ₹10000'));
  });

  it('falls back seamlessly to deterministic engine if Ollama fails or times out', async () => {
    process.env.AI_PROVIDER = 'ollama';
    process.env.OLLAMA_HOST = 'http://127.0.0.1:99999'; // Invalid unreachable port

    const result = await getFinancialAdvice({ balance: 20000, income: 50000, expenses: 20000 });

    assert.equal(result.balance, 20000);
    assert.equal(result.provider, 'deterministic'); // Fallback triggered cleanly
    assert.ok(result.suggestions.length >= 3);

    delete process.env.AI_PROVIDER;
    delete process.env.OLLAMA_HOST;
  });

  it('queries Ollama when reachable and parses formatted string responses', async () => {
    const mockHost = 'http://localhost:11434';
    const mockFetch = async () => ({
      ok: true,
      json: async () => ({
        response: '1. SIP Plan: Invest 10k\n2. FD Plan: Save 5k\nConclusion: Good plan.'
      })
    });

    global.fetch = mockFetch;

    const suggestions = await queryOllamaProvider('test prompt', mockHost, 'llama3.2:1b', 1000);
    assert.ok(Array.isArray(suggestions));
    assert.equal(suggestions.length, 3);

    delete global.fetch;
  });
});
