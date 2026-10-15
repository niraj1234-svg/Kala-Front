import nodemailer from 'nodemailer'
import { IDesignathonRegistration } from '../models/DesignathonRegistration'
import { DESIGNATHON_CONFIG } from '../config/designathonConfig'

export interface EmailDispatchResult {
  success: boolean
  messageId?: string
  pendingCredentials?: boolean
  error?: string
}

/**
 * Checks whether valid SMTP provider credentials are configured on the server.
 * Never considers placeholder or empty values as configured.
 */
export function isSmtpConfigured(): boolean {
  const host = process.env.EMAIL_HOST?.trim()
  const user = process.env.EMAIL_USER?.trim()
  const pass = process.env.EMAIL_PASSWORD?.trim()

  if (!host || !user || !pass) return false
  if (user.includes('your_') || pass.includes('your_') || host.includes('placeholder')) return false

  return true
}

/**
 * Creates nodemailer transporter using configured credentials.
 */
function createTransporter() {
  if (!isSmtpConfigured()) return null

  const host = process.env.EMAIL_HOST!.trim()
  const port = parseInt(process.env.EMAIL_PORT?.trim() || '587', 10)
  const user = process.env.EMAIL_USER!.trim()
  const pass = process.env.EMAIL_PASSWORD!.trim()
  const secure = process.env.EMAIL_SECURE === 'true' || port === 465

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  })
}

/**
 * Generates HTML email content for Designathon confirmation.
 */
