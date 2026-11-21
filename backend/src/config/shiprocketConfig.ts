import { loadEnv } from './env'

// Ensure environment variables are loaded once
loadEnv()

/**
 * Sanitizes credentials by:
 * - Trimming leading/trailing whitespace, tabs, and newlines (\r, \n)
 * - Removing zero-width spaces, non-breaking spaces (\u200B-\u200D\uFEFF\u00A0)
 * - Stripping enclosing single quotes ('...') or double quotes ("...")
 * - Stripping escaped quotes (\"...\") commonly introduced by copy-pasting into cloud dashboards
 */
export function sanitizeCredential(val?: string | null): string {
  if (!val) return ''
  let cleaned = String(val)
    .trim()
    .replace(/[\r\n\t]/g, '')
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '')
  if (cleaned.startsWith('"') && cleaned.endsWith('"') && cleaned.length >= 2) {
    cleaned = cleaned.slice(1, -1).trim()
  }
  if (cleaned.startsWith("'") && cleaned.endsWith("'") && cleaned.length >= 2) {
    cleaned = cleaned.slice(1, -1).trim()
  }
  if (cleaned.startsWith('\\"') && cleaned.endsWith('\\"') && cleaned.length >= 4) {
    cleaned = cleaned.slice(2, -2).trim()
  }
  return cleaned
}

export interface ShiprocketCredentials {
  email: string
  password: string
}

/**
 * Retrieves sanitized Shiprocket credentials from environment variables.
 * Never logs or exposes password values.
 */
export function getShiprocketCredentials(): ShiprocketCredentials {
  const email = sanitizeCredential(process.env.SHIPROCKET_EMAIL)
  const password = sanitizeCredential(process.env.SHIPROCKET_PASSWORD)
  return { email, password }
}

/**
 * Checks whether both required Shiprocket credentials are configured.
 */
export function isShiprocketConfigured(): boolean {
  const { email, password } = getShiprocketCredentials()
  return Boolean(email && password)
}

/**
 * Safely masks a Shiprocket email address for diagnostics and logging (e.g. "ku***l@kala.com").
 * Returns '(not configured)' if email is absent.
 */
export function getMaskedShiprocketEmail(email?: string): string {
  const cleanEmail = sanitizeCredential(email || process.env.SHIPROCKET_EMAIL)
  if (!cleanEmail) return '(not configured)'

  const atIdx = cleanEmail.indexOf('@')
  if (atIdx <= 0) {
    return '***'
  }

  const localPart = cleanEmail.substring(0, atIdx)
  const domainPart = cleanEmail.substring(atIdx + 1)

  let maskedLocal: string
  if (localPart.length <= 2) {
    maskedLocal = `${localPart[0]}*`
  } else {
    maskedLocal = `${localPart.substring(0, 2)}***${localPart.slice(-1)}`
  }

  return `${maskedLocal}@${domainPart}`
}

/**
 * Shiprocket API base URL for external logistics integration.
 */
export const SHIPROCKET_API_BASE_URL = 'https://apiv2.shiprocket.in/v1/external'
