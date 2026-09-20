import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Global ScrollToTop component for React Router.
 * Automatically restores window scroll position to the top on every route/pathname change
 * without smooth-scrolling animations to prevent visible content jumping after render.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll window immediately to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    })

    // Cross-browser/mobile fallbacks
    if (document.documentElement) {
      document.documentElement.scrollTop = 0
    }
    if (document.body) {
      document.body.scrollTop = 0
    }
  }, [pathname])

  return null
}

export default ScrollToTop
