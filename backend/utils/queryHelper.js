/**
 * Professional Query & Pagination Helper for MongoDB / Mongoose
 * 
 * Provides:
 * 1. Safe input sanitization and ReDoS prevention for text search
 * 2. Strict validation of dates, numeric ranges, and enum values
 * 3. Compound index-aligned query generation (ESR: Equality, Sort, Range)
 * 4. Backward-compatible lean fetching with optional pagination & metadata
 */

/**
 * Escapes special characters for safe use in RegExp to prevent ReDoS / regex injection.
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds a sanitized MongoDB query filter for transactions (Expenses / Incomes).
 * Aligns strictly with compound indexes:
 * - { userId: 1, date: -1 }
 * - { userId: 1, paymentMode: 1, date: -1 }
 * - { userId: 1, category: 1, date: -1 }
 * 
 * @param {string} userId - Operating user's ID
 * @param {object} query - Query parameters from req.query
 * @returns {object} Sanitized Mongoose filter object
 */
function buildTransactionFilter(userId, query = {}) {
  const filter = { userId: String(userId) };

  // 1. Payment mode filter ('cash' | 'online')
  if (query.paymentMode) {
    const mode = String(query.paymentMode).toLowerCase().trim();
    if (mode === 'cash' || mode === 'online') {
      filter.paymentMode = mode;
    }
  }

  // 2. Category filter (exact match, case-insensitive or trimmed)
  if (query.category) {
    const cat = String(query.category).trim();
    if (cat.length > 0 && cat.length <= 50) {
      filter.category = cat;
    }
  }

  // 3. Date range filter (startDate / from, endDate / to)
  const startDateStr = query.startDate || query.from;
  const endDateStr = query.endDate || query.to;

  const dateFilter = {};
  if (startDateStr) {
    const parsedStart = new Date(startDateStr);
    if (!isNaN(parsedStart.getTime())) {
      dateFilter.$gte = parsedStart;
    }
  }

  if (endDateStr) {
    const parsedEnd = new Date(endDateStr);
    if (!isNaN(parsedEnd.getTime())) {
      // If end date is YYYY-MM-DD without time, include full end day
      if (typeof endDateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(endDateStr)) {
        parsedEnd.setHours(23, 59, 59, 999);
      }
      dateFilter.$lte = parsedEnd;
    }
  }

  if (Object.keys(dateFilter).length > 0) {
    filter.date = dateFilter;
  }

  // 4. Amount range filter (minAmount, maxAmount)
  const amountFilter = {};
  if (query.minAmount !== undefined && query.minAmount !== '') {
    const min = Number(query.minAmount);
    if (!isNaN(min) && min >= 0) {
      amountFilter.$gte = min;
    }
  }
  if (query.maxAmount !== undefined && query.maxAmount !== '') {
    const max = Number(query.maxAmount);
    if (!isNaN(max) && max >= 0) {
      amountFilter.$lte = max;
    }
  }
  if (Object.keys(amountFilter).length > 0) {
    filter.amount = amountFilter;
  }

  // 5. Text search on title or description (safe regex)
  if (query.search) {
    const searchStr = String(query.search).trim();
    if (searchStr.length > 0 && searchStr.length <= 100) {
      const escaped = escapeRegex(searchStr);
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }
  }

  return filter;
}

/**
 * Parses and bounds pagination parameters.
 * @param {object} query - Query parameters from req.query
 * @param {object} defaults - Optional default overrides
 * @returns {object} { limit, skip, page, isPaginated }
 */
function parsePaginationOptions(query = {}, defaults = {}) {
  const isPaginated = query.paginate === 'true' || query.paginated === 'true';

  let limit = null;
  if (query.limit !== undefined && query.limit !== '') {
    const parsed = parseInt(query.limit, 10);
    if (!isNaN(parsed) && parsed > 0) {
      // Hard cap at 200 items per fetch to prevent unbounded payload/memory pressure
      limit = Math.min(parsed, 200);
    }
  } else if (isPaginated) {
    limit = defaults.defaultLimit || 20;
  }

  let page = 1;
  if (query.page !== undefined && query.page !== '') {
    const parsedPage = parseInt(query.page, 10);
    if (!isNaN(parsedPage) && parsedPage > 0) {
      page = parsedPage;
    }
  }

  let skip = 0;
  if (query.skip !== undefined && query.skip !== '') {
    const parsedSkip = parseInt(query.skip, 10);
    if (!isNaN(parsedSkip) && parsedSkip >= 0) {
      skip = parsedSkip;
    }
  } else if (limit && page > 1) {
    skip = (page - 1) * limit;
  }

  return { limit, skip, page, isPaginated };
}

/**
 * Executes an optimized Mongoose query with indexing, projections, and lean serialization.
 * 
 * @param {object} Model - Mongoose model (ExpenseSchema or IncomeSchema)
 * @param {string} userId - Operating user's ID
 * @param {object} queryParams - req.query object
 * @param {object} [res] - Express response object (optional, for setting pagination headers)
 * @returns {Promise<Array|object>} Clean plain JS array or paginated object
 */
async function fetchTransactionsClean(Model, userId, queryParams = {}, res = null) {
  const filter = buildTransactionFilter(userId, queryParams);
  const { limit, skip, page, isPaginated } = parsePaginationOptions(queryParams);

  let queryBuilder = Model.find(filter)
    .sort({ date: -1 })
    .select('-__v')
    .lean();

  if (skip > 0) {
    queryBuilder = queryBuilder.skip(skip);
  }
  if (limit && limit > 0) {
    queryBuilder = queryBuilder.limit(limit);
  }

  if (isPaginated) {
    const [data, total] = await Promise.all([
      queryBuilder.exec(),
      Model.countDocuments(filter)
    ]);
    const totalPages = limit ? Math.ceil(total / limit) : 1;

    return {
      data,
      pagination: {
        total,
        page,
        totalPages,
        limit: limit || total,
        hasMore: page < totalPages
      }
    };
  }

  // Standard fetch (default): returns array directly for 100% backward compatibility
  const data = await queryBuilder.exec();

  // If response object provided and limit was used, attach pagination metadata headers
  if (res && typeof res.set === 'function' && limit) {
    res.set('X-Page-Limit', String(limit));
    res.set('X-Page-Skip', String(skip));
  }

  return data;
}

module.exports = {
  escapeRegex,
  buildTransactionFilter,
  parsePaginationOptions,
  fetchTransactionsClean
};
