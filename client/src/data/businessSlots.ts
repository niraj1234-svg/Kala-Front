/**
 * Central configuration file for KALA Business meeting slots,
 * physical location, and WhatsApp contact integration.
 */

export const BUSINESS_CONFIG = {
  location: 'Bilaspur, Chhattisgarh',
  timezone: 'Asia/Kolkata (IST)',
  whatsappNumber: '919406030116',
  formattedPhone: '+91 94060 30116',
  email: 'business@kala.co.in',
}

export interface TimeSlot {
  id: string
  timeLabel: string
  period: 'Morning' | 'Afternoon' | 'Evening'
}

export const PREDEFINED_TIME_SLOTS: TimeSlot[] = [
  { id: '10am-11am', timeLabel: '10:00 AM – 11:00 AM IST', period: 'Morning' },
  { id: '12pm-01pm', timeLabel: '12:00 PM – 01:00 PM IST', period: 'Afternoon' },
  { id: '03pm-04pm', timeLabel: '03:00 PM – 04:00 PM IST', period: 'Afternoon' },
  { id: '05pm-06pm', timeLabel: '05:00 PM – 06:00 PM IST', period: 'Evening' },
]

export interface AvailableDate {
  dateString: string // YYYY-MM-DD
  dayLabel: string   // e.g. "Mon"
  formattedDisplay: string // e.g. "Tomorrow, 29 Sep" or "Wed, 30 Sep"
  isSunday: boolean
}

/**
 * Returns the next 7 business days for scheduling (skips Sundays).
 * Generates dates starting from tomorrow so customers have a guaranteed confirmed slot.
 */
export function getUpcomingAvailableDates(): AvailableDate[] {
  const dates: AvailableDate[] = []
  const today = new Date()

  // Start from tomorrow
  let daysAdded = 0
  let currentOffset = 1

  while (daysAdded < 7 && currentOffset < 14) {
    const d = new Date(today)
    d.setDate(today.getDate() + currentOffset)

    const dayOfWeek = d.getDay() // 0 = Sunday
    if (dayOfWeek !== 0) { // Skip Sunday
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const dateString = `${year}-${month}-${day}`

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ]

      let formattedDisplay = `${dayNames[dayOfWeek]}, ${day} ${monthNames[d.getMonth()]}`
      if (currentOffset === 1) {
        formattedDisplay = `Tomorrow (${dayNames[dayOfWeek]}, ${day} ${monthNames[d.getMonth()]})`
      }

      dates.push({
        dateString,
        dayLabel: dayNames[dayOfWeek],
        formattedDisplay,
        isSunday: false,
      })
      daysAdded++
    }
    currentOffset++
  }

  return dates
}

export type ContactMethodType =
  | 'In-Person Meeting'
  | 'Google Meet'
  | 'Call'
  | 'WhatsApp'

export interface ContactOptionConfig {
  id: ContactMethodType
  label: string
  sublabel: string
  locationNote: string
  requiresSlot: boolean
  icon: string
  accentColor: string
}

export const CONTACT_OPTIONS: ContactOptionConfig[] = [
  {
    id: 'In-Person Meeting',
    label: 'Meet Us in Bilaspur',
    sublabel: 'Physical meeting in Bilaspur, Chhattisgarh',
    locationNote: 'Bilaspur, Chhattisgarh only',
    requiresSlot: true,
    icon: '📍',
    accentColor: '#111111',
  },
  {
    id: 'Google Meet',
    label: 'Book a Google Meet',
    sublabel: 'Video discussion with our team',
    locationNote: 'Available nationwide',
    requiresSlot: true,
    icon: '📹',
    accentColor: '#D94700',
  },
  {
    id: 'Call',
    label: 'Request a Call',
    sublabel: 'Schedule a callback at your preferred time',
    locationNote: 'Direct phone callback',
    requiresSlot: true,
    icon: '📞',
    accentColor: '#111111',
  },
  {
    id: 'WhatsApp',
    label: 'Chat on WhatsApp',
    sublabel: 'Instant response & custom catalogs',
    locationNote: 'Available anytime',
    requiresSlot: false,
    icon: '💬',
    accentColor: '#25D366',
  },
]
