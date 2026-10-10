/**
 * Zero-Cost Resilient Financial Advisory Engine
 * 
 * Provides deterministic, explainable financial recommendations using
 * server-validated financial metrics and minor-unit currency precision.
 * 
 * Optional Providers:
 * - 'deterministic' (Default): 100% offline, zero-cost rule engine.
 * - 'ollama': Local LLM via OLLAMA_HOST with strict 3s timeout & fallback.
 * - 'cohere': Cohere API (Opt-in only when CO_API_KEY & AI_PROVIDER=cohere set).
 */

const { toMinorUnits, fromMinorUnits, roundCurrency } = require('../utils/currency');

/**
 * Computes deterministic financial advice based on balance, income, and expenses.
 * Returns { balance: number, suggestions: string[], provider: 'deterministic' }
 */
const generateDeterministicAdvice = (rawBalance = 0, rawIncome = 0, rawExpenses = 0) => {
  const balance = roundCurrency(rawBalance);
  const income = roundCurrency(rawIncome);
  const expenses = roundCurrency(rawExpenses);

  const incomeMinor = toMinorUnits(income);
  const expensesMinor = toMinorUnits(expenses);
  const surplusMinor = incomeMinor - expensesMinor;
  const surplus = fromMinorUnits(surplusMinor);

  const suggestions = [];

  // Case 1: Zero income and zero expenses
  if (incomeMinor === 0 && expensesMinor === 0) {
    suggestions.push(
      "1. No active monthly cash flow recorded. Keep your current balance in a high-yield Savings Account or short-term Fixed Deposit (FD) for maximum liquidity."
    );
    suggestions.push(
      "2. Record your regular income and expenses in the app to receive customized asset allocation targets."
    );
    suggestions.push(
      `Conclusion: Focus on establishing a predictable monthly income before committing to long-term equity SIPs. Current balance available: ₹${balance}.`
    );

    return { balance, suggestions, provider: 'deterministic' };
  }

  // Case 2: Expense deficit (Expenses exceed Income)
  if (surplusMinor < 0) {
    const deficit = Math.abs(surplus);
    suggestions.push(
      `1. Budget Warning: Monthly expenses (₹${expenses}) exceed income (₹${income}) by ₹${deficit}. Immediately review and reduce discretionary spending.`
    );
    suggestions.push(
      "2. Capital Protection: Pause new market-linked investments (SIP/Mutual Funds) until monthly cash flow becomes positive."
    );
    suggestions.push(
      `Conclusion: Allocate available balance (₹${balance}) toward high-liquidity Fixed Deposits (FD) to cover emergency needs until expenses are stabilized.`
    );

    return { balance, suggestions, provider: 'deterministic' };
  }

  // Case 3: Positive Cash Surplus
  const savingsRate = incomeMinor > 0 ? Math.round((surplusMinor / incomeMinor) * 100) : 0;
  const sipAlloc = roundCurrency(surplus * 0.50); // 50% to Equity/Mutual Funds
  const fdAlloc = roundCurrency(surplus * 0.30);  // 30% to FD / Liquid Buffer
  const ppfAlloc = roundCurrency(surplus * 0.20); // 20% to PPF / Gold / Capital Preservation

  suggestions.push(
    `1. Systematic Investment Plan (SIP) / Mutual Funds: Allocate ₹${sipAlloc}/month (50% of surplus) into diversified index or flexi-cap funds for long-term growth.`
  );
  suggestions.push(
    `2. Fixed Deposit (FD) & Liquid Buffer: Allocate ₹${fdAlloc}/month (30% of surplus) to build a 3-to-6 month emergency fund.`
  );
  suggestions.push(
    `3. Public Provident Fund (PPF) & Sovereign Gold: Allocate ₹${ppfAlloc}/month (20% of surplus) for tax-exempt capital preservation.`
  );
  suggestions.push(
    `Conclusion: Your current savings rate is ${savingsRate}% with a monthly surplus of ₹${surplus}. Following this 50-30-20 allocation balances liquidity with long-term compound growth.`
  );

  return { balance, suggestions, provider: 'deterministic' };
};

/**
 * Attempts local Ollama inference if configured and enabled.
 * Times out after timeoutMs (default 3000ms) and falls back to deterministic advice on error.
 */
const queryOllamaProvider = async (prompt, host, model = 'llama3.2:1b', timeoutMs = 3000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const endpoint = `${host.replace(/\/$/, '')}/api/generate`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: { temperature: 0.2, num_predict: 300 }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama HTTP error ${response.status}`);
    }

    const data = await response.json();
    const text = data?.response?.trim();

    if (!text) {
      throw new Error("Empty response from Ollama model");
    }

    const suggestions = text.split('\n').map(s => s.trim()).filter(Boolean);
    return suggestions.length >= 2 ? suggestions : null;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn("Ollama provider fallback triggered:", error.message);
    return null;
  }
};

/**
 * Main Advisory Orchestrator
 * Resolves advice based on environment configuration with guaranteed fallback to deterministic engine.
 */
const getFinancialAdvice = async ({ balance = 0, income = 0, expenses = 0 }) => {
  const deterministicResult = generateDeterministicAdvice(balance, income, expenses);
  const providerMode = (process.env.AI_PROVIDER || 'deterministic').toLowerCase();

  // Mode: Ollama (Local LLM)
  if (providerMode === 'ollama' && process.env.OLLAMA_HOST) {
    const prompt = `Financial Profile: Balance=${deterministicResult.balance}, Monthly Income=${income}, Monthly Expenses=${expenses}.
Provide a 3-point structured allocation plan (SIP, FD, PPF/Gold) and a short conclusion under 150 words.`;

    const ollamaSuggestions = await queryOllamaProvider(
      prompt,
      process.env.OLLAMA_HOST,
      process.env.OLLAMA_MODEL || 'llama3.2:1b',
      Number(process.env.OLLAMA_TIMEOUT_MS) || 3000
    );

    if (ollamaSuggestions && ollamaSuggestions.length > 0) {
      return {
        balance: deterministicResult.balance,
        suggestions: ollamaSuggestions,
        provider: 'ollama'
      };
    }
  }

  // Fallback / Default: Deterministic Advice Engine
  return deterministicResult;
};

module.exports = {
  generateDeterministicAdvice,
  queryOllamaProvider,
  getFinancialAdvice
};
