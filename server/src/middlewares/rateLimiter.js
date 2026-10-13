// rateLimiter.js - Production-grade, zero-dependency Rate Limiting Middleware for Express
// Provides global protection and specialized limits for high-risk endpoints (Auth, Translation, Exam, Practice)

const activeStores = [];

/**
 * Periodically purge expired records from in-memory stores to keep memory footprint minimal.
 */
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const store of activeStores) {
    for (const [key, record] of store.entries()) {
      if (record.resetTime <= now) {
        store.delete(key);
      }
    }
  }
}, 30000);

if (cleanupInterval.unref) {
  cleanupInterval.unref(); // Do not hold Node process open during test/shutdown
}

/**
 * Safely extracts client IP according to Express trust proxy settings
 * @param {import('express').Request} req
 * @returns {string}
 */
function getClientIp(req) {
  if (req.ip) return req.ip;
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

/**
 * Factory to create Express rate limiting middleware
 * @param {Object} options
 * @param {number} [options.windowMs=60000] - Window duration in milliseconds
 * @param {number} [options.max=120] - Max allowed requests per window
 * @param {string} [options.message] - Custom message on 429
 * @param {string} [options.code='RATE_LIMIT_EXCEEDED'] - Error code
 * @param {Function} [options.keyGenerator] - (req) => string
 * @param {Function} [options.skip] - (req) => boolean
 * @param {boolean} [options.skipSuccessfulRequests=false] - Only count failed requests (status >= 400)
 * @param {boolean} [options.skipFailedRequests=false] - Only count successful requests (status < 400)
 */
function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 60 * 1000;
  const max = typeof options.max === 'number' ? options.max : 120;
  const message = options.message || 'Bạn gửi yêu cầu quá nhanh. Vui lòng thử lại sau.';
  const code = options.code || 'RATE_LIMIT_EXCEEDED';
  const statusCode = options.statusCode || 429;
  const skipSuccessful = Boolean(options.skipSuccessfulRequests);
  const skipFailed = Boolean(options.skipFailedRequests);
  const skipFn = typeof options.skip === 'function' ? options.skip : () => false;

  const keyGen = options.keyGenerator || ((req) => {
    // If user is already authenticated via verifyToken, key by user ID to prevent NAT/Wi-Fi collision
    if (req.user?.id) {
      return `user_${req.user.id}`;
    }
    return `ip_${getClientIp(req)}`;
  });

  const store = new Map();
  activeStores.push(store);

  const middleware = (req, res, next) => {
    if (skipFn(req)) {
      return next();
    }

    const key = keyGen(req);
    const now = Date.now();
    let record = store.get(key);

    if (!record || record.resetTime <= now) {
      record = {
        hits: 0,
        resetTime: now + windowMs,
      };
      store.set(key, record);
    }

    record.hits += 1;

    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    const remainingHits = Math.max(0, max - record.hits);

    // Standard RFC RateLimit headers
    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', remainingHits);
    res.setHeader('RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    // Handle skipSuccessfulRequests (e.g. for login failures):
    // If request turns out successful (status < 400), revert the hit
    if (skipSuccessful) {
      res.on('finish', () => {
        if (res.statusCode < 400) {
          if (record && record.hits > 0) {
            record.hits -= 1;
          }
        }
      });
    }

    // Handle skipFailedRequests
    if (skipFailed) {
      res.on('finish', () => {
        if (res.statusCode >= 400) {
          if (record && record.hits > 0) {
            record.hits -= 1;
          }
        }
      });
    }

    // Check if limit exceeded
    if (record.hits > max) {
      res.setHeader('Retry-After', retryAfterSeconds);

      // Audit warning log (excluding credentials or sensitive payload)
      if (process.env.NODE_ENV !== 'test') {
        const userId = req.user?.id ? ` (User: ${req.user.id})` : '';
        console.warn(
          `[RateLimit] ⚠️ Exceeded: ${key}${userId} on ${req.method} ${req.originalUrl || req.path} (${record.hits}/${max}) - RetryAfter: ${retryAfterSeconds}s`
        );
      }

      return res.status(statusCode).json({
        success: false,
        error: {
          code,
          message,
          retryAfter: retryAfterSeconds,
        },
        message, // For backwards compatibility with clients reading response.data.message
        retryAfter: retryAfterSeconds,
      });
    }

    next();
  };

  // Attach store reference for testing and administration
  middleware.store = store;
  middleware.reset = () => store.clear();
  return middleware;
}

// -----------------------------------------------------------------------------
// PRE-CONFIGURED LIMITERS WITH ENV OVERRIDES
// -----------------------------------------------------------------------------

/**
 * 1. Global API Limiter:
 * 120 req / 1 min per IP/User for standard APIs. Skips health checks.
 */
const globalLimiter = createRateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS, 10) || 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX, 10) || 120,
  message: 'Bạn gửi yêu cầu quá nhanh. Vui lòng chậm lại một chút.',
  skip: (req) => req.path === '/api/health' || req.path === '/health',
});

