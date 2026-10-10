/**
 * In-Memory Zero-Dependency Rate Limiting Middleware
 * 
 * Protects sensitive authentication routes from brute-force & credential stuffing attacks.
 * Tracks requests per IP address using a sliding window.
 */

const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // Default: 15 minutes
  const maxRequests = options.maxRequests || 5;          // Default: 5 attempts
  const message = options.message || 'Too many requests. Please try again later.';

  // Map<ip, { count: number, resetTime: number }>
  const hits = new Map();

  // Periodic cleanup of expired entries every 1 minute
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(ip);
      }
    }
  }, 60 * 1000);

  // Unref cleanup interval so it does not block Node.js process exit during tests
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  const middleware = (req, res, next) => {
    // Skip rate-limiting during automated unit tests if explicitly requested
    if (process.env.SKIP_RATE_LIMIT === 'true') {
      return next();
    }

    const ip = req.ip || req.socket?.remoteAddress || '127.0.0.1';
    const now = Date.now();

    let record = hits.get(ip);
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      hits.set(ip, record);
    }

    record.count += 1;

    if (record.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        message,
        retryAfterSeconds
      });
    }

    next();
  };

  middleware.reset = () => {
    hits.clear();
  };

  return middleware;
};

// Default rate limiters for auth endpoints
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: 'Too many authentication attempts. Please try again after 15 minutes.'
});

module.exports = {
  createRateLimiter,
  authRateLimiter
};
