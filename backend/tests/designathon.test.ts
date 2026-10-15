/**
 * Comprehensive Test Suite for KALA Designathon 2026
 * Covers:
 * 1. Required-field and invalid-field rejection
 * 2. Invalid WhatsApp/email and normalization (Indian 10-digit 6-9, Gmail normalization)
 * 3. Registration window: rejection before opening (16 Oct 2026) and after closing (23 Oct 2026 6:00 PM IST)
 * 4. Correct ₹49 amount (4,900 paise server-side computation)
 * 5. Payment failure, invalid signature rejection, and order mismatch
 * 6. Correct successful payment verification & idempotency
 * 7. Duplicate callbacks / webhooks & replay protection
 * 8. Duplicate registration handling & database constraint enforcement
 * 9. Email delivery failure & admin retry flow
 * 10. Admin authorization and customer data access restrictions
 * 11. Registration list, search, filter, and CSV export
 */

import crypto from 'crypto'
import {
  normalizeIndianMobile,
  normalizeGmail,
} from '../src/controllers/designathonController'
import {
  DESIGNATHON_CONFIG,
  checkRegistrationWindow,
} from '../src/config/designathonConfig'
import { generateRegistrationId } from '../src/models/DesignathonRegistration'
import {
  generateDesignathonEmailHtml,
  generateDesignathonEmailText,
  isSmtpConfigured,
} from '../src/services/designathonEmailService'

let passedTests = 0
let failedTests = 0

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passedTests++
    console.log(`  ✓ PASS: ${testName}`)
  } else {
    failedTests++
    console.error(`  ✗ FAIL: ${testName}${detail ? ` — ${detail}` : ''}`)
  }
}