export function generateDesignathonEmailHtml(registration: IDesignathonRegistration): string {
  const cfg = DESIGNATHON_CONFIG
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KALA Designathon — Registration Confirmed</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0E0E10; color: #FFFFFF; }
    .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #161619; border: 1px solid #28282D; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0A0A0C 0%, #1A1A1E 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #D94700; }
    .logo { font-size: 28px; font-weight: 900; letter-spacing: 0.15em; color: #FFFFFF; margin: 0; }
    .logo-accent { color: #D94700; }
    .slogan { font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase; color: #D94700; margin-top: 6px; font-weight: 700; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 20px; font-weight: 800; color: #FFFFFF; margin: 0 0 16px 0; }
    .intro { font-size: 15px; line-height: 1.6; color: #CCCCCC; margin: 0 0 24px 0; }
    .ticket { background-color: #0E0E10; border: 1px dashed #D94700; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .ticket-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #222226; font-size: 14px; }
    .ticket-row:last-child { border-bottom: none; }
    .ticket-label { color: #888888; text-transform: uppercase; font-size: 11px; letter-spacing: 0.08em; font-weight: 600; }
    .ticket-value { color: #FFFFFF; font-weight: 700; text-align: right; }
    .ticket-regid { color: #D94700; font-family: monospace; font-size: 16px; font-weight: 900; }
    .prizes-box { background: rgba(217, 71, 0, 0.08); border-left: 3px solid #D94700; padding: 16px; border-radius: 4px; margin: 24px 0; }
    .prizes-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #D94700; margin: 0 0 8px 0; letter-spacing: 0.05em; }
    .prizes-list { margin: 0; padding-left: 18px; color: #DDDDDD; font-size: 13px; line-height: 1.6; }
    .notice { font-size: 13px; color: #AAAAAA; line-height: 1.5; background: #202025; padding: 14px; border-radius: 6px; margin: 20px 0; }
    .contacts { background: #0A0A0C; padding: 20px; border-radius: 8px; text-align: center; margin-top: 24px; }
    .contacts-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #888888; margin-bottom: 8px; letter-spacing: 0.05em; }
    .contact-item { font-size: 14px; color: #FFFFFF; margin: 4px 0; }
    .contact-link { color: #D94700; text-decoration: none; font-weight: 600; }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #666666; border-top: 1px solid #222226; }
  </style>
</head>
<body>
  <div style="padding: 20px 10px;">
    <div class="wrapper">
      <div class="header">
        <h1 class="logo">KALA<span class="logo-accent">.</span></h1>
        <div class="slogan">${cfg.slogan}</div>
      </div>
      <div class="content">
        <h2 class="greeting">Registration Confirmed!</h2>
        <p class="intro">
          Hi <strong>${registration.fullName}</strong>,<br>
          Your registration for <strong>${cfg.eventName}</strong> has been successfully received and your payment of <strong>₹49</strong> is verified.
        </p>

        <div class="ticket">
          <div class="ticket-row">
            <span class="ticket-label">Registration ID</span>
            <span class="ticket-value ticket-regid">${registration.registrationId}</span>
          </div>
          <div class="ticket-row">
            <span class="ticket-label">Participant</span>
            <span class="ticket-value">${registration.fullName}</span>
          </div>
          <div class="ticket-row">
            <span class="ticket-label">College</span>
            <span class="ticket-value">${registration.collegeName}</span>
          </div>
          <div class="ticket-row">
            <span class="ticket-label">Department &amp; Year</span>
            <span class="ticket-value">${registration.department} (${registration.currentYearSemester})</span>
          </div>
          <div class="ticket-row">
            <span class="ticket-label">Registration Fee</span>
            <span class="ticket-value" style="color: #22C55E;">₹49 (Paid)</span>
          </div>
          <div class="ticket-row">
            <span class="ticket-label">Event Date</span>
            <span class="ticket-value">${cfg.eventDate}</span>
          </div>
          <div class="ticket-row">
            <span class="ticket-label">Event Time</span>
            <span class="ticket-value">${cfg.eventTime}</span>
          </div>
          <div class="ticket-row">
            <span class="ticket-label">Venue</span>
            <span class="ticket-value">${cfg.venue}</span>
          </div>
          <div class="ticket-row">
            <span class="ticket-label">Design Submission</span>
            <span class="ticket-value">${cfg.submissionInstructions}</span>
          </div>
          <div class="ticket-row">
            <span class="ticket-label">Results Announcement</span>
            <span class="ticket-value">${cfg.resultsAnnouncement}</span>
          </div>
        </div>

        <div class="prizes-box">
          <div class="prizes-title">Confirmed Prizes</div>
          <ul class="prizes-list">
            <li><strong>1st Prize:</strong> ${cfg.prizes.first}</li>
            <li><strong>2nd Prize:</strong> ${cfg.prizes.second}</li>
            <li><strong>3rd Prize:</strong> ${cfg.prizes.third}</li>
          </ul>
        </div>

        <div class="notice">
          <strong>Important Instructions:</strong><br>
          • Participation is individual only.<br>
          • Design submission will happen on event day (${cfg.eventDate}); exact submission instructions will be shared prior to the event.<br>
          • Winners are selected by judges; judging criteria will be announced.<br>
          • Please keep your Registration ID (<strong>${registration.registrationId}</strong>) safe for reference.
        </div>

        <div class="contacts">
          <div class="contacts-title">Event Support &amp; Queries</div>
          <div class="contact-item">WhatsApp: <strong>${cfg.contact.whatsappDisplay}</strong></div>
          <div class="contact-item">Email: <a href="mailto:${cfg.contact.email}" class="contact-link">${cfg.contact.email}</a></div>
          <div class="contact-item">Instagram: <a href="${cfg.contact.instagram}" class="contact-link">@kala_originals</a></div>
        </div>
      </div>
      <div class="footer">
        © 2026 KALA. All rights reserved.<br>
        Show Your कला • Designathon in GGV by KALA
      </div>
    </div>
  </div>
</body>
</html>`
}

/**
 * Generates plain text email content for Designathon confirmation.
 */
export function generateDesignathonEmailText(registration: IDesignathonRegistration): string {
  const cfg = DESIGNATHON_CONFIG
  return `KALA Designathon — Registration Confirmed

Hi ${registration.fullName},

Your registration for "${cfg.eventName}" is confirmed!
Show Your कला

REGISTRATION DETAILS:
• Registration ID: ${registration.registrationId}
• Participant: ${registration.fullName}
• College: ${registration.collegeName}
• Department: ${registration.department} (${registration.currentYearSemester})
• Registration Fee: ₹49 (Payment Verified)
• Event Date: ${cfg.eventDate}
• Event Time: ${cfg.eventTime}
• Venue: ${cfg.venue}
• Design Submission: ${cfg.submissionInstructions}
• Results Announcement: ${cfg.resultsAnnouncement}

CONFIRMED PRIZES:
• 1st Prize: ${cfg.prizes.first}
• 2nd Prize: ${cfg.prizes.second}
• 3rd Prize: ${cfg.prizes.third}

IMPORTANT NOTICES:
• Participation is individual only.
• Design submission will occur on event day; exact submission instructions will be shared later.
• Winners are selected by judges; judging criteria will be announced.
• The ₹49 fee is non-refundable.

EVENT CONTACTS:
• WhatsApp: ${cfg.contact.whatsappDisplay}
• Email: ${cfg.contact.email}
• Instagram: ${cfg.contact.instagram}

Best of luck!
Team KALA
`
}

/**
 * Safely dispatches the confirmation email to the student.
 * Updates the registration document with sanitized delivery/failure state.
 * Never throws an uncaught error to callers.
 */
export async function sendDesignathonConfirmationEmail(
  registration: IDesignathonRegistration
): Promise<EmailDispatchResult> {
  const from = process.env.EMAIL_FROM?.trim() || '"KALA" <no-reply@kala.co.in>'
  const subject = 'KALA Designathon — Registration Confirmed'

  if (!isSmtpConfigured()) {
    console.info(
      `[DesignathonEmail] SMTP provider not configured. Registration ${registration.registrationId} marked as email pending.`
    )
    registration.emailStatus = 'pending'
    registration.emailFailureReason = 'SMTP provider configuration pending (credentials not configured)'
    registration.emailAttempts = (registration.emailAttempts || 0) + 1
    registration.auditHistory.push({
      action: 'email_pending_credentials',
      timestamp: new Date(),
      actor: 'system',
      details: { note: 'SMTP provider credentials pending on server' },
    })
    await registration.save()

    return {
      success: false,
      pendingCredentials: true,
      error: 'SMTP provider configuration pending on server',
    }
  }

  const transporter = createTransporter()
  if (!transporter) {
    registration.emailStatus = 'pending'
    registration.emailFailureReason = 'SMTP transporter could not be initialized'
    await registration.save()
    return { success: false, pendingCredentials: true, error: 'Transporter creation failed' }
  }

  try {
    const html = generateDesignathonEmailHtml(registration)
    const text = generateDesignathonEmailText(registration)

    const info = await transporter.sendMail({
      from,
      to: registration.email,
      subject,
      html,
      text,
    })

    console.log(
      `[DesignathonEmail] Confirmation email delivered to ${registration.email}. MessageId: ${info.messageId}`
    )

    registration.emailStatus = 'sent'
    registration.emailSentAt = new Date()
    registration.emailFailureReason = undefined
    registration.emailAttempts = (registration.emailAttempts || 0) + 1
    registration.auditHistory.push({
      action: 'confirmation_email_sent',
      timestamp: new Date(),
      actor: 'system',
      details: { messageId: info.messageId, recipient: registration.email },
    })
    await registration.save()

    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    // Sanitize any potential sensitive information from error string
    const sanitizedError = errorMsg.replace(/password[:=]\s*\S+/gi, 'password=***')

    console.error(
      `[DesignathonEmail] Failed to send confirmation email for ${registration.registrationId}:`,
      sanitizedError
    )

    registration.emailStatus = 'failed'
    registration.emailFailureReason = sanitizedError
    registration.emailAttempts = (registration.emailAttempts || 0) + 1
    registration.auditHistory.push({
      action: 'confirmation_email_failed',
      timestamp: new Date(),
      actor: 'system',
      details: { error: sanitizedError },
    })
    await registration.save()

    return {
      success: false,
      error: sanitizedError,
    }
  }
}
