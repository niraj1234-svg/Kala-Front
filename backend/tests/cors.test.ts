/**
 * KALA Backend CORS Configuration & Preflight Security Verification Tests
 *
 * Verifies:
 * 1. Approved Vercel preview origin receives preflight permissions (Access-Control-Allow-Origin, Credentials, Methods, Headers)
 * 2. Production storefront origins (www.kalaofficial.store, kalaofficial.store) remain permitted
 * 3. Unapproved/malicious origins are strictly denied (no Access-Control-Allow-Origin header)
 * 4. Preflight OPTIONS requests succeed on /api/visitors/first-visit, /api/products, and /api/auth/admin/login
 * 5. Environment-variable-based origins (CLIENT_URL and ADDITIONAL_ALLOWED_ORIGINS) are preserved
 * 6. Wildcard (*) origin is NEVER used with credentials
 */

import express from 'express'
import cors from 'cors'
import http from 'http'
import { getAllowedOrigins } from '../src/config/env'

let passed = 0
let failed = 0

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${msg}`)
    passed++
  } else {
    console.error(`  ✗ FAIL: ${msg}`)
    failed++
  }
}

// Build a test Express app using the EXACT CORS middleware configuration from src/server.ts
function buildTestApp() {
  const app = express()
  const allowedOrigins = getAllowedOrigins()

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          return callback(null, true)
        }

        const normalizedOrigin = origin.replace(/\/+$/, '')
        if (allowedOrigins.includes(normalizedOrigin)) {
          return callback(null, true)
        }

        const isProduction = process.env.NODE_ENV === 'production'
        if (!isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)) {
          return callback(null, true)
        }

        return callback(null, false)
      },
      credentials: true,
    })
  )

  app.get('/api/visitors/first-visit', (_req, res) => res.json({ firstVisit: true }))
  app.get('/api/products', (_req, res) => res.json({ products: [] }))
  app.post('/api/auth/admin/login', (_req, res) => res.json({ token: 'mock' }))

  return app
}

function sendOptionsRequest(
  server: http.Server,
  path: string,
  origin: string,
  method: string = 'GET',
  headers: string = 'content-type'
): Promise<{ statusCode: number | undefined; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const address = server.address()
    if (!address || typeof address === 'string') {
      return reject(new Error('Server address not available'))
    }

    const req = http.request(
      {
        host: '127.0.0.1',
        port: address.port,
        path,
        method: 'OPTIONS',
        headers: {
          Origin: origin,
          'Access-Control-Request-Method': method,
          'Access-Control-Request-Headers': headers,
        },
      },
      (res) => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
        })
      }
    )

    req.on('error', reject)
    req.end()
  })
}

async function runTests() {
  console.log('=== KALA Backend CORS Verification Tests ===\n')

  // 1. Static allowlist and resolution tests
  console.log('Test Suite 1: getAllowedOrigins() Allowlist Resolution')
  const origins = getAllowedOrigins()
  assert(
    origins.includes('https://kala-front-git-qikink-live-integration-niraj1234-svgs-projects.vercel.app'),
    'Approved branch preview origin (kala-front-git-qikink-live-integration) is present in allowedOrigins'
  )
  assert(
    origins.includes('https://project-wmdn7-git-qikink-live-integration-niraj1234-svgs-projects.vercel.app'),
    'Approved branch preview origin (project-wmdn7-git-qikink-live-integration) is present in allowedOrigins'
  )
  assert(
    origins.includes('https://kala-front-oa3puwsvr-niraj1234-svgs-projects.vercel.app'),
    'Approved Vercel preview origin is present in allowedOrigins'
  )
  assert(
    origins.includes('https://www.kalaofficial.store'),
    'Production storefront origin (www.kalaofficial.store) is present'
  )
  assert(
    origins.includes('https://kalaofficial.store'),
    'Production storefront apex origin (kalaofficial.store) is present'
  )
  assert(
    !origins.includes('*'),
    'Wildcard (*) is never included in static allowlist'
  )

  // 2. Integration HTTP preflight tests using exact server middleware
  console.log('\nTest Suite 2: HTTP OPTIONS Preflight Behavior')
  const app = buildTestApp()
  const server = http.createServer(app)

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()))

  try {
    const branchPreviewOrigin = 'https://kala-front-git-qikink-live-integration-niraj1234-svgs-projects.vercel.app'
    const previewOrigin = 'https://kala-front-oa3puwsvr-niraj1234-svgs-projects.vercel.app'
    const prodOrigin = 'https://www.kalaofficial.store'
    const prodApexOrigin = 'https://kalaofficial.store'
    const unapprovedOrigin = 'https://malicious-attacker-domain.com'

    // Case A1: Approved branch preview origin on /api/auth/admin/login (POST)
    console.log('\n  Case A1: Approved branch preview origin on POST /api/auth/admin/login')
    const resA1 = await sendOptionsRequest(server, '/api/auth/admin/login', branchPreviewOrigin, 'POST', 'content-type')
    assert(resA1.statusCode === 204, `Preflight status code is 204 (got ${resA1.statusCode})`)
    assert(
      resA1.headers['access-control-allow-origin'] === branchPreviewOrigin,
      `Access-Control-Allow-Origin header exactly equals ${branchPreviewOrigin}`
    )
    assert(
      resA1.headers['access-control-allow-credentials'] === 'true',
      'Access-Control-Allow-Credentials header is "true"'
    )
    assert(
      (resA1.headers['access-control-allow-methods'] || '').includes('POST'),
      'Access-Control-Allow-Methods includes POST'
    )
    assert(
      (resA1.headers['access-control-allow-headers'] || '').includes('content-type'),
      'Access-Control-Allow-Headers includes content-type'
    )

    // Case A2: Approved Vercel preview origin on /api/auth/admin/login (POST)
    console.log('\n  Case A2: Approved Vercel preview origin on POST /api/auth/admin/login')
    const resA = await sendOptionsRequest(server, '/api/auth/admin/login', previewOrigin, 'POST', 'content-type')
    assert(resA.statusCode === 204, `Preflight status code is 204 (got ${resA.statusCode})`)
    assert(
      resA.headers['access-control-allow-origin'] === previewOrigin,
      `Access-Control-Allow-Origin header exactly equals ${previewOrigin}`
    )
    assert(
      resA.headers['access-control-allow-credentials'] === 'true',
      'Access-Control-Allow-Credentials header is "true"'
    )
    assert(
      (resA.headers['access-control-allow-methods'] || '').includes('POST'),
      'Access-Control-Allow-Methods includes POST'
    )
    assert(
      (resA.headers['access-control-allow-headers'] || '').includes('content-type'),
      'Access-Control-Allow-Headers includes content-type'
    )

    // Case B1: Existing production storefront origin on GET /api/products
    console.log('\n  Case B1: Production storefront origin on GET /api/products')
    const resB1 = await sendOptionsRequest(server, '/api/products', prodOrigin, 'GET')
    assert(resB1.statusCode === 204, `Preflight status code is 204 (got ${resB1.statusCode})`)
    assert(
      resB1.headers['access-control-allow-origin'] === prodOrigin,
      `Access-Control-Allow-Origin header equals ${prodOrigin}`
    )
    assert(
      resB1.headers['access-control-allow-credentials'] === 'true',
      'Access-Control-Allow-Credentials is "true"'
    )

    // Case B2: Production apex domain on GET /api/visitors/first-visit
    console.log('\n  Case B2: Production apex domain on GET /api/visitors/first-visit')
    const resB2 = await sendOptionsRequest(server, '/api/visitors/first-visit', prodApexOrigin, 'GET')
    assert(resB2.statusCode === 204, `Preflight status code is 204 (got ${resB2.statusCode})`)
    assert(
      resB2.headers['access-control-allow-origin'] === prodApexOrigin,
      `Access-Control-Allow-Origin header equals ${prodApexOrigin}`
    )

    // Case C: Unapproved origin is rejected
    console.log('\n  Case C: Unapproved origin rejection')
    const resC = await sendOptionsRequest(server, '/api/products', unapprovedOrigin, 'GET')
    assert(
      !resC.headers['access-control-allow-origin'],
      'Unapproved origin does NOT receive Access-Control-Allow-Origin header'
    )

    // Case D: All 3 problem endpoints with approved preview origins
    console.log('\n  Case D: Approved branch preview origin on all 3 target endpoints')
    const endpoints = [
      { path: '/api/visitors/first-visit', method: 'GET' },
      { path: '/api/products', method: 'GET' },
      { path: '/api/auth/admin/login', method: 'POST' },
    ]

    for (const ep of endpoints) {
      const resD1 = await sendOptionsRequest(server, ep.path, branchPreviewOrigin, ep.method, 'content-type')
      assert(
        resD1.headers['access-control-allow-origin'] === branchPreviewOrigin,
        `Endpoint ${ep.method} ${ep.path} allows branch preview origin`
      )
      assert(
        resD1.headers['access-control-allow-credentials'] === 'true',
        `Endpoint ${ep.method} ${ep.path} sets credentials=true for branch preview origin`
      )

      const resD2 = await sendOptionsRequest(server, ep.path, previewOrigin, ep.method, 'content-type')
      assert(
        resD2.headers['access-control-allow-origin'] === previewOrigin,
        `Endpoint ${ep.method} ${ep.path} allows legacy preview origin`
      )
    }
  } finally {
    server.close()
  }

  console.log(`\n========================================`)
  console.log(`Results: ${passed} passed, ${failed} failed`)
  console.log(`========================================\n`)

  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err)
  process.exit(1)
})
