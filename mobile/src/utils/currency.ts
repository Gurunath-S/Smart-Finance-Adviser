/**
 * Formats a number into Indian Rupee currency string (e.g. ₹1,25,000 or ₹50,000)
 */
export const formatCurrency = (amount: number | string | undefined | null, symbol = '₹'): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num === undefined || num === null || isNaN(num)) {
    return `${symbol}0`;
  }

  // Format using Indian Numbering system (Lakhs / Crores)
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const parts = absNum.toFixed(0).split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherNumbers = parts[0].substring(0, parts[0].length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedWhole = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  return `${isNegative ? '-' : ''}${symbol}${formattedWhole}`;
};

/**
 * Compact format for badges or charts (e.g. ₹1.5L, ₹25K, ₹1.2Cr)
 */
export const formatCompactCurrency = (amount: number, symbol = '₹'): string => {
  if (!amount || isNaN(amount)) return `${symbol}0`;

  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    return `${sign}${symbol}${(abs / 10000000).toFixed(1)}Cr`;
  }
  if (abs >= 100000) {
    return `${sign}${symbol}${(abs / 100000).toFixed(1)}L`;
  }
  if (abs >= 1000) {
    return `${sign}${symbol}${(abs / 1000).toFixed(1)}K`;
  }
  return `${sign}${symbol}${abs}`;
};

export const parseNumber = (val: string): number => {
  if (!val) return 0;
  const cleaned = val.replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};
