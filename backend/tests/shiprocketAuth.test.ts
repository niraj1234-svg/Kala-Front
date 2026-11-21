/**
 * Isolated Unit Tests for Shiprocket Authentication Service (Phase 1)
 *
 * Verifies:
 * - Credential sanitization (quotes, newlines, tabs, zero-width characters)
 * - Masked email diagnostics (zero password exposure)
 * - isShiprocketConfigured() guards
 * - Accurate token expiry derivation from JWT `exp` and response `expires_in`
 * - In-memory caching and reuse of active token
 * - Proactive refresh when approaching expiry buffer
 * - Single-flight deduplication under high concurrency
 * - invalidateToken() behavior
 * - Error handling: 401/403, 429, 500, timeouts (AbortError), and malformed non-JSON
 * - Strict non-leakage of passwords or tokens in error messages
 */

import {
  sanitizeCredential,
  getMaskedShiprocketEmail,
  isShiprocketConfigured,
  getShiprocketCredentials,
} from '../src/config/shiprocketConfig'
import {
  getShiprocketToken,
  invalidateToken,
  resetShiprocketAuthForTesting,
  parseJwtExpiryMs,
  calculateTokenExpiryMs,
  isTokenValid,
  getCachedTokenInfo,
} from '../src/services/shiprocketAuthService'

// Helper to create a fake JWT with a specific `exp` claim (epoch seconds)
function createMockJwt(expSeconds: number): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({ exp: expSeconds, email: 'shipping@kala.com' })).toString('base64url')
  const signature = 'mock_signature'
  return `${header}.${payload}.${signature}`
}

