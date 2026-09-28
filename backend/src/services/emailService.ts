import nodemailer, { Transporter } from 'nodemailer'

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  skipped?: boolean
  error?: string
}

/**
 * Creates and returns the nodemailer transporter using environment variables.
 * Falls back safely if environment variables are not configured.
 */
function createTransporter(): Transporter | null {
  const host = process.env.EMAIL_HOST?.trim()
  const port = parseInt(process.env.EMAIL_PORT?.trim() || '587', 10)
  const user = process.env.EMAIL_USER?.trim()
  const pass = process.env.EMAIL_PASSWORD?.trim()

  if (!host || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  })
}

/**
 * Central email delivery function.
 * Safe for production: never crashes callers, logs delivery status cleanly.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const from = process.env.EMAIL_FROM?.trim() || '"KALA" <no-reply@kala.co.in>'
  const transporter = createTransporter()

  if (!transporter) {
    console.info(
      `[EmailService] SMTP not fully configured (EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD). Skipping delivery to: ${options.to} (Subject: "${options.subject}")`
    )
    return {
      success: true,
      skipped: true,
      messageId: `simulated_${Date.now()}`,
    }
  }

  try {
    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    console.log(`[EmailService] Email sent to ${options.to}. MessageId: ${info.messageId}`)
    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error(`[EmailService] Failed to send email to ${options.to}:`, errorMsg)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Helper to fetch the configured admin recipient address
 */
export function getAdminEmail(): string {
  return (
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
    'dhoreniraj83@gmail.com'
  )
}
