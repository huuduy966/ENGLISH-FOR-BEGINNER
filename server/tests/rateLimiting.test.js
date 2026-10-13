process.env.NODE_ENV = 'test';
process.env.PORT = '5003';
process.env.RATE_LIMIT_GLOBAL_MAX = '50'; // Test threshold

const app = require('../src/app');
const {
  createRateLimiter,
  globalLimiter,
  loginFailureLimiter,
  translationLimiter,
  _resetAllLimiters,
} = require('../src/middlewares/rateLimiter');

async function runRateLimitingTests() {
  console.log('=== Starting E4B Rate Limiting Test Suite ===');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✔ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✖ FAIL: ${message}`);
      failed++;
    }
  }

  const server = app.listen(5003);
  const BASE_URL = 'http://localhost:5003/api';

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Health check is exempted from rate limiting
    // -------------------------------------------------------------------------
    _resetAllLimiters();
    let healthSuccess = true;
    for (let i = 0; i < 5; i++) {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.status !== 200) {
        healthSuccess = false;
        break;
      }
    }
    assert(healthSuccess, 'Endpoint /api/health bypasses rate limiting successfully');

    // -------------------------------------------------------------------------
    // TEST 2: Under threshold requests receive RateLimit headers
    // -------------------------------------------------------------------------
    _resetAllLimiters();
    const normalRes = await fetch(`${BASE_URL}/vocabulary/topics`);
    const limitHeader = normalRes.headers.get('ratelimit-limit');
    const remainingHeader = normalRes.headers.get('ratelimit-remaining');

    assert(
      normalRes.status === 200 && limitHeader !== null && remainingHeader !== null,
      'Normal request under threshold returns 200 and standard RateLimit headers'
    );

    // -------------------------------------------------------------------------
    // TEST 3: Custom mini rate limiter triggers HTTP 429 when threshold exceeded
    // -------------------------------------------------------------------------
    const testLimiter = createRateLimiter({
      windowMs: 5000,
      max: 3,
      message: 'Rate limit test exceeded',
    });

    const mockReq = { ip: '10.0.0.1', path: '/test', method: 'GET' };
    const mockRes = () => {
      const headers = {};
      let statusCode = 200;
      let body = null;
      return {
        setHeader: (k, v) => { headers[k.toLowerCase()] = v; },
        status: (code) => { statusCode = code; return { json: (b) => { body = b; } }; },
        on: () => {},
        get statusCode() { return statusCode; },
        get body() { return body; },
        get headers() { return headers; },
      };
    };

    let hitCount = 0;
    let got429 = false;
    let retryAfterVal = null;

    for (let i = 0; i < 5; i++) {
      const res = mockRes();
      let nextCalled = false;
      testLimiter(mockReq, res, () => { nextCalled = true; });

      if (nextCalled) {
        hitCount++;
      } else if (res.statusCode === 429) {
        got429 = true;
        retryAfterVal = res.headers['retry-after'];
      }
    }

    assert(
      hitCount === 3 && got429 && retryAfterVal !== null,
      'createRateLimiter allows exactly max hits (3) then returns 429 with Retry-After header'
    );

    // -------------------------------------------------------------------------
    // TEST 4: Login Failure Limiter only penalizes failed credentials
    // -------------------------------------------------------------------------
    _resetAllLimiters();
    const loginFailLimiter = createRateLimiter({
      windowMs: 10000,
      max: 3,
      skipSuccessfulRequests: true,
      keyGenerator: (req) => `test_login_${req.body?.email}`,
    });

    // 2 successful logins should NOT use up the failed limit
    for (let i = 0; i < 2; i++) {
      const res = mockRes();
      const finishCallbacks = [];
      res.on = (event, cb) => { if (event === 'finish') finishCallbacks.push(cb); };

      let nextCalled = false;
      loginFailLimiter({ body: { email: 'user@test.com' } }, res, () => { nextCalled = true; });
      assert(nextCalled, `Successful request ${i + 1} passed through`);
      // Simulate success response
      res.status(200);
      finishCallbacks.forEach((cb) => cb());
    }

    // Now send 3 failed logins
    let blockedOnFail = false;
    for (let i = 0; i < 4; i++) {
      const res = mockRes();
      const finishCallbacks = [];
      res.on = (event, cb) => { if (event === 'finish') finishCallbacks.push(cb); };

      let nextCalled = false;
      loginFailLimiter({ body: { email: 'user@test.com' } }, res, () => { nextCalled = true; });

      if (res.statusCode === 429) {
        blockedOnFail = true;
        assert(
          res.body?.error?.code === 'RATE_LIMIT_EXCEEDED',
          '429 response contains structured error code RATE_LIMIT_EXCEEDED'
        );
      } else {
        res.status(401);
        finishCallbacks.forEach((cb) => cb());
      }
    }

    assert(blockedOnFail, 'Login failure limiter triggers 429 only after repeated failed attempts');

    // -------------------------------------------------------------------------
    // TEST 5: Translation Text Length Safeguard (> 5,000 chars rejected)
    // -------------------------------------------------------------------------
    const overlyLongText = 'A'.repeat(5001);
    const longTransRes = await fetch(`${BASE_URL}/vocabulary/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: overlyLongText }),
    });

    assert(
      longTransRes.status === 400,
      'Translation endpoint rejects payload exceeding 5,000 characters with 400 Bad Request'
    );

    // -------------------------------------------------------------------------
    // TEST 6: User-based keying distinguishes authenticated users on shared IP
    // -------------------------------------------------------------------------
    const userLimiter = createRateLimiter({
      windowMs: 5000,
      max: 2,
    });

    const user1Req = { user: { id: 101 }, ip: '192.168.1.1' };
    const user2Req = { user: { id: 102 }, ip: '192.168.1.1' }; // Same IP (NAT / campus Wi-Fi)

    // User 1 exhausts limit
    const resA = mockRes(); userLimiter(user1Req, resA, () => {});
    const resB = mockRes(); userLimiter(user1Req, resB, () => {});
    const resC = mockRes(); userLimiter(user1Req, resC, () => {});
    assert(resC.statusCode === 429, 'User 1 on shared IP is rate-limited on 3rd request');

    // User 2 should NOT be blocked despite sharing the same IP!
    const resD = mockRes();
    let user2Allowed = false;
    userLimiter(user2Req, resD, () => { user2Allowed = true; });
    assert(user2Allowed, 'User 2 on identical shared IP is NOT blocked by User 1 limit');

    // -------------------------------------------------------------------------
    // TEST 7: Reset helper clears all stored counters cleanly
    // -------------------------------------------------------------------------
    _resetAllLimiters();
    let resetAllowed = false;
    userLimiter(user1Req, mockRes(), () => { resetAllowed = true; });
    assert(resetAllowed, '_resetAllLimiters successfully cleared user counters');

  } catch (err) {
    console.error('Test suite error:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\nRate Limiting Test Results: ${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
  }
}

runRateLimitingTests();