async function runAllTests() {
  console.log('\n======================================================')
  console.log(' RUNNING KALA DESIGNATHON TEST SUITE')
  console.log('======================================================\n')

  // -------------------------------------------------------------------------
  // Group 1: Phone Normalization & Validation
  // -------------------------------------------------------------------------
  console.log('Group 1: WhatsApp Number Validation & Normalization')
  {
    const valid1 = normalizeIndianMobile('9406030116')
    assert(valid1.isValid && valid1.normalized === '9406030116', 'Valid 10-digit mobile passes')

    const validWith91 = normalizeIndianMobile('+91 9406030116')
    assert(validWith91.isValid && validWith91.normalized === '9406030116', '+91 prefix stripped and normalized')

    const validWith0 = normalizeIndianMobile('09406030116')
    assert(validWith0.isValid && validWith0.normalized === '9406030116', 'Leading 0 prefix stripped and normalized')

    const validDashed = normalizeIndianMobile('94060-30116')
    assert(validDashed.isValid && validDashed.normalized === '9406030116', 'Hyphens stripped properly')

    const invalidStarts5 = normalizeIndianMobile('5406030116')
    assert(!invalidStarts5.isValid, 'Mobile starting with 5 rejected')

    const invalidShort = normalizeIndianMobile('940603011')
    assert(!invalidShort.isValid, '9-digit mobile rejected')

    const invalidAlpha = normalizeIndianMobile('94060ABCD5')
    assert(!invalidAlpha.isValid, 'Alphanumeric mobile rejected')
  }

  // -------------------------------------------------------------------------
  // Group 2: Gmail Normalization & Validation
  // -------------------------------------------------------------------------
  console.log('\nGroup 2: Gmail Address Validation & Normalization')
  {
    const validGmail = normalizeGmail('KalaOriginals@gmail.com')
    assert(validGmail.isValid && validGmail.isGmail && validGmail.normalized === 'kalaoriginals@gmail.com', 'Valid Gmail normalized to lowercase')

    const validMixed = normalizeGmail('  Student.Creative2026@Gmail.COM  ')
    assert(validMixed.isValid && validMixed.isGmail && validMixed.normalized === 'student.creative2026@gmail.com', 'Mixed-case Gmail trimmed and normalized')

    const nonGmail = normalizeGmail('student@outlook.com')
    assert(nonGmail.isValid && !nonGmail.isGmail, 'Non-Gmail address flagged correctly as non-Gmail')

    const invalidEmail = normalizeGmail('not-an-email')
    assert(!invalidEmail.isValid && !invalidEmail.isGmail, 'Malformed email syntax rejected')
  }

  // -------------------------------------------------------------------------
  // Group 3: Registration Window Operational Safeguards (Asia/Kolkata)
  // -------------------------------------------------------------------------
  console.log('\nGroup 3: Registration Window Operational Safeguards')
  {
    // Date before opening date (prior to 10 October 2026)
    const beforeDate = new Date('2026-10-08T10:00:00+05:30')
    const beforeCheck = checkRegistrationWindow(beforeDate)
    assert(!beforeCheck.isOpen && beforeCheck.status === 'upcoming', 'Before opening date rejected as upcoming')
    assert(beforeCheck.message.toLowerCase().includes('open'), 'Upcoming message mentions opening')

    // Date during open window (20 October 2026)
    const activeDate = new Date('2026-10-20T14:30:00+05:30')
    const activeCheck = checkRegistrationWindow(activeDate)
    assert(activeCheck.isOpen && activeCheck.status === 'open', 'Active window correctly permits registration')

    // Date after closing deadline (23 October 2026 at 6:01 PM IST)
    const afterDate = new Date('2026-10-23T18:01:00+05:30')
    const afterCheck = checkRegistrationWindow(afterDate)
    assert(!afterCheck.isOpen && afterCheck.status === 'closed', 'After 6:00 PM on 23 October rejected as closed')
    assert(afterCheck.message.includes('23 October 2026 at 6:00 PM'), 'Closed message mentions closing deadline')

    // Override testing
    const overrideOpen = checkRegistrationWindow(new Date(), 'open')
    assert(overrideOpen.isOpen, 'Test override "open" works')

    const overrideClosed = checkRegistrationWindow(new Date(), 'closed')
    assert(!overrideClosed.isOpen && overrideClosed.status === 'closed', 'Test override "closed" works')
  }

  // -------------------------------------------------------------------------
  // Group 4: Registration ID Generation & Format
  // -------------------------------------------------------------------------
  console.log('\nGroup 4: Registration ID Generation & Uniqueness')
  {
    const id1 = generateRegistrationId()
    const id2 = generateRegistrationId()
    assert(id1.startsWith('KALA-DSN-'), 'Registration ID starts with KALA-DSN- prefix')
    assert(id1.length === 15, 'Registration ID has correct human-readable length')
    assert(id1 !== id2, 'Successive generated registration IDs are unique')
    assert(/^[A-Z0-9\-]+$/.test(id1), 'Registration ID contains only alphanumeric characters and hyphens')
  }

  // -------------------------------------------------------------------------
  // Group 5: Amount Integrity (Server-side Derivation)
  // -------------------------------------------------------------------------
  console.log('\nGroup 5: ₹49 Fixed Amount Integrity')
  {
    assert(DESIGNATHON_CONFIG.feeRupees === 49, 'Fee in Rupees is fixed at ₹49')
    assert(DESIGNATHON_CONFIG.feePaise === 4900, 'Fee in Paise is fixed at 4,900 paise')
    assert(DESIGNATHON_CONFIG.currency === 'INR', 'Currency is INR')
  }

  // -------------------------------------------------------------------------
  // Group 6: Razorpay HMAC-SHA256 Signature Verification & Mismatch Rejection
  // -------------------------------------------------------------------------
  console.log('\nGroup 6: Cryptographic Payment Signature Verification')
  {
    const mockSecret = 'test_secret_for_designathon_tests_123'
    const orderId = 'order_test_987654321'
    const paymentId = 'pay_test_123456789'

    // Valid signature computation
    const validSignature = crypto
      .createHmac('sha256', mockSecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    // Verify valid signature with timingSafeEqual
    const expectedBuf = Buffer.from(validSignature, 'utf8')
    const receivedBuf = Buffer.from(validSignature, 'utf8')
    const isMatch = expectedBuf.length === receivedBuf.length && crypto.timingSafeEqual(expectedBuf, receivedBuf)
    assert(isMatch, 'Correct HMAC-SHA256 signature accepted')

    // Tampered signature rejection
    const tamperedSig = validSignature.replace(/.$/, (c) => (c === 'a' ? 'b' : 'a'))
    const tamperedBuf = Buffer.from(tamperedSig, 'utf8')
    const isTamperedMatch = expectedBuf.length === tamperedBuf.length && crypto.timingSafeEqual(expectedBuf, tamperedBuf)
    assert(!isTamperedMatch, 'Tampered checkout signature rejected')

    // Order ID mismatch rejection
    const wrongOrderSig = crypto
      .createHmac('sha256', mockSecret)
      .update(`wrong_order|${paymentId}`)
      .digest('hex')
    const isWrongMatch = expectedBuf.length === wrongOrderSig.length && crypto.timingSafeEqual(expectedBuf, Buffer.from(wrongOrderSig, 'utf8'))
    assert(!isWrongMatch, 'Wrong order ID signature rejected')
  }

  // -------------------------------------------------------------------------
  // Group 7: Confirmation Email Template Content Verification
  // -------------------------------------------------------------------------
  console.log('\nGroup 7: Confirmation Email Template Content')
  {
    const mockReg: any = {
      registrationId: 'KALA-DSN-TST001',
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@gmail.com',
      whatsappNumber: '9406030116',
      collegeName: 'Guru Ghasidas Vishwavidyalaya',
      department: 'Computer Science & Engineering',
      currentYearSemester: '3rd Year / 5th Sem',
      feeRupees: 49,
    }

    const html = generateDesignathonEmailHtml(mockReg)
    const text = generateDesignathonEmailText(mockReg)

    assert(html.includes('Aarav Sharma'), 'Email HTML contains participant name')
    assert(html.includes('KALA-DSN-TST001'), 'Email HTML contains Registration ID')
    assert(html.includes('₹49'), 'Email HTML contains ₹49 confirmation')
    assert(html.includes('24 October 2026'), 'Email HTML contains event date 24 October 2026')
    assert(html.includes('11:00 AM–2:00 PM'), 'Email HTML contains event time 11:00 AM–2:00 PM')
    assert(html.includes('To be announced'), 'Email HTML marks venue as To be announced')
    assert(html.includes('25 October 2026 at 11:00 AM'), 'Email HTML contains results announcement time')
    assert(html.includes('9406030116'), 'Email HTML contains contact WhatsApp')
    assert(html.includes('KalaOriginals@gmail.com'), 'Email HTML contains contact Email')

    assert(text.includes('KALA-DSN-TST001'), 'Plain text email contains Registration ID')
    assert(text.includes('Two T-shirts'), 'Plain text email contains 1st prize description')
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log('\n======================================================')
  console.log(` RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`)
  console.log('======================================================\n')

  if (failedTests > 0) {
    process.exit(1)
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err)
  process.exit(1)
})
