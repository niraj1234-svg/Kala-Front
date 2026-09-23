/**
 * KALA Flying Product Add-to-Cart Animation Utility
 *
 * Animates a cloned product image along a smooth, curved arc trajectory
 * from the clicked ProductCard to the Navbar cart icon.
 */

export interface FlyToCartOptions {
  sourceElement: HTMLElement | null
  imageSrc: string
  productName: string
  onComplete?: () => void
}

export function flyToCart(options: FlyToCartOptions): void {
  const { sourceElement, imageSrc, productName, onComplete } = options

  // Find destination cart icon in Navbar
  const cartTarget = (document.querySelector('[data-cart-target="true"]') ||
    document.querySelector('.kala-icon-btn[href*="/cart"]') ||
    document.querySelector('.kala-icon-btn svg path[d*="M6 2L3 6"]')?.closest('.kala-icon-btn')) as HTMLElement | null

  // Check for reduced motion preference
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const triggerCartPop = () => {
    if (cartTarget) {
      cartTarget.classList.remove('cart-pop')
      // Trigger reflow to restart animation if clicked repeatedly
      void cartTarget.offsetWidth
      cartTarget.classList.add('cart-pop')
      setTimeout(() => {
        cartTarget.classList.remove('cart-pop')
      }, 500)
    }

    // Dispatch global events for Navbar badge bump and toast
    window.dispatchEvent(
      new CustomEvent('kala:cart-pop', {
        detail: { productName },
      })
    )

    window.dispatchEvent(
      new CustomEvent('kala:cart-toast', {
        detail: { productName },
      })
    )

    if (onComplete) onComplete()
  }

  // If reduced motion is preferred or either element is missing, skip the flight
  if (prefersReducedMotion || !sourceElement || !cartTarget) {
    triggerCartPop()
    return
  }

  const startRect = sourceElement.getBoundingClientRect()
  const endRect = cartTarget.getBoundingClientRect()

  // Guard against zero-dimension or hidden elements
  if (startRect.width === 0 || startRect.height === 0) {
    triggerCartPop()
    return
  }

  // Create temporary clone container
  const clone = document.createElement('div')
  clone.className = 'kala-flying-product'

  const img = document.createElement('img')
  img.src = imageSrc
  img.alt = productName
  img.style.width = '100%'
  img.style.height = '100%'
  img.style.objectFit = 'cover'
  img.style.display = 'block'
  clone.appendChild(img)

  const isMobile = window.innerWidth <= 640
  const duration = isMobile ? 650 : 750 // ms

  // Initial styling for the clone
  const initialLeft = startRect.left
  const initialTop = startRect.top
  const initialWidth = startRect.width
  const initialHeight = startRect.height

  Object.assign(clone.style, {
    position: 'fixed',
    left: `${initialLeft}px`,
    top: `${initialTop}px`,
    width: `${initialWidth}px`,
    height: `${initialHeight}px`,
    zIndex: '999999',
    pointerEvents: 'none',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 16px 36px rgba(0, 0, 0, 0.28), 0 0 16px rgba(230, 81, 0, 0.4)',
    border: '2px solid var(--kala-orange, #e65100)',
    willChange: 'transform, opacity',
    transformOrigin: 'center center',
    transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)',
    opacity: '1',
  })

  document.body.appendChild(clone)

  // Starting point (center)
  const p0 = {
    x: initialLeft + initialWidth / 2,
    y: initialTop + initialHeight / 2,
  }

  // Destination point (center of cart target)
  const p2 = {
    x: endRect.left + endRect.width / 2,
    y: endRect.top + endRect.height / 2,
  }

  // Control point for smooth curved upward arc
  const arcLift = Math.min(140, Math.max(50, Math.abs(p0.x - p2.x) * 0.16 + 40))
  const p1 = {
    x: (p0.x + p2.x) / 2,
    y: Math.min(p0.y, p2.y) - arcLift,
  }

  const startTime = performance.now()

  // Smooth cubic-bezier easeOutQuart: 1 - (1 - t)^3.5
  const easeProgress = (t: number): number => {
    return 1 - Math.pow(1 - t, 3.5)
  }

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = easeProgress(progress)

    // Quadratic Bezier interpolation: B(t) = (1-t)^2 * P0 + 2*(1-t)*t * P1 + t^2 * P2
    const currentX =
      Math.pow(1 - eased, 2) * p0.x +
      2 * (1 - eased) * eased * p1.x +
      Math.pow(eased, 2) * p2.x

    const currentY =
      Math.pow(1 - eased, 2) * p0.y +
      2 * (1 - eased) * eased * p1.y +
      Math.pow(eased, 2) * p2.y

    // Scale calculation:
    // First 12%: image lifts off slightly (1.0 -> 1.05)
    // Next 88%: shrinks down smoothly to 0.18
    let currentScale = 1
    if (progress < 0.12) {
      const liftFactor = progress / 0.12
      currentScale = 1 + liftFactor * 0.05
    } else {
      const shrinkProgress = (progress - 0.12) / 0.88
      currentScale = 1.05 - shrinkProgress * (1.05 - 0.18)
    }

    // Rotation: subtle dynamic tilt (+7 degrees mid flight, straightening at cart)
    const currentRotation = Math.sin(progress * Math.PI) * 7

    // Opacity: stay 1 until 82% of flight, then fade out smoothly
    let currentOpacity = 1
    if (progress > 0.82) {
      currentOpacity = Math.max(0, 1 - (progress - 0.82) / 0.18)
    }

    const deltaX = currentX - p0.x
    const deltaY = currentY - p0.y

    clone.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${currentScale}) rotate(${currentRotation}deg)`
    clone.style.opacity = `${currentOpacity}`

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      // Clean up clone completely
      if (clone.parentNode) {
        clone.parentNode.removeChild(clone)
      }
      triggerCartPop()
    }
  }

  requestAnimationFrame(animate)
}
