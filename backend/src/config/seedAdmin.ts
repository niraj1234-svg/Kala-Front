import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'
import { connectDB } from './db'
import { User } from '../models/User'

// Load environment variables from backend root or src
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true })
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true })
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true })

/**
 * Generates a unique server-side user ID
 * Format: KALA-USR-XXXXXX (6 random uppercase alphanumeric chars)
 */
function generateUserId(): string {
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `KALA-USR-${randomSuffix}`
}

/**
 * Seeds or promotes an admin account based on environment variables.
 * Idempotent: can be safely executed multiple times without duplicating accounts.
 */
export async function seedAdmin(): Promise<void> {
  console.log('[Admin Seeder] Starting admin account provisioning...')

  // 1. Validate ADMIN_EMAIL
  const rawEmail = process.env.ADMIN_EMAIL
  if (!rawEmail || typeof rawEmail !== 'string' || !rawEmail.trim()) {
    throw new Error('ADMIN_EMAIL environment variable is required.')
  }
  const normalizedEmail = rawEmail.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(normalizedEmail)) {
    throw new Error('ADMIN_EMAIL must be a valid email address format.')
  }

  // 2. Validate ADMIN_PASSWORD
  const rawPassword = process.env.ADMIN_PASSWORD
  if (!rawPassword || typeof rawPassword !== 'string') {
    throw new Error('ADMIN_PASSWORD environment variable is required.')
  }
  if (rawPassword.length < 6) {
    throw new Error('ADMIN_PASSWORD must contain at least 6 characters.')
  }

  // 3. Validate ADMIN_FIRST_NAME
  const rawFirstName = process.env.ADMIN_FIRST_NAME
  if (!rawFirstName || typeof rawFirstName !== 'string' || !rawFirstName.trim()) {
    throw new Error('ADMIN_FIRST_NAME environment variable is required.')
  }
  const firstName = rawFirstName.trim()

  // 4. Validate ADMIN_LAST_NAME
  const rawLastName = process.env.ADMIN_LAST_NAME
  if (!rawLastName || typeof rawLastName !== 'string' || !rawLastName.trim()) {
    throw new Error('ADMIN_LAST_NAME environment variable is required.')
  }
  const lastName = rawLastName.trim()

  // 5. Validate ADMIN_PHONE
  const rawPhone = process.env.ADMIN_PHONE
  if (!rawPhone || typeof rawPhone !== 'string' || !rawPhone.trim()) {
    throw new Error('ADMIN_PHONE environment variable is required.')
  }
  const cleanPhone = rawPhone.trim().replace(/[\s-+]/g, '').replace(/^91(?=[6-9]\d{9}$)/, '')
  const phoneRegex = /^[6-9]\d{9}$/
  if (!phoneRegex.test(cleanPhone)) {
    throw new Error('ADMIN_PHONE must be a valid 10-digit Indian phone number.')
  }

  // 6. Connect to MongoDB
  await connectDB()

  // 7. Hash ADMIN_PASSWORD using bcryptjs (salt rounds: 10)
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(rawPassword, saltRounds)

  // 8. Find existing user by normalized email
  const existingUser = await User.findOne({ email: normalizedEmail })

  if (existingUser) {
    console.log(`[Admin Seeder] Account already exists for email: ${normalizedEmail}. Updating to admin role.`)
    existingUser.role = 'admin'
    existingUser.passwordHash = passwordHash
    existingUser.firstName = firstName
    existingUser.lastName = lastName
    existingUser.phone = cleanPhone
    await existingUser.save()
    console.log(`[Admin Seeder] Existing account promoted. Admin role confirmed for: ${normalizedEmail}`)
  } else {
    console.log(`[Admin Seeder] Creating new admin account for email: ${normalizedEmail}`)
    let userId = generateUserId()
    let existingId = await User.findOne({ userId })
    while (existingId) {
      userId = generateUserId()
      existingId = await User.findOne({ userId })
    }

    await User.create({
      userId,
      firstName,
      lastName,
      email: normalizedEmail,
      phone: cleanPhone,
      passwordHash,
      role: 'admin',
    })
    console.log(`[Admin Seeder] New admin account created successfully. Admin role confirmed for: ${normalizedEmail}`)
  }

  console.log('[Admin Seeder] Admin seed completed successfully.')
}

// Standalone execution support: tsx src/config/seedAdmin.ts
if (require.main === module || process.argv[1]?.includes('seedAdmin')) {
  ;(async () => {
    try {
      await seedAdmin()
      await mongoose.disconnect()
      process.exit(0)
    } catch (error: unknown) {
      console.error(
        '[Admin Seeder] Fatal Error:',
        error instanceof Error ? error.message : 'Unknown seeding failure'
      )
      try {
        await mongoose.disconnect()
      } catch {
        // Suppress disconnection errors on fatal termination
      }
      process.exit(1)
    }
  })()
}
