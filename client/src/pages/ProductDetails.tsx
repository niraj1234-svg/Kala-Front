import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PRODUCTS, getProductHighlights, getProductImage } from '../data/products'
import type { Product, ProductColorVariant } from '../data/products'
import { fetchProductById } from '../services/productApi'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import ProductReviewsSection from '../components/reviews/ProductReviewsSection'
import SimilarProducts from '../components/SimilarProducts'
import '../styles/ProductDetails.css'

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

// Centralized Text Size Configuration (16px to 72px)
const TEXT_SIZE_CONFIG = {
  min: 16,
  max: 72,
  default: 32,
  step: 2,
}

// Safe printable area boundary percentages on the product image preview
const SAFE_BOUNDS = {
  front: { minX: 30, maxX: 70, minY: 35, maxY: 68 },
  back: { minX: 28, maxX: 72, minY: 28, maxY: 65 },
}

// Standard Apparel Size Chart Data (Matches reference modal in inches)
const SIZE_CHART_DATA = [
  { size: 'XXS', chest: '34', shoulder: '14', length: '25' },
  { size: 'XS', chest: '36', shoulder: '15', length: '26' },
  { size: 'S', chest: '38', shoulder: '16', length: '27' },
  { size: 'M', chest: '40', shoulder: '17', length: '28' },
  { size: 'L', chest: '42', shoulder: '18', length: '29' },
  { size: 'XL', chest: '44', shoulder: '19', length: '30' },
  { size: 'XXL', chest: '46', shoulder: '20', length: '31' },
  { size: '3XL', chest: '48', shoulder: '21', length: '32' },
]

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const initialColorParam = searchParams.get('color')
  const navigate = useNavigate()
  const { addMultipleToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { isAuthenticated } = useAuth()

  // Front & Back Custom Text State
  const [customFrontText, setCustomFrontText] = useState<string>('')
  const [customBackText, setCustomBackText] = useState<string>('')
  const [frontPosition, setFrontPosition] = useState<{ x: number; y: number }>({ x: 50, y: 52 })
  const [backPosition, setBackPosition] = useState<{ x: number; y: number }>({ x: 50, y: 44 })
  const [frontFontSize, setFrontFontSize] = useState<number>(TEXT_SIZE_CONFIG.default)
  const [backFontSize, setBackFontSize] = useState<number>(TEXT_SIZE_CONFIG.default)
  const [frontRotation, setFrontRotation] = useState<number>(0)
  const [backRotation, setBackRotation] = useState<number>(0)
  const [isTextSelected, setIsTextSelected] = useState<boolean>(true)
  const [activeTransformMode, setActiveTransformMode] = useState<'move' | 'resize' | 'rotate' | null>(null)

  const dragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number } | null>(null)
  const resizeStartRef = useRef<{ clientX: number; clientY: number; startFontSize: number } | null>(null)
  const rotateCenterRef = useRef<{ centerX: number; centerY: number } | null>(null)
  const previewCardRef = useRef<HTMLDivElement>(null)
  const textElementRef = useRef<HTMLDivElement>(null)
  const textInputRef = useRef<HTMLInputElement>(null)

  const [product, setProduct] = useState<Product | null>(() => {
    return PRODUCTS.find((p) => p.id === id) || null
  })

  const [selectedVariant, setSelectedVariant] = useState<ProductColorVariant | null>(() => {
    const p = PRODUCTS.find((prod) => prod.id === id)
    if (!p?.variants || p.variants.length === 0) return null
    if (initialColorParam) {
      const match = p.variants.find(
        (v) => v.colorName.toLowerCase() === initialColorParam.toLowerCase()
      )
      if (match) return match
    }
    return p.variants[0]
  })

  const [activeImage, setActiveImage] = useState<string>(() => {
    const p = PRODUCTS.find((prod) => prod.id === id)
    if (p?.variants && p.variants.length > 0) {
      if (initialColorParam) {
        const match = p.variants.find(
          (v) => v.colorName.toLowerCase() === initialColorParam.toLowerCase()
        )
        if (match) return match.image
      }
      return p.variants[0].image
    }
    return p?.image || ''
  })
  // Multi-size breakdown quantities matching the 2nd reference image (S, M, L, XL, XXL)
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>({
    S: 1,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0,
  })
  const [sizeInputs, setSizeInputs] = useState<Record<string, string>>({
    S: '1',
    M: '0',
    L: '0',
    XL: '0',
    XXL: '0',
  })
  const [selectedMobileSize, setSelectedMobileSize] = useState<string>('S')
  const [mobileQty, setMobileQty] = useState<number>(1)

  const handleSelectMobileSize = (size: string) => {
    setSelectedMobileSize(size)
    const nextQty: Record<string, number> = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 }
    const nextInputs: Record<string, string> = { S: '0', M: '0', L: '0', XL: '0', XXL: '0' }
    nextQty[size] = mobileQty
    nextInputs[size] = String(mobileQty)
    setSizeQuantities(nextQty)
    setSizeInputs(nextInputs)
    if (sizeError) setSizeError('')
  }

  const handleIncreaseMobileQty = () => {
    const next = mobileQty + 1
    setMobileQty(next)
    setSizeQuantities((prev) => ({
      ...prev,
      [selectedMobileSize]: next,
    }))
    setSizeInputs((inputs) => ({
      ...inputs,
      [selectedMobileSize]: String(next),
    }))
    if (sizeError) setSizeError('')
  }

  const handleDecreaseMobileQty = () => {
    if (mobileQty <= 1) return
    const next = mobileQty - 1
    setMobileQty(next)
    setSizeQuantities((prev) => ({
      ...prev,
      [selectedMobileSize]: next,
    }))
    setSizeInputs((inputs) => ({
      ...inputs,
      [selectedMobileSize]: String(next),
    }))
  }

  const [sizeError, setSizeError] = useState<string>('')
  const [addedNotification, setAddedNotification] = useState<boolean>(false)
  const [shareFeedback, setShareFeedback] = useState<string>('')
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false)
  const [isSizeChartOpen, setIsSizeChartOpen] = useState<boolean>(false)

  // Prevent background scrolling and handle ESC when Size Chart modal is open
  useEffect(() => {
    if (isSizeChartOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsSizeChartOpen(false)
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = originalStyle
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isSizeChartOpen])

  // Scroll to top and fetch fresh product data on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    setSizeQuantities({ S: 1, M: 0, L: 0, XL: 0, XXL: 0 })
    setSizeInputs({ S: '1', M: '0', L: '0', XL: '0', XXL: '0' })
    setSelectedMobileSize('S')
    setMobileQty(1)
    setSizeError('')
    if (!id) return
    let isMounted = true

    fetchProductById(id).then((liveProduct) => {
      if (isMounted && liveProduct) {
        setProduct(liveProduct)
        if (liveProduct.variants && liveProduct.variants.length > 0) {
          const match = initialColorParam
            ? liveProduct.variants.find(
                (v) => v.colorName.toLowerCase() === initialColorParam.toLowerCase()
              )
            : null
          const chosen = match || liveProduct.variants[0]
          setSelectedVariant(chosen)
          setActiveImage(chosen.image)
        } else {
          setActiveImage(liveProduct.image)
        }
      }
    })

    return () => {
      isMounted = false
    }
  }, [id, initialColorParam])

  // Sync activeImage whenever product initial load or update occurs
  useEffect(() => {
    if (selectedVariant) {
      setActiveImage(selectedVariant.image)
    } else if (product && !activeImage) {
      setActiveImage(product.image)
    }
  }, [product, selectedVariant, activeImage])

  // 1. PRODUCT NOT FOUND STATE
  if (!product) {
    return (
      <main className="kala-container kala-not-found-box">
        <p className="kala-display" style={{ color: 'var(--kala-orange)', marginBottom: '0.5rem' }}>
          404
        </p>
        <h1 className="kala-h2" style={{ marginBottom: '1rem' }}>
          PRODUCT NOT FOUND
        </h1>
        <p className="kala-body" style={{ color: 'var(--kala-text-secondary)', marginBottom: '2rem' }}>
          The product you're looking for does not exist.
        </p>
        <Link to="/shop" className="kala-btn kala-btn-primary">
          BACK TO SHOP
        </Link>
      </main>
    )
  }

  const supportsCustomText = Boolean(
    product.customPrintTextEnabled === true ||
    product.id === 'kala-bihari-story-premium-t-shirt'
  )

  const hasFrontText = customFrontText.trim().length > 0
  const hasBackText = customBackText.trim().length > 0
  const hasCustomText = Boolean(supportsCustomText && (hasFrontText || hasBackText))
  const customizationFee = hasCustomText ? 25 : 0
  const displayPrice = product.price + customizationFee

  const galleryImages = (product.images && product.images.length > 0)
    ? product.images
    : product.id === 'kala-bihari-story-premium-t-shirt'
      ? [product.image, getProductImage('kala-bihari-story-back.png')].filter(Boolean)
      : product.id === 'ai-data-science-polo-t-shirt'
        ? [getProductImage('ai-data-science-polo-front.png'), getProductImage('ai-data-science-polo-back.png')].filter(Boolean)
        : (product.id.startsWith('kala-') && product.id.endsWith('-set'))
          ? [product.image, getProductImage(`${product.id}-back.png`)].filter(Boolean)
          : [product.image].filter(Boolean)

  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)
  const touchStartRef = useRef<number | null>(null)
  const mouseStartRef = useRef<number | null>(null)

  const highlights = getProductHighlights(product)
  const isWishlisted = isInWishlist(product.id)

  const currentImgIndex = Math.max(
    0,
    galleryImages.findIndex(
      (img) =>
        img === (activeImage || product.image) ||
        (Boolean(img) && Boolean(activeImage) && (img.endsWith(activeImage) || activeImage.endsWith(img)))
    )
  )
  const safeImgIndex = currentImgIndex >= 0 ? currentImgIndex : 0

  const goToSlide = (newIndex: number, direction: 'left' | 'right') => {
    if (newIndex === safeImgIndex || !galleryImages[newIndex]) return
    setSlideDirection(direction)
    setActiveImage(galleryImages[newIndex])
    setTimeout(() => setSlideDirection(null), 320)
  }

  const handleNextSlide = () => {
    if (galleryImages.length <= 1) return
    const nextIdx = (safeImgIndex + 1) % galleryImages.length
    goToSlide(nextIdx, 'left')
  }

  const handlePrevSlide = () => {
    if (galleryImages.length <= 1) return
    const prevIdx = (safeImgIndex - 1 + galleryImages.length) % galleryImages.length
    goToSlide(prevIdx, 'right')
  }

  const handleCardTouchStart = (e: React.TouchEvent) => {
    if (activeTransformMode || isTextSelected) return
    touchStartRef.current = e.touches[0].clientX
  }

  const handleCardTouchEnd = (e: React.TouchEvent) => {
    if (activeTransformMode || isTextSelected || touchStartRef.current === null) return
    const deltaX = touchStartRef.current - e.changedTouches[0].clientX
    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) {
        handleNextSlide()
      } else {
        handlePrevSlide()
      }
    }
    touchStartRef.current = null
  }

  const handleCardMouseDown = (e: React.MouseEvent) => {
    if (activeTransformMode || isTextSelected) return
    mouseStartRef.current = e.clientX
  }

  const handleCardMouseUp = (e: React.MouseEvent) => {
    if (activeTransformMode || isTextSelected || mouseStartRef.current === null) return
    const deltaX = mouseStartRef.current - e.clientX
    if (Math.abs(deltaX) > 45) {
      if (deltaX > 0) {
        handleNextSlide()
      } else {
        handlePrevSlide()
      }
    }
    mouseStartRef.current = null
  }

  // Detect whether current view is Front or Back
  const activeImageStr = (activeImage || product.image).toLowerCase()
  const isBackView = activeImageStr.includes('back') || safeImgIndex === 1
  const currentViewKey = isBackView ? 'back' : 'front'

  // Text, position, font size, and rotation to display on the active view
  const currentTextToDisplay = isBackView ? customBackText : customFrontText
  const currentPosition = isBackView ? backPosition : frontPosition
  const currentFontSize = isBackView ? backFontSize : frontFontSize
  const currentRotation = isBackView ? backRotation : frontRotation

  // Pointer Down on Move Handle (✥)
  const handleMovePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsTextSelected(true)
    setActiveTransformMode('move')
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: currentPosition.x,
      startY: currentPosition.y,
    }
    if (textElementRef.current) {
      try {
        textElementRef.current.setPointerCapture(e.pointerId)
      } catch {
        // fallback
      }
    }
  }

  // Pointer Down on Box container (Move / Drag when not clicking input)
  const handleBoxPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('.kala-text-handle')) return
    if (target.tagName === 'INPUT') {
      setIsTextSelected(true)
      return
    }

    e.preventDefault()
    e.stopPropagation()
    setIsTextSelected(true)
    setActiveTransformMode('move')
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: currentPosition.x,
      startY: currentPosition.y,
    }
    if (textElementRef.current) {
      try {
        textElementRef.current.setPointerCapture(e.pointerId)
      } catch {
        // fallback
      }
    }
  }

  // Pointer Down on Resize Handle (↘)
  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsTextSelected(true)
    setActiveTransformMode('resize')
    resizeStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startFontSize: currentFontSize,
    }
    if (textElementRef.current) {
      try {
        textElementRef.current.setPointerCapture(e.pointerId)
      } catch {
        // fallback
      }
    }
  }

  // Pointer Down on Rotate Handle (↻)
  const handleRotatePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsTextSelected(true)
    setActiveTransformMode('rotate')

    if (textElementRef.current) {
      const rect = textElementRef.current.getBoundingClientRect()
      rotateCenterRef.current = {
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
      }
      try {
        textElementRef.current.setPointerCapture(e.pointerId)
      } catch {
        // fallback
      }
    }
  }

  // Unified Pointer Move (dispatches based on activeTransformMode)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeTransformMode) return
    e.preventDefault()

    if (activeTransformMode === 'move') {
      if (!dragStartRef.current || !previewCardRef.current) return
      const rect = previewCardRef.current.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      const deltaXPercent = ((e.clientX - dragStartRef.current.clientX) / rect.width) * 100
      const deltaYPercent = ((e.clientY - dragStartRef.current.clientY) / rect.height) * 100

      const bounds = SAFE_BOUNDS[currentViewKey]
      const targetX = dragStartRef.current.startX + deltaXPercent
      const targetY = dragStartRef.current.startY + deltaYPercent

      const clampedX = Math.max(bounds.minX, Math.min(bounds.maxX, +targetX.toFixed(1)))
      const clampedY = Math.max(bounds.minY, Math.min(bounds.maxY, +targetY.toFixed(1)))

      if (isBackView) {
        setBackPosition({ x: clampedX, y: clampedY })
      } else {
        setFrontPosition({ x: clampedX, y: clampedY })
      }
    } else if (activeTransformMode === 'resize') {
      if (!resizeStartRef.current) return
      const deltaX = e.clientX - resizeStartRef.current.clientX
      const deltaY = e.clientY - resizeStartRef.current.clientY
      const sizeDelta = Math.round((deltaX + deltaY) * 0.28)
      // Clamped between min 16px and max 54px
      const newSize = Math.max(16, Math.min(54, resizeStartRef.current.startFontSize + sizeDelta))

      if (isBackView) {
        setBackFontSize(newSize)
      } else {
        setFrontFontSize(newSize)
      }
    } else if (activeTransformMode === 'rotate') {
      if (!rotateCenterRef.current) return
      const { centerX, centerY } = rotateCenterRef.current
      const rad = Math.atan2(e.clientY - centerY, e.clientX - centerX)
      // +90 because handle is at top (12 o'clock)
      let deg = Math.round((rad * 180) / Math.PI) + 90
      if (deg > 180) deg -= 360
      if (deg < -180) deg += 360

      // Snap within 4 degrees of straight angles
      if (Math.abs(deg) <= 4) deg = 0
      else if (Math.abs(deg - 90) <= 4) deg = 90
      else if (Math.abs(deg + 90) <= 4) deg = -90
      else if (Math.abs(deg - 180) <= 4 || Math.abs(deg + 180) <= 4) deg = 180

      if (isBackView) {
        setBackRotation(deg)
      } else {
        setFrontRotation(deg)
      }
    }
  }

  // Unified Pointer Up
  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeTransformMode) {
      setActiveTransformMode(null)
      dragStartRef.current = null
      resizeStartRef.current = null
      rotateCenterRef.current = null
      try {
        ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
      } catch {
        // fallback
      }
      if (textElementRef.current) {
        try {
          textElementRef.current.releasePointerCapture(e.pointerId)
        } catch {
          // fallback
        }
      }
    }
  }

  // Single-line summary with optional expansion
  const shortDescription = supportsCustomText
    ? 'Premium 220 GSM Bihar-inspired streetwear T-shirt with expressive artwork and comfortable construction. Custom print available (+₹25).'
    : (() => {
        const sentences = product.description.split('. ')
        if (sentences.length > 1) {
          return sentences[0].endsWith('.') ? sentences[0] : `${sentences[0]}.`
        }
        return product.description
      })()

  const hasExpandableDescription = product.description.trim() !== shortDescription.trim()

  // Total Quantity across all sizes & total price
  const totalQuantity = AVAILABLE_SIZES.reduce(
    (sum, size) => sum + (sizeQuantities[size] || 0),
    0
  )
  const totalPrice = totalQuantity * displayPrice

  // Handle Multi-Size Quantity adjustments (Infinite max quantity & direct typed input)
  const handleIncreaseSizeQty = (size: string) => {
    setSizeQuantities((prev) => {
      const current = prev[size] || 0
      const next = current + 1
      setSizeInputs((inputs) => ({ ...inputs, [size]: String(next) }))
      return { ...prev, [size]: next }
    })
    if (sizeError) setSizeError('')
  }

  const handleDecreaseSizeQty = (size: string) => {
    setSizeQuantities((prev) => {
      const current = prev[size] || 0
      const next = Math.max(0, current - 1)
      setSizeInputs((inputs) => ({ ...inputs, [size]: String(next) }))
      return { ...prev, [size]: next }
    })
  }

  const handleSizeInputChange = (size: string, rawVal: string) => {
    const digitsOnly = rawVal.replace(/\D/g, '')
    setSizeInputs((prev) => ({ ...prev, [size]: digitsOnly }))
    if (digitsOnly !== '') {
      const parsed = parseInt(digitsOnly, 10)
      setSizeQuantities((prev) => ({ ...prev, [size]: parsed }))
      if (sizeError) setSizeError('')
    } else {
      setSizeQuantities((prev) => ({ ...prev, [size]: 0 }))
    }
  }

  const handleSizeInputBlur = (size: string) => {
    const rawVal = sizeInputs[size]
    if (!rawVal || isNaN(parseInt(rawVal, 10))) {
      const fallback = sizeQuantities[size] || 0
      setSizeInputs((prev) => ({ ...prev, [size]: String(fallback) }))
    } else {
      const parsed = parseInt(rawVal, 10)
      setSizeQuantities((prev) => ({ ...prev, [size]: parsed }))
      setSizeInputs((prev) => ({ ...prev, [size]: String(parsed) }))
    }
  }

  const handleCardClick = (size: string, e: React.MouseEvent) => {
    const targetTag = (e.target as HTMLElement).tagName
    if (targetTag === 'INPUT' || targetTag === 'BUTTON') return

    if (totalQuantity <= 1) {
      // 1-click size switch for single item purchase
      const nextQty: Record<string, number> = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 }
      const nextInputs: Record<string, string> = { S: '0', M: '0', L: '0', XL: '0', XXL: '0' }
      nextQty[size] = 1
      nextInputs[size] = '1'
      setSizeQuantities(nextQty)
      setSizeInputs(nextInputs)
    } else {
      // Multi-size builder: if size is 0, activate with 1
      if ((sizeQuantities[size] || 0) === 0) {
        setSizeQuantities((prev) => ({ ...prev, [size]: 1 }))
        setSizeInputs((prev) => ({ ...prev, [size]: '1' }))
      }
    }
    if (sizeError) setSizeError('')
  }

  // Build customization payload with normalized coordinates and font sizes
  const buildCustomizationPayload = () => {
    if (!hasCustomText) return undefined
    return {
      frontText: customFrontText.trim().slice(0, 50) || undefined,
      backText: customBackText.trim().slice(0, 50) || undefined,
      frontPosition: hasFrontText ? frontPosition : undefined,
      backPosition: hasBackText ? backPosition : undefined,
      frontFontSize: hasFrontText ? frontFontSize : undefined,
      backFontSize: hasBackText ? backFontSize : undefined,
      frontRotation: hasFrontText ? frontRotation : undefined,
      backRotation: hasBackText ? backRotation : undefined,
      customText: {
        front: {
          text: customFrontText.trim(),
          x: +(frontPosition.x / 100).toFixed(3),
          y: +(frontPosition.y / 100).toFixed(3),
          fontSize: frontFontSize,
          rotation: frontRotation,
        },
        back: {
          text: customBackText.trim(),
          x: +(backPosition.x / 100).toFixed(3),
          y: +(backPosition.y / 100).toFixed(3),
          fontSize: backFontSize,
          rotation: backRotation,
        },
      },
      price: customizationFee,
      apparelType: 'tshirt',
      color: selectedVariant?.colorName || 'Standard',
      position: hasFrontText && hasBackText ? 'front & back' : hasFrontText ? 'front' : 'back',
    }
  }

  // Handle Buy Now
  const handleBuyNow = () => {
    const selectedEntries = AVAILABLE_SIZES.map((size) => ({
      size,
      quantity: sizeQuantities[size] || 0,
    })).filter((entry) => entry.quantity > 0)

    if (selectedEntries.length === 0) {
      setSizeError('Please select quantity for at least one size')
      return
    }

    setSizeError('')
    const cartProduct = {
      ...product,
      image: selectedVariant?.image || activeImage || product.image,
    }
    const customizationData = buildCustomizationPayload()

    const itemsToAdd = selectedEntries.map((entry) => ({
      product: cartProduct,
      size: entry.size,
      quantity: entry.quantity,
      customization: customizationData as any,
    }))

    addMultipleToCart(itemsToAdd)

    if (!isAuthenticated) {
      navigate('/account?redirect=/checkout&message=Please%20log%20in%20or%20create%20an%20account%20to%20continue%20with%20your%20purchase.')
      return
    }

    navigate('/checkout')
  }

  // Handle Add to Cart
  const handleAddToCart = () => {
    const selectedEntries = AVAILABLE_SIZES.map((size) => ({
      size,
      quantity: sizeQuantities[size] || 0,
    })).filter((entry) => entry.quantity > 0)

    if (selectedEntries.length === 0) {
      setSizeError('Please select quantity for at least one size')
      return
    }

    setSizeError('')
    const cartProduct = {
      ...product,
      image: selectedVariant?.image || activeImage || product.image,
    }
    const customizationData = buildCustomizationPayload()

    const itemsToAdd = selectedEntries.map((entry) => ({
      product: cartProduct,
      size: entry.size,
      quantity: entry.quantity,
      customization: customizationData as any,
    }))

    addMultipleToCart(itemsToAdd)
    setAddedNotification(true)

    setTimeout(() => {
      setAddedNotification(false)
    }, 3500)
  }

  const handleColorSelect = (variant: ProductColorVariant) => {
    setSelectedVariant(variant)
    setActiveImage(variant.image)
  }

  // Handle Share action
  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `${product.name} — KALA`,
      url: window.location.href,
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // Fall back to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareFeedback('Link Copied!')
      setTimeout(() => setShareFeedback(''), 2500)
    } catch {
      setShareFeedback('Link Copied!')
      setTimeout(() => setShareFeedback(''), 2500)
    }
  }

  return (
    <main className="kala-container kala-details-page">
      <div className="kala-details-grid">
        {/* ====================================================================
            LEFT: Product Image Preview with Live Text Customization
            (Clean layout: standalone floating arrow block & bottom chips removed)
            ==================================================================== */}
        <div className="kala-details-gallery">
          {/* Slick View Toggle Pill above image if multiple images */}
          {galleryImages.length > 1 && (
            <div className="kala-slick-view-toggle" role="tablist" aria-label="Product side view selector">
              <button
                type="button"
                role="tab"
                aria-selected={!isBackView}
                className={`kala-slick-toggle-btn ${!isBackView ? 'active' : ''}`}
                onClick={() => goToSlide(0, 'right')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
                </svg>
                FRONT VIEW
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isBackView}
                className={`kala-slick-toggle-btn ${isBackView ? 'active' : ''}`}
                onClick={() => goToSlide(1, 'left')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
                </svg>
                BACK VIEW
              </button>
            </div>
          )}

          <div
            className="kala-details-main-image-card"
            ref={previewCardRef}
            onTouchStart={handleCardTouchStart}
            onTouchEnd={handleCardTouchEnd}
            onMouseDown={handleCardMouseDown}
            onMouseUp={handleCardMouseUp}
            onClick={(e) => {
              const target = e.target as HTMLElement
              if (!target.closest('.kala-live-text-overlay')) {
                setIsTextSelected(false)
              }
            }}
          >
            {/* Side Navigation Arrow: Previous (Front) */}
            {galleryImages.length > 1 && (
              <button
                type="button"
                className="kala-preview-side-arrow prev"
                onClick={handlePrevSlide}
                aria-label="View previous image"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}

            {/* Side Navigation Arrow: Next (Back) */}
            {galleryImages.length > 1 && (
              <button
                type="button"
                className="kala-preview-side-arrow next"
                onClick={handleNextSlide}
                aria-label="View next image"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}

            {/* Main T-Shirt Image with animated slide track */}
            <div className={`kala-slider-track ${slideDirection ? `slide-${slideDirection}` : ''}`}>
              <img
                src={activeImage || product.image}
                alt={`${product.name} — ${isBackView ? 'Back View' : 'Front View'}`}
                className="kala-preview-main-img"
                loading="eager"
                draggable={false}
              />
            </div>

            {/* Safe Printable Boundary Box (Orange dashed lines visible on shirt) */}
            {supportsCustomText && (
              <div
                className="kala-details-safe-boundary"
                style={{
                  left: `${SAFE_BOUNDS[currentViewKey].minX}%`,
                  top: `${SAFE_BOUNDS[currentViewKey].minY}%`,
                  width: `${SAFE_BOUNDS[currentViewKey].maxX - SAFE_BOUNDS[currentViewKey].minX}%`,
                  height: `${SAFE_BOUNDS[currentViewKey].maxY - SAFE_BOUNDS[currentViewKey].minY}%`,
                }}
                aria-hidden="true"
              />
            )}

            {/* Live Text Overlay directly on the T-shirt image with Direct Manipulation Handles */}
            {supportsCustomText && (
              <div
                ref={textElementRef}
                className={`kala-live-text-overlay ${isTextSelected ? 'selected' : ''} ${
                  activeTransformMode ? `transforming-${activeTransformMode}` : ''
                }`}
                style={{
                  left: `${currentPosition.x}%`,
                  top: `${currentPosition.y}%`,
                  transform: `translate(-50%, -50%) rotate(${currentRotation}deg)`,
                }}
                onPointerDown={handleBoxPointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsTextSelected(true)
                  if ((e.target as HTMLElement).tagName !== 'INPUT' && !(e.target as HTMLElement).closest('.kala-text-handle')) {
                    textInputRef.current?.focus()
                  }
                }}
                role="region"
                aria-label={`Custom text on ${currentViewKey}: ${currentTextToDisplay || 'Type text'}. Click to write text directly on shirt, or drag handles to reposition, resize, or rotate.`}
                tabIndex={0}
              >
                <div className="kala-live-text-box">
                  {/* Invisible auto-sizing mirror element */}
                  <span
                    className="kala-live-text-mirror"
                    style={{ fontSize: `${currentFontSize}px` }}
                    aria-hidden="true"
                  >
                    {currentTextToDisplay || 'TYPE YOUR TEXT'}
                  </span>

                  {/* Customer Direct Text Input on shirt */}
                  <input
                    ref={textInputRef}
                    type="text"
                    className="kala-live-text-input"
                    value={currentTextToDisplay}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().slice(0, 30)
                      if (isBackView) {
                        setCustomBackText(val)
                      } else {
                        setCustomFrontText(val)
                      }
                      setIsTextSelected(true)
                    }}
                    placeholder="TYPE YOUR TEXT"
                    maxLength={30}
                    autoCapitalize="characters"
                    spellCheck={false}
                    autoComplete="off"
                    style={{ fontSize: `${currentFontSize}px` }}
                    onFocus={() => setIsTextSelected(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        (e.target as HTMLInputElement).blur()
                      }
                    }}
                  />

                  {/* Clean Direct Manipulation Handles shown when selected */}
                  {isTextSelected && (
                    <>
                      {/* Top Stem & Rotation Handle (↻) */}
                      <div className="kala-text-rotate-stem" aria-hidden="true" />
                      <div
                        className="kala-text-handle kala-text-handle-rotate"
                        onPointerDown={handleRotatePointerDown}
                        title="Drag to rotate text"
                        aria-label="Drag to rotate text"
                        role="button"
                        tabIndex={0}
                      >
                        <span className="kala-handle-icon" aria-hidden="true">↻</span>
                      </div>

                      {/* Top-Right Clear / Delete Handle (×) */}
                      <button
                        type="button"
                        className="kala-text-handle kala-text-handle-delete"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isBackView) setCustomBackText('')
                          else setCustomFrontText('')
                          if (textInputRef.current) {
                            textInputRef.current.focus()
                          }
                        }}
                        title="Clear custom text"
                        aria-label="Clear custom text"
                      >
                        ×
                      </button>

                      {/* Bottom-Right Corner Resize Handle (↘) */}
                      <div
                        className="kala-text-handle kala-text-handle-resize"
                        onPointerDown={handleResizePointerDown}
                        title="Drag to resize text"
                        aria-label="Drag to resize text"
                        role="button"
                        tabIndex={0}
                      >
                        <span className="kala-handle-icon" aria-hidden="true">↘</span>
                      </div>

                      {/* Bottom-Left Corner Move Handle (✥) */}
                      <div
                        className="kala-text-handle kala-text-handle-move"
                        onPointerDown={handleMovePointerDown}
                        title="Drag to reposition text"
                        aria-label="Drag to reposition text"
                        role="button"
                        tabIndex={0}
                      >
                        <span className="kala-handle-icon" aria-hidden="true">✥</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>



        </div>

        {/* ====================================================================
            RIGHT: Product Information, Size & Add to Cart
            ==================================================================== */}
        <div className="kala-details-info">
          {/* Product Name */}
          <h1 className="kala-details-title">{product.name}</h1>

          {/* Price Framing & Savings */}
          {(() => {
            const origDisplayPrice = Math.round(displayPrice * 1.8)
            const totalSavings = origDisplayPrice - displayPrice
            const discountPct = Math.round((totalSavings / origDisplayPrice) * 100)

            return (
              <div className="kala-details-price-wrap">
                <span className="kala-details-price">
                  ₹{displayPrice.toLocaleString('en-IN')}
                </span>
                <span className="kala-details-orig-price">
                  ₹{origDisplayPrice.toLocaleString('en-IN')}
                </span>
                <span className="kala-details-discount-pill">
                  {discountPct}% OFF • SAVE ₹{totalSavings.toLocaleString('en-IN')}
                </span>
                {hasCustomText && (
                  <span className="kala-custom-price-badge">
                    (₹{product.price} base + ₹25 custom print)
                  </span>
                )}
              </div>
            )
          })()}

          {/* Stock & Urgency Indicator */}
          <div className="kala-details-stock-row">
            <div
              className={`kala-details-stock-status ${
                product.available ? 'in-stock' : 'out-of-stock'
              }`}
            >
              <span className="kala-stock-dot">●</span>
              <span>{product.available ? 'In Stock • Ready to Dispatch' : 'Out of Stock'}</span>
            </div>
          </div>

          {/* Real-Time Live Urgency & Scarcity Tracker */}
          <div className="kala-details-scarcity-box" role="status" aria-label="Product live demand">
            <div className="kala-scarcity-top-line">
              <span className="kala-scarcity-pulse-beacon" aria-hidden="true" />
              <span className="kala-scarcity-live-text">
                <strong>23 shoppers</strong> are looking at this right now
              </span>
            </div>
            <div className="kala-scarcity-stock-line">
              <span className="kala-scarcity-flame" aria-hidden="true">🔥</span>
              <span className="kala-scarcity-stock-text">
                High Demand: Only <strong>7 units left</strong> in stock across sizes
              </span>
            </div>
            <div className="kala-scarcity-progress-track">
              <div className="kala-scarcity-progress-bar" style={{ width: '82%' }} />
            </div>
          </div>

          {/* Key Specifications */}
          {supportsCustomText && (
            <div className="kala-details-spec-pills" aria-label="Key specifications">
              <span className="kala-spec-pill">220 GSM</span>
              <span className="kala-spec-pill">Premium Comfort</span>
              <span className="kala-spec-pill">Durable Fabric</span>
              <span className="kala-spec-pill">Comfortable Fit</span>
            </div>
          )}

          {/* 1-line description with optional expand/collapse */}
          <div className="kala-details-desc-wrap">
            <p className="kala-details-description">
              <span>{isDescriptionExpanded ? product.description : shortDescription}</span>
              {hasExpandableDescription && (
                <button
                  type="button"
                  className="kala-desc-toggle-btn"
                  onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                  aria-expanded={isDescriptionExpanded}
                >
                  {isDescriptionExpanded ? 'Read less' : 'Read more'}
                </button>
              )}
            </p>
          </div>

          {/* Color Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="kala-details-color-section">
              <span className="kala-section-label">Color</span>
              <div className="kala-details-color-options" role="radiogroup" aria-label="Select color">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.colorName === v.colorName
                  const isWhite =
                    v.colorName.toLowerCase() === 'white' || v.color.toLowerCase() === '#ffffff'
                  return (
                    <button
                      key={v.colorName}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`Color: ${v.colorName}`}
                      className={`kala-color-swatch-btn ${isSelected ? 'active' : ''} ${
                        isWhite ? 'white-swatch' : ''
                      }`}
                      style={{ backgroundColor: v.color }}
                      onClick={() => handleColorSelect(v)}
                    >
                      {isSelected && (
                        <span
                          className="kala-swatch-check"
                          style={{ color: isWhite ? '#111111' : '#ffffff' }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              <span className="kala-selected-color-name">
                {selectedVariant?.colorName || 'Select a color'}
              </span>
            </div>
          )}

          {/* ====================================================================
              Multi-Size Quantity Breakdown Matrix (Reference: 2nd Image)
              Each size has its own independent quantity stepper with infinite max
              and direct typed input support.
              ==================================================================== */}
          <div className="kala-size-breakdown-section">
            {/* Desktop Multi-Size Matrix */}
            <div className="kala-size-breakdown-desktop">
              <div className="kala-size-label-row">
                <div className="kala-size-header-left">
                  <span className="kala-section-label">Select Size</span>
                  <button
                    type="button"
                    className="kala-size-chart-link-btn"
                    onClick={() => setIsSizeChartOpen(true)}
                  >
                    Size Chart
                  </button>
                </div>
                {sizeError && <span className="kala-size-error-msg">{sizeError}</span>}
              </div>

              <div className="kala-size-cards-grid" role="group" aria-label="Select quantity for each size">
                {AVAILABLE_SIZES.map((size) => {
                  const qty = sizeQuantities[size] || 0
                  const inputValue = sizeInputs[size] !== undefined ? sizeInputs[size] : String(qty)
                  const isSelected = qty > 0

                  return (
                    <div
                      key={size}
                      className={`kala-size-card ${isSelected ? 'has-qty' : 'is-zero'}`}
                      onClick={(e) => handleCardClick(size, e)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Size ${size}, ${qty} pieces selected`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          if (
                            (e.target as HTMLElement).tagName !== 'INPUT' &&
                            (e.target as HTMLElement).tagName !== 'BUTTON'
                          ) {
                            e.preventDefault()
                            handleCardClick(size, e as any)
                          }
                        }
                      }}
                    >
                      <div className="kala-size-card-header">
                        <span className="kala-size-card-name">{size}</span>
                      </div>

                      <div className="kala-size-card-pcs">
                        {qty} pcs
                      </div>

                      <div
                        className="kala-size-card-stepper"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="kala-size-card-btn minus"
                          onClick={() => handleDecreaseSizeQty(size)}
                          disabled={qty <= 0}
                          aria-label={`Decrease ${size} quantity`}
                        >
                          −
                        </button>

                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="kala-size-card-input"
                          value={inputValue}
                          onChange={(e) => handleSizeInputChange(size, e.target.value)}
                          onBlur={() => handleSizeInputBlur(size)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              ;(e.target as HTMLInputElement).blur()
                            }
                          }}
                          aria-label={`Quantity for size ${size}`}
                        />

                        <button
                          type="button"
                          className="kala-size-card-btn plus"
                          onClick={() => handleIncreaseSizeQty(size)}
                          aria-label={`Increase ${size} quantity`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Total Quantity & Total Price Snapshot */}
              <div className="kala-size-qty-summary">
                <div className="kala-summary-pill">
                  <span>Total Quantity:</span>
                  <strong>{totalQuantity} pcs</strong>
                </div>
                <div className="kala-summary-pill">
                  <span>Total Price:</span>
                  <strong>₹{totalPrice.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            {/* Mobile Dedicated Clean Size & Quantity Section */}
            <div className="kala-size-breakdown-mobile">
              {/* SELECT SIZE */}
              <div className="kala-mobile-size-group">
                <div className="kala-size-label-row">
                  <div className="kala-size-header-left">
                    <span className="kala-section-label">Select Size</span>
                    <button
                      type="button"
                      className="kala-size-chart-link-btn"
                      onClick={() => setIsSizeChartOpen(true)}
                    >
                      Size Chart
                    </button>
                  </div>
                  {sizeError && <span className="kala-size-error-msg">{sizeError}</span>}
                </div>
                <div className="kala-mobile-size-row" role="radiogroup" aria-label="Select size">
                  {AVAILABLE_SIZES.map((size) => {
                    const isSelected = selectedMobileSize === size
                    return (
                      <button
                        key={`mob-${size}`}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        className={`kala-mobile-size-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => handleSelectMobileSize(size)}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* QUANTITY */}
              <div className="kala-mobile-qty-group">
                <span className="kala-section-label">QUANTITY</span>
                <div className="kala-mobile-qty-stepper-wrap">
                  <div className="kala-mobile-qty-stepper">
                    <button
                      type="button"
                      className="kala-mobile-qty-btn minus"
                      onClick={handleDecreaseMobileQty}
                      disabled={mobileQty <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="kala-mobile-qty-display">{mobileQty}</span>
                    <button
                      type="button"
                      className="kala-mobile-qty-btn plus"
                      onClick={handleIncreaseMobileQty}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Clean Summary Box */}
              <div className="kala-mobile-summary-card">
                <div className="kala-mobile-summary-row">
                  <span className="kala-mobile-summary-label">Total Quantity</span>
                  <span className="kala-mobile-summary-val">{totalQuantity} pcs</span>
                </div>
                <div className="kala-mobile-summary-row">
                  <span className="kala-mobile-summary-label">Total Price</span>
                  <span className="kala-mobile-summary-val kala-mobile-price-val">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Action Buttons: BUY NOW & ADD TO CART (Matches Image 1 reference, positioned right above Wishlist and Share) */}
          <div className="kala-details-main-actions" role="group" aria-label="Purchase actions">
            <button
              type="button"
              className="kala-main-action-btn kala-btn-buy-now"
              onClick={handleBuyNow}
              disabled={!product.available}
            >
              {product.available ? (totalQuantity > 1 ? `BUY NOW (${totalQuantity} PCS)` : 'BUY NOW') : 'OUT OF STOCK'}
            </button>
            <button
              type="button"
              className="kala-main-action-btn kala-btn-add-cart"
              onClick={handleAddToCart}
              disabled={!product.available}
            >
              {totalQuantity > 1 ? `ADD TO CART (${totalQuantity} PCS)` : 'ADD TO CART'}
            </button>
          </div>

          {/* Psychological Trust & Assurance Micro-Badges */}
          <div className="kala-details-trust-bar" aria-label="Purchase guarantees">
            <div className="kala-trust-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>100% Genuine Cotton</span>
            </div>
            <div className="kala-trust-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Dispatches in 24h</span>
            </div>
            <div className="kala-trust-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>7-Day Easy Exchange</span>
            </div>
          </div>

          {/* Feedback Notifications */}
          {addedNotification && (
            <div className="kala-notification-toast success animate-fadeIn" role="status">
              ✓ Added {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} to cart! (
              {AVAILABLE_SIZES.filter((s) => (sizeQuantities[s] || 0) > 0)
                .map((s) => `${s}: ${sizeQuantities[s]}`)
                .join(', ')}
              )
            </div>
          )}

          {/* Wishlist and Share Secondary Bar */}
          <div className="kala-details-secondary-bar kala-details-small-actions">
            <button
              type="button"
              className={`kala-secondary-action-btn kala-small-action-btn ${isWishlisted ? 'wishlisted active' : ''}`}
              onClick={() => toggleWishlist(product.id)}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? '#D94700' : 'none'} stroke={isWishlisted ? '#D94700' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
            </button>

            <button
              type="button"
              className={`kala-secondary-action-btn kala-small-action-btn ${shareFeedback ? 'copied' : ''}`}
              onClick={handleShare}
              aria-label="Share this product"
            >
              {shareFeedback ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              )}
              <span>{shareFeedback || 'Share'}</span>
            </button>
          </div>

          {/* Highlights List */}
          {highlights.length > 0 && (
            <div className="kala-details-highlights-section kala-product-highlights">
              <span className="kala-section-label">Product Features</span>
              <div className="kala-highlights-grid">
                {highlights.map((h, i) => (
                  <div key={i} className="kala-highlight-row kala-highlight-item">
                    <span className="kala-highlight-label">{h.label}</span>
                    <span className="kala-highlight-value">{h.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Similar Products Carousel Section (Below Highlights, Above Reviews) */}
      <SimilarProducts currentProduct={product} />

      {/* 4 & 5. VOICE OF KALA / Customer Product Reviews Section */}
      <ProductReviewsSection productId={product.id} />

      {/* Size Chart Modal (Matches Reference 1st Image) */}
      {isSizeChartOpen && (
        <div
          className="kala-size-chart-overlay"
          onClick={() => setIsSizeChartOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="size-chart-modal-title"
        >
          <div
            className="kala-size-chart-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="kala-size-chart-header">
              <h2 id="size-chart-modal-title" className="kala-size-chart-title">
                {product.name}
              </h2>
              <button
                type="button"
                className="kala-size-chart-close-btn"
                onClick={() => setIsSizeChartOpen(false)}
                aria-label="Close size chart"
              >
                ✕
              </button>
            </div>

            <div className="kala-size-chart-body">
              <div className="kala-size-chart-table-wrap">
                <table className="kala-size-chart-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Chest/Bust</th>
                      <th>Shoulder</th>
                      <th>Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_CHART_DATA.map((row) => {
                      const isHighlighted =
                        selectedMobileSize === row.size || (sizeQuantities[row.size] || 0) > 0
                      return (
                        <tr
                          key={row.size}
                          className={isHighlighted ? 'is-selected-size' : ''}
                        >
                          <td className="col-size">{row.size}</td>
                          <td>{row.chest}</td>
                          <td>{row.shoulder}</td>
                          <td>{row.length}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <p className="kala-size-chart-footer-note">
                * All measurements are in inches. Regular fit.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default ProductDetails