/**
 * 2. Login Endpoint Flooding Limiter:
 * 30 req / 15 mins per IP to protect the login endpoint from volume brute-force
 */
const loginEndpointLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_LOGIN_ENDPOINT_MAX, 10) || 30,
  message: 'Quá nhiều yêu cầu đăng nhập từ thiết bị của bạn. Vui lòng thử lại sau ít phút.',
  keyGenerator: (req) => `login_ip_${getClientIp(req)}`,
});

/**
 * 3. Login Failure Limiter:
 * Max 5 failed attempts within 15 minutes per IP + normalized email.
 * Only failed attempts (status >= 400) count against the limit.
 */
const loginFailureLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_LOGIN_FAIL_MAX, 10) || 5,
  message: 'Đăng nhập thất bại quá 5 lần. Vui lòng đợi 15 phút trước khi thử lại để bảo mật tài khoản.',
  code: 'LOGIN_RATE_LIMIT_EXCEEDED',
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const rawEmail = (req.body?.email || '').toString().trim().toLowerCase();
    const clientIp = getClientIp(req);
    return `login_fail_${clientIp}_${rawEmail || 'unknown'}`;
  },
});

/**
 * 4. Register Limiter:
 * Max 5 account registrations per hour per IP.
 */
const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_REGISTER_MAX, 10) || 5,
  message: 'Bạn đã đăng ký quá số tài khoản cho phép trong 1 giờ. Vui lòng thử lại sau.',
  keyGenerator: (req) => `register_ip_${getClientIp(req)}`,
});

/**
 * 5. Dictionary Lookup Limiter:
 * 60 lookups / 1 min per client.
 */
const dictionaryLookupLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_DICT_MAX, 10) || 60,
  message: 'Tần suất tra cứu từ điển quá nhanh. Vui lòng thử lại sau vài giây.',
  code: 'DICTIONARY_RATE_LIMIT_EXCEEDED',
});

/**
 * 6. Translation Limiter:
 * 20 text translations / 1 min per client to safeguard LibreTranslate and external MT providers.
 */
const translationLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_TRANSLATE_MAX, 10) || 20,
  message: 'Tần suất dịch văn bản vượt quá 20 lượt/phút. Vui lòng thử lại sau ít giây.',
  code: 'TRANSLATE_RATE_LIMIT_EXCEEDED',
});

/**
 * 7. Daily Practice Answer Limiter:
 * 90 answers / 1 min per user.
 */
const dailyPracticeAnswerLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_PRACTICE_MAX, 10) || 90,
  message: 'Bạn gửi câu trả lời quá nhanh. Vui lòng tiếp tục với tốc độ học thông thường.',
  code: 'PRACTICE_RATE_LIMIT_EXCEEDED',
});

/**
 * 8. Mock Exam Start Limiter:
 * Max 5 new attempts per 15 mins per user to prevent creating excessive exam records.
 */
const examStartLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_EXAM_START_MAX, 10) || 5,
  message: 'Bạn đã tạo quá nhiều lượt thi trong 15 phút. Vui lòng hoàn thành lượt thi hiện tại hoặc đợi trước khi tạo mới.',
  code: 'EXAM_START_RATE_LIMIT_EXCEEDED',
});

/**
 * 9. Mock Exam Submit Limiter:
 * Max 5 submissions per 1 min per user.
 */
const examSubmitLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_EXAM_SUBMIT_MAX, 10) || 5,
  message: 'Thao tác nộp bài đang được xử lý. Vui lòng không nộp bài liên tục.',
});

/**
 * 10. Placement Test Submit Limiter:
 * Max 5 submissions per 15 mins.
 */
const placementSubmitLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_PLACEMENT_MAX, 10) || 5,
  message: 'Bạn đã nộp bài kiểm tra đầu vào quá số lần cho phép. Vui lòng thử lại sau.',
});

/**
 * Testing helper to reset all in-memory limiters
 */
function _resetAllLimiters() {
  for (const store of activeStores) {
    store.clear();
  }
}

module.exports = {
  createRateLimiter,
  getClientIp,
  globalLimiter,
  loginEndpointLimiter,
  loginFailureLimiter,
  registerLimiter,
  dictionaryLookupLimiter,
  translationLimiter,
  dailyPracticeAnswerLimiter,
  examStartLimiter,
  examSubmitLimiter,
  placementSubmitLimiter,
  _resetAllLimiters,
};
