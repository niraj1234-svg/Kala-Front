/**
 * Centralized Configuration for KALA Designathon 2026
 * Event: Designathon in GGV by KALA
 * Slogan: Show Your कला
 */

export interface DesignathonEventConfig {
  eventId: string
  eventName: string
  slogan: string
  registrationOpens: string // ISO 8601 string in Asia/Kolkata
  registrationCloses: string // ISO 8601 string in Asia/Kolkata
  eventDate: string
  eventTime: string
  resultsAnnouncement: string
  feeRupees: number
  feePaise: number
  currency: string
  timezone: string
  eligibility: string
  participation: 'individual'
  refundPolicy: string
  venue: string
  eventFormat: string
  judgingCriteria: string
  submissionInstructions: string
  prizes: {
    first: string
    second: string
    third: string
  }
  contact: {
    whatsapp: string
    whatsappDisplay: string
    email: string
    instagram: string
  }
}

export const DESIGNATHON_CONFIG: DesignathonEventConfig = {
  eventId: 'kala-designathon-ggv-2026',
  eventName: 'Designathon in GGV by KALA',
  slogan: 'Show Your कला',
  // Registration window: Open now until 23 October 2026 at 6:00 PM IST
  registrationOpens: '2026-10-10T00:00:00+05:30',
  registrationCloses: '2026-10-23T18:00:00+05:30',
  eventDate: '24 October 2026',
  eventTime: '11:00 AM–2:00 PM',
  resultsAnnouncement: '25 October 2026 at 11:00 AM',
  feeRupees: 49,
  feePaise: 4900,
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  eligibility: 'Students from any college',
  participation: 'individual',
  refundPolicy: 'Non-refundable; ₹49 registration fee is final and non-refundable once paid.',
  venue: 'To be announced',
  eventFormat: 'To be announced (Details will be announced prior to the event)',
  judgingCriteria: 'Winners are selected by judges; judging criteria will be announced',
  submissionInstructions: 'Design submission on event day; exact instructions will be shared later',
  prizes: {
    first: "Two T-shirts: one featuring the winner's own design and one from KALA.",
    second: "One T-shirt featuring the winner's design plus a 30% coupon for an eligible KALA Store T-shirt.",
    third: 'A T-shirt prize from KALA.',
  },
  contact: {
    whatsapp: '919406030116',
    whatsappDisplay: '9406030116 (messages only)',
    email: 'KalaOriginals@gmail.com',
    instagram: 'https://www.instagram.com/kala_originals/',
  },
}

export type RegistrationWindowStatus = 'upcoming' | 'open' | 'closed'

export interface WindowCheckResult {
  status: RegistrationWindowStatus
  isOpen: boolean
  message: string
  opensAt: Date
  closesAt: Date
}

/**
 * Checks if the registration window is currently active.
 * Strict time checks using Asia/Kolkata timezone.
 * In development or testing, accepts an optional override if explicitly configured.
 */
export function checkRegistrationWindow(
  referenceTime: Date = new Date(),
  override?: 'open' | 'closed' | 'upcoming'
): WindowCheckResult {
  // Support explicit test/environment override when testing outside the October 2026 window
  const envOverride = override || (process.env.DESIGNATHON_WINDOW_OVERRIDE as 'open' | 'closed' | 'upcoming' | undefined)

  const opensAt = new Date(DESIGNATHON_CONFIG.registrationOpens)
  const closesAt = new Date(DESIGNATHON_CONFIG.registrationCloses)
  const now = referenceTime.getTime()

  if (envOverride === 'open') {
    return {
      status: 'open',
      isOpen: true,
      message: 'Registrations are open.',
      opensAt,
      closesAt,
    }
  }

  if (envOverride === 'upcoming') {
    return {
      status: 'upcoming',
      isOpen: false,
      message: 'Registrations open on 16 October 2026.',
      opensAt,
      closesAt,
    }
  }

  if (envOverride === 'closed') {
    return {
      status: 'closed',
      isOpen: false,
      message: 'Registrations closed on 23 October 2026 at 6:00 PM.',
      opensAt,
      closesAt,
    }
  }

  if (now < opensAt.getTime()) {
    return {
      status: 'upcoming',
      isOpen: false,
      message: 'Registrations open on 16 October 2026.',
      opensAt,
      closesAt,
    }
  }

  if (now > closesAt.getTime()) {
    return {
      status: 'closed',
      isOpen: false,
      message: 'Registrations closed on 23 October 2026 at 6:00 PM.',
      opensAt,
      closesAt,
    }
  }

  return {
    status: 'open',
    isOpen: true,
    message: 'Registrations are open.',
    opensAt,
    closesAt,
  }
}