let passedTests = 0
let failedTests = 0

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`)
    passedTests++
  } else {
    console.error(`  ✗ FAIL: ${message}`)
    failedTests++
  }
}

async function runTestSuite() {
  console.log('===============================================================')
  console.log(' KALA Phase 1: Shiprocket Authentication & Caching Test Suite')
  console.log('===============================================================')

  const originalEnv = { ...process.env }

  try {
    // -------------------------------------------------------------
    // Group 1: Credential Sanitization & Masking
    // -------------------------------------------------------------
    console.log('\n--- Group 1: Credential Sanitization & Masking ---')

    assert(sanitizeCredential('  shipping@kala.com \n\t') === 'shipping@kala.com', 'Strips whitespace, tabs, and newlines')
    assert(sanitizeCredential('"secret_pass_123"') === 'secret_pass_123', 'Strips double quotes')
    assert(sanitizeCredential("'secret_pass_456'") === 'secret_pass_456', 'Strips single quotes')
    assert(sanitizeCredential('\\"escaped_pass\\"') === 'escaped_pass', 'Strips escaped double quotes')
    assert(sanitizeCredential('pass\u200Bword\uFEFF') === 'password', 'Strips zero-width characters')
    assert(sanitizeCredential(null) === '', 'Handles null safely')
    assert(sanitizeCredential(undefined) === '', 'Handles undefined safely')

    assert(getMaskedShiprocketEmail('operations@kala.in') === 'op***s@kala.in', 'Masks standard email correctly')
    assert(getMaskedShiprocketEmail('ab@kala.in') === 'a*@kala.in', 'Masks short local part correctly')
    assert(getMaskedShiprocketEmail('') === '(not configured)', 'Returns not configured for empty email')
    assert(!getMaskedShiprocketEmail('shipping@kala.com').includes('secret'), 'Email diagnostic never logs secrets')

    process.env.SHIPROCKET_EMAIL = ' shipping@kala.com '
    process.env.SHIPROCKET_PASSWORD = ' super_secret_pass '
    assert(isShiprocketConfigured() === true, 'isShiprocketConfigured is true when both are present')
    assert(getShiprocketCredentials().email === 'shipping@kala.com', 'Sanitizes environment email')
    assert(getShiprocketCredentials().password === 'super_secret_pass', 'Sanitizes environment password')

    delete process.env.SHIPROCKET_PASSWORD
    assert(isShiprocketConfigured() === false, 'isShiprocketConfigured is false when password missing')

    // -------------------------------------------------------------
    // Group 2: Expiry Resolution & Parsing
    // -------------------------------------------------------------
    console.log('\n--- Group 2: Expiry Resolution & Intelligence ---')

    const futureExpSec = Math.floor(Date.now() / 1000) + 3600 // +1 hour
    const mockJwt = createMockJwt(futureExpSec)
    const parsedExp = parseJwtExpiryMs(mockJwt)
    assert(parsedExp === futureExpSec * 1000, 'Accurately parses JWT exp claim into milliseconds')

    assert(parseJwtExpiryMs('invalid-token') === null, 'Returns null on malformed JWT')
    assert(parseJwtExpiryMs('part1.not_json.part3') === null, 'Returns null on non-JSON JWT payload')

    const expiryFromJwt = calculateTokenExpiryMs({}, mockJwt)
    assert(expiryFromJwt === futureExpSec * 1000, 'Prioritizes cryptographically signed JWT exp')

    const expiryFromResponse = calculateTokenExpiryMs({ expires_in: 7200 }, 'opaque_token_string')
    assert(
      Math.abs(expiryFromResponse - (Date.now() + 7200 * 1000)) < 1000,
      'Uses expires_in seconds when token is opaque'
    )

    const fallbackExpiry = calculateTokenExpiryMs({}, 'opaque_token_no_expiry')
    assert(
      Math.abs(fallbackExpiry - (Date.now() + 24 * 60 * 60 * 1000)) < 1000,
      'Safely defaults to 24h when no expiry is supplied'
    )

    // Token validity with buffer
    const validTokenItem = {
      token: 'tok_1',
      issuedAt: Date.now(),
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes from now
      email: 'shipping@kala.com',
    }
    assert(isTokenValid(validTokenItem, 15 * 60 * 1000) === true, 'Valid token outside buffer is considered valid')

    const expiringSoonItem = {
      token: 'tok_2',
      issuedAt: Date.now() - 60 * 60 * 1000,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes remaining (< 15 min buffer)
      email: 'shipping@kala.com',
    }
    assert(isTokenValid(expiringSoonItem, 15 * 60 * 1000) === false, 'Token within buffer is flagged for proactive refresh')

    // -------------------------------------------------------------
    // Group 3: Mocked Login & In-Memory Token Caching
    // -------------------------------------------------------------
    console.log('\n--- Group 3: Mocked Login & In-Memory Caching ---')

    resetShiprocketAuthForTesting()
    process.env.SHIPROCKET_EMAIL = 'shipping@kala.com'
    process.env.SHIPROCKET_PASSWORD = 'password123'

    let networkCallCount = 0
    const mockToken = createMockJwt(Math.floor(Date.now() / 1000) + 86400) // 24h

    const mockFetchSuccess: typeof fetch = async (url, init) => {
      networkCallCount++
      assert(String(url).endsWith('/auth/login'), 'Dispatches request to /auth/login')
      assert(init?.method === 'POST', 'HTTP method is POST')

      const body = JSON.parse(String(init?.body))
      assert(body.email === 'shipping@kala.com', 'Request body contains sanitized email')
      assert(body.password === 'password123', 'Request body contains sanitized password')

      return new Response(JSON.stringify({ token: mockToken, expires_in: 86400 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Call 1: Should perform network fetch
    const token1 = await getShiprocketToken({ customFetch: mockFetchSuccess })
    assert(token1 === mockToken, 'Returns verified token from Shiprocket response')
    assert(networkCallCount === 1, 'First call dispatches exactly 1 network request')

    // Call 2: Should hit memory cache (zero network calls)
    const token2 = await getShiprocketToken({ customFetch: mockFetchSuccess })
    assert(token2 === mockToken, 'Subsequent call returns cached token')
    assert(networkCallCount === 1, 'Subsequent call made 0 additional network requests (cache hit)')

    const cachedInfo = getCachedTokenInfo()
    assert(cachedInfo.hasToken === true, 'getCachedTokenInfo reports hasToken: true')
    assert(cachedInfo.isExpired === false, 'getCachedTokenInfo reports isExpired: false')
    assert(cachedInfo.maskedEmail === 'sh***g@kala.com', 'getCachedTokenInfo returns safely masked email')

    // -------------------------------------------------------------
    // Group 4: Token Invalidation
    // -------------------------------------------------------------
    console.log('\n--- Group 4: Token Invalidation ---')

    invalidateToken()
    assert(getCachedTokenInfo().hasToken === false, 'invalidateToken() successfully flushes token from cache')

    // Next call should trigger a fresh login
    const token3 = await getShiprocketToken({ customFetch: mockFetchSuccess })
    assert(token3 === mockToken, 'Re-fetches token after invalidation')
    assert(networkCallCount === 2, 'Network call count incremented to 2 after invalidation')

    // -------------------------------------------------------------
    // Group 5: Single-Flight High-Concurrency Deduplication
    // -------------------------------------------------------------
    console.log('\n--- Group 5: Single-Flight Concurrency Control ---')

    resetShiprocketAuthForTesting()
    let concurrentNetworkCalls = 0

    const mockFetchSlow: typeof fetch = async () => {
      concurrentNetworkCalls++
      // Simulate 50ms network latency
      await new Promise((res) => setTimeout(res, 50))
      return new Response(JSON.stringify({ token: mockToken, expires_in: 86400 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Fire 10 concurrent requests simultaneously while cache is cold
    const concurrentResults = await Promise.all([
      getShiprocketToken({ customFetch: mockFetchSlow }),
      getShiprocketToken({ customFetch: mockFetchSlow }),
      getShiprocketToken({ customFetch: mockFetchSlow }),
      getShiprocketToken({ customFetch: mockFetchSlow }),
      getShiprocketToken({ customFetch: mockFetchSlow }),
      getShiprocketToken({ customFetch: mockFetchSlow }),
      getShiprocketToken({ customFetch: mockFetchSlow }),
      getShiprocketToken({ customFetch: mockFetchSlow }),
      getShiprocketToken({ customFetch: mockFetchSlow }),
      getShiprocketToken({ customFetch: mockFetchSlow }),
    ])

    assert(concurrentNetworkCalls === 1, 'Exactly 1 network request made for 10 simultaneous concurrent requests')
    assert(
      concurrentResults.every((t) => t === mockToken),
      'All 10 concurrent callers received the identical valid token'
    )

    // -------------------------------------------------------------
    // Group 6: Error Handling, Resilience & Non-Leakage
    // -------------------------------------------------------------
    console.log('\n--- Group 6: Error Handling & Security Boundary ---')

    resetShiprocketAuthForTesting()

    // 6.1 Missing Credentials
    delete process.env.SHIPROCKET_EMAIL
    try {
      await getShiprocketToken({ customFetch: mockFetchSuccess })
      assert(false, 'Expected failure on missing credentials')
    } catch (err: any) {
      assert(err.message.includes('credentials are not configured'), 'Clean error when credentials missing')
    }
    process.env.SHIPROCKET_EMAIL = 'shipping@kala.com'

    // 6.2 HTTP 401 Unauthorized / Invalid Credentials
    const mockFetch401: typeof fetch = async () => {
      return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 })
    }
    try {
      await getShiprocketToken({ customFetch: mockFetch401 })
      assert(false, 'Expected failure on HTTP 401')
    } catch (err: any) {
      assert(err.message.includes('Invalid credentials or unauthorized'), 'Handles HTTP 401 gracefully')
      assert(!err.message.includes('password123'), 'Never leaks password in 401 error message')
    }

    // 6.3 HTTP 429 Rate Limit
    const mockFetch429: typeof fetch = async () => {
      return new Response(JSON.stringify({ message: 'Too many requests' }), { status: 429 })
    }
    try {
      await getShiprocketToken({ customFetch: mockFetch429 })
      assert(false, 'Expected failure on HTTP 429')
    } catch (err: any) {
      assert(err.message.includes('Rate limit exceeded'), 'Handles HTTP 429 gracefully')
    }

    // 6.4 HTTP 500 Service Unavailable
    const mockFetch500: typeof fetch = async () => {
      return new Response('Internal Server Error', { status: 500 })
    }
    try {
      await getShiprocketToken({ customFetch: mockFetch500 })
      assert(false, 'Expected failure on HTTP 500')
    } catch (err: any) {
      assert(err.message.includes('service unavailable'), 'Handles HTTP 500 gracefully')
    }

    // 6.5 Timeout via AbortSignal (10s default, tested with small timeout)
    const mockFetchTimeout: typeof fetch = async (_url, init) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const abortErr = new Error('The operation was aborted')
          abortErr.name = 'AbortError'
          reject(abortErr)
        })
      })
    }
    try {
      await getShiprocketToken({ customFetch: mockFetchTimeout, timeoutMs: 50 })
      assert(false, 'Expected failure on timeout')
    } catch (err: any) {
      assert(err.message.includes('timed out'), 'Handles timeout AbortError cleanly')
    }

    // 6.6 Malformed response: Missing token
    const mockFetchMissingToken: typeof fetch = async () => {
      return new Response(JSON.stringify({ id: 12345, first_name: 'KALA' }), { status: 200 })
    }
    try {
      await getShiprocketToken({ customFetch: mockFetchMissingToken })
      assert(false, 'Expected failure on missing token in body')
    } catch (err: any) {
      assert(err.message.includes('Missing or empty authentication token'), 'Catches missing token in JSON body')
    }

    // 6.7 Malformed response: HTML instead of JSON
    const mockFetchHtml: typeof fetch = async () => {
      return new Response('<html><body>Cloudflare Block</body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      })
    }
    try {
      await getShiprocketToken({ customFetch: mockFetchHtml })
      assert(false, 'Expected failure on non-JSON response')
    } catch (err: any) {
      assert(err.message.includes('Expected JSON body'), 'Handles non-JSON response body gracefully')
    }
  } finally {
    process.env = originalEnv
    resetShiprocketAuthForTesting()
  }

  console.log('\n===============================================================')
  console.log(` RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`)
  console.log('===============================================================')

  if (failedTests > 0) {
    process.exit(1)
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err)
  process.exit(1)
})
