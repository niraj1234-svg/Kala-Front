/**
 * KALA Shiprocket Authentication Smoke Test CLI (Option A: Render Web Shell)
 *
 * Safely verifies live Shiprocket credentials via POST /auth/login.
 * 
 * Safety Guarantees:
 * - Calls ONLY getShiprocketToken(). Zero courier, shipment, pickup or order APIs.
 * - Prints ONLY boolean indicators and masked diagnostics.
 * - Never prints passwords, tokens, full responses, or headers.
 * - Exits with code 0 on success, code 1 on failure.
 *
 * Usage in Render Web Shell:
 *   npx tsx src/scripts/smokeTestShiprocketAuth.ts
 *
 * Usage locally:
 *   npx tsx backend/src/scripts/smokeTestShiprocketAuth.ts
 */

import { loadEnv } from '../config/env'
import {
  isShiprocketConfigured,
  getMaskedShiprocketEmail,
} from '../config/shiprocketConfig'
import {
  getShiprocketToken,
  getCachedTokenInfo,
} from '../services/shiprocketAuthService'

// Load environment variables if available
loadEnv()

async function runSmokeTest() {
  console.log('===============================================================')
  console.log(' KALA Shiprocket Authentication Live Smoke Test')
  console.log('===============================================================')

  const isConfigured = isShiprocketConfigured()
  const maskedEmail = getMaskedShiprocketEmail()

  console.log('\nConfiguration:')
  console.log(`  • Email Configured:      ${maskedEmail}`)
  console.log(`  • Credentials Present:   ${isConfigured ? 'YES' : 'NO'}`)

  if (!isConfigured) {
    console.error('\n[SMOKE TEST FAILED]: Required environment variables are missing.')
    console.error('Please ensure SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD are set in the environment.')
    console.log('===============================================================')
    process.exit(1)
  }

  console.log('\nExecuting Authentication Call (POST /auth/login)...')
  const startTime = Date.now()

  try {
    // Calls only getShiprocketToken()
    const token = await getShiprocketToken()
    const elapsedMs = Date.now() - startTime

    // Validate token existence strictly as boolean; never print or log the token string
    const tokenReceived = Boolean(token && typeof token === 'string' && token.trim().length > 0)
    const tokenInfo = getCachedTokenInfo()
    const expiryParsed = Boolean(tokenInfo.expiresAt && !tokenInfo.isExpired)

    console.log('\nAuthentication Result:')
    console.log('  • Status:                SUCCESS')
    console.log('  • HTTP Category:         2xx Success')
    console.log(`  • Response Latency:      ${elapsedMs}ms`)
    console.log(`  • Token Received:        ${tokenReceived}`)
    console.log(`  • Token Expiry Parsed:   ${expiryParsed}`)
    if (tokenInfo.remainingSeconds !== null) {
      const remainingHours = (tokenInfo.remainingSeconds / 3600).toFixed(1)
      console.log(`  • Token Validity:        ~${remainingHours} hours remaining`)
    }
    console.log('===============================================================')
    console.log(' LIVE SMOKE TEST PASSED — Shiprocket Authentication Operational')
    console.log('===============================================================')
    process.exit(0)
  } catch (error: any) {
    const elapsedMs = Date.now() - startTime
    const errText = String(error?.message || error || '')

    // Map internal error text to strictly predefined, sanitized diagnostic categories.
    // Never print raw error messages, stack traces, headers, or response payloads.
    let httpCategory = '5xx / Unknown Error'
    let sanitizedCategory = 'General Authentication Failure'

    if (errText.includes('401') || errText.includes('403')) {
      httpCategory = '4xx Client Error'
      sanitizedCategory = 'Unauthorized / Invalid Credentials'
    } else if (errText.includes('429')) {
      httpCategory = '4xx Client Error'
      sanitizedCategory = 'Rate Limit Exceeded'
    } else if (errText.includes('timed out') || errText.includes('AbortError')) {
      httpCategory = 'Network Timeout'
      sanitizedCategory = 'Authentication Request Timed Out (>10s)'
    } else if (errText.includes('500') || errText.includes('502') || errText.includes('503') || errText.includes('504')) {
      httpCategory = '5xx Server Error'
      sanitizedCategory = 'Shiprocket Service Unavailable'
    } else if (errText.includes('Missing or empty') || errText.includes('JSON')) {
      httpCategory = 'Payload Parsing Error'
      sanitizedCategory = 'Malformed Authentication Response'
    } else if (errText.includes('ENOTFOUND') || errText.includes('ECONNREFUSED') || errText.includes('fetch failed')) {
      httpCategory = 'Network Connection Error'
      sanitizedCategory = 'Unable to reach Shiprocket API endpoint'
    }

    console.error('\nAuthentication Result:')
    console.error('  • Status:                FAILED')
    console.error(`  • HTTP Category:         ${httpCategory}`)
    console.error(`  • Response Latency:      ${elapsedMs}ms`)
    console.error('  • Token Received:        false')
    console.error('  • Token Expiry Parsed:   false')
    console.error(`  • Diagnostic Category:   ${sanitizedCategory}`)
    console.log('===============================================================')
    console.error(' LIVE SMOKE TEST FAILED')
    console.log('===============================================================')
    process.exit(1)
  }
}

runSmokeTest()
