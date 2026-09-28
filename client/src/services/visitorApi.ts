import { API_BASE_URL } from '../config/api'

const VISITOR_ID_KEY = 'kala_visitor_id'
const VISIT_REPORTED_SESSION_KEY = 'kala_visit_reported'

/**
 * Detect client device type based on user agent
 */
function detectDevice(): string {
  const ua = navigator.userAgent || ''
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'Tablet'
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) {
    return 'Mobile'
  }
  return 'Desktop'
}

/**
 * Detect browser name
 */
function detectBrowser(): string {
  const ua = navigator.userAgent || ''
  if (ua.includes('Firefox/')) return 'Firefox'
  if (ua.includes('Edg/')) return 'Microsoft Edge'
  if (ua.includes('Chrome/')) return 'Google Chrome'
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Apple Safari'
  if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera'
  return 'Unknown Browser'
}

/**
 * Detect operating system
 */
function detectOS(): string {
  const ua = navigator.userAgent || ''
  if (ua.includes('Win')) return 'Windows'
  if (ua.includes('Mac')) return 'macOS'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) return 'iOS'
  if (ua.includes('Linux')) return 'Linux'
  return 'Unknown OS'
}

/**
 * Generates an anonymous, collision-resistant visitor identifier
 */
function generateVisitorId(): string {
  const timestamp = Date.now().toString(36)
  const randomSuffix = Math.random().toString(36).substring(2, 10)
  return `vis_${timestamp}_${randomSuffix}`
}

/**
 * Retrieves the stored visitor ID or generates and persists a new one
 */
export function getOrCreateVisitorId(): { visitorId: string; isGeneratedNow: boolean } {
  try {
    let visitorId = localStorage.getItem(VISITOR_ID_KEY)
    if (!visitorId || typeof visitorId !== 'string' || visitorId.trim().length === 0) {
      visitorId = generateVisitorId()
      localStorage.setItem(VISITOR_ID_KEY, visitorId)
      return { visitorId, isGeneratedNow: true }
    }
    return { visitorId: visitorId.trim(), isGeneratedNow: false }
  } catch {
    return { visitorId: generateVisitorId(), isGeneratedNow: true }
  }
}

/**
 * Records first visit to the backend.
 * Protected against spamming via session check and backend idempotency.
 */
export async function trackFirstVisit(): Promise<void> {
  try {
    // If already reported during this tab session, avoid unnecessary network calls
    if (sessionStorage.getItem(VISIT_REPORTED_SESSION_KEY)) {
      return
    }

    const { visitorId } = getOrCreateVisitorId()
    const device = detectDevice()
    const browser = detectBrowser()
    const os = detectOS()
    const referrer = document.referrer ? document.referrer.slice(0, 200) : 'Direct'
    const location = Intl.DateTimeFormat().resolvedOptions().timeZone || ''

    const response = await fetch(`${API_BASE_URL}/visitors/first-visit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitorId,
        device,
        browser,
        os,
        referrer,
        location,
        userAgent: navigator.userAgent.slice(0, 300),
      }),
    })

    if (response.ok) {
      sessionStorage.setItem(VISIT_REPORTED_SESSION_KEY, 'true')
    }
  } catch (err) {
    console.debug('[VisitorApi] First visit tracking omitted:', err)
  }
}
