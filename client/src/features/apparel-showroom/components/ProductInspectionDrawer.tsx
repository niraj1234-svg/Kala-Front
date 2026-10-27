import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../../context/CartContext'
import { flyToCart } from '../../../utils/cartAnimation'
import type { ShowroomGarment, ConfiguredShowroomProduct } from '../types/showroom'
import Garment360Viewer from './Garment360Viewer'
import GarmentAlternateViewer from './GarmentAlternateViewer'

export interface ProductInspectionDrawerProps {
  isOpen: boolean
  garment: ShowroomGarment | null
  selectedVariantId?: string
  selectedSize?: string | null
  onClose: () => void
  onSelectVariant: (garmentId: string, variantId: string) => void
  onSelectSize: (size: string) => void
  prefersReducedMotion?: boolean
}

export const ProductInspectionDrawer: React.FC<ProductInspectionDrawerProps> = ({
  isOpen,
  garment,
  selectedVariantId,
  selectedSize,
  onClose,
  onSelectVariant,
  onSelectSize,
}) => {
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [quantity, setQuantity] = useState<number>(1)
  const [customText, setCustomText] = useState<string>('')
  const [selectedPosition, setSelectedPosition] = useState<string>('front')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [addedToCartSuccess, setAddedToCartSuccess] = useState<boolean>(false)
  const [activeViewerMode, setActiveViewerMode] = useState<'360' | 'still'>('360')

  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previewCardRef = useRef<HTMLDivElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  // Track trigger focus element & manage body scroll
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'

      // Focus close button on mount
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 50)

      return () => {
        clearTimeout(timer)
        document.body.style.overflow = ''
        if (previousActiveElementRef.current?.focus) {
          previousActiveElementRef.current.focus()
        }
      }
    }
  }, [isOpen])

  // Handle Escape key and focus trapping
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }

      // Focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Determine active color variant
  const activeVariant =
    garment?.colorVariants?.find((v) => v.id === selectedVariantId) ||
    garment?.colorVariants?.[0] ||
    null

  const has360Frames = Boolean(
    garment?.turntableFrames && garment.turntableFrames.length > 0
  )

  const maxCustomText = garment?.customization?.maxTextLength || 16
  const activeSizeObj = garment?.sizes?.find((s) => s.size === selectedSize)

  // Pricing & Configuration calculation
  const basePrice = garment?.price || 0
  const hasPersonalization = Boolean(customText.trim())
  const surcharge =
    hasPersonalization && garment?.customization?.additionalPrice
      ? garment.customization.additionalPrice
      : 0
  const finalUnitPrice = basePrice + surcharge
  const finalLineTotal = finalUnitPrice * quantity

  // Unified configured product representation
  const configuredProduct: ConfiguredShowroomProduct | null = useMemo(() => {
    if (!garment || !activeVariant) return null
    return {
      productId: garment.id,
      productName: garment.name,
      variantId: activeVariant.id,
      variantName: activeVariant.name,
      size: selectedSize || '',
      quantity,
      customizationPlacement: selectedPosition,
      personalizationText: customText.trim() || undefined,
      unitBasePrice: basePrice,
      customizationSurcharge: surcharge,
      finalUnitPrice,
      finalLineTotal,
      currency: garment.currency || 'INR',
      image: activeVariant.garmentImage || garment.primaryImage,
    }
  }, [
    garment,
    activeVariant,
    selectedSize,
    quantity,
    selectedPosition,
    customText,
    basePrice,
    surcharge,
    finalUnitPrice,
    finalLineTotal,
  ])

  // Strict Validation
  const validateConfiguration = (): boolean => {
    if (!garment) return false
    if (!selectedSize) {
      setValidationError('Please select an available size before continuing.')
      return false
    }
    const sizeObj = garment.sizes.find((s) => s.size === selectedSize)
    if (!sizeObj || !sizeObj.inStock) {
      setValidationError(`Size ${selectedSize} is currently unavailable. Please select another size.`)
      return false
    }
    if (customText.length > maxCustomText) {
      setValidationError(`Personalization exceeds maximum limit of ${maxCustomText} characters.`)
      return false
    }
    setValidationError(null)
    return true
  }

  const handleSizeSelect = (sz: string) => {
    onSelectSize(sz)
    setValidationError(null)
  }

  const handleCustomTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomText(e.target.value)
    if (validationError) setValidationError(null)
  }

  // Cart & Ordering integration
  const handleAddToCart = (destination?: 'cart' | 'checkout') => {
    if (!validateConfiguration() || !configuredProduct) return

    const cartProduct = {
      id: configuredProduct.productId,
      name: configuredProduct.productName,
      image: configuredProduct.image,
      price: configuredProduct.unitBasePrice,
      color: configuredProduct.variantName,
    }

    const customizationPayload =
      hasPersonalization || selectedPosition
        ? {
            position: configuredProduct.customizationPlacement,
            color: configuredProduct.variantName,
            price: configuredProduct.customizationSurcharge,
            frontText: selectedPosition === 'back' ? undefined : configuredProduct.personalizationText,
            backText: selectedPosition === 'back' ? configuredProduct.personalizationText : undefined,
            requirementDetails: hasPersonalization
              ? `Placement: ${selectedPosition.toUpperCase()}, Custom Text: "${configuredProduct.personalizationText}"`
              : undefined,
          }
        : undefined

    // Add to authoritative global CartContext
    addToCart(cartProduct, configuredProduct.size, configuredProduct.quantity, customizationPayload)

    // Trigger visual curved fly animation to Cart icon in Navbar
    flyToCart({
      sourceElement: previewCardRef.current,
      imageSrc: cartProduct.image,
      productName: configuredProduct.productName,
    })

    if (destination === 'checkout') {
      onClose()
      navigate('/checkout')
    } else if (destination === 'cart') {
      onClose()
      navigate('/cart')
    } else {
      setAddedToCartSuccess(true)
    }
  }

  // Atelier Custom Apparel Studio Handoff
  const handleHandoffToCustomStudio = () => {
    if (!garment) return
    const apparelType = garment.id.includes('hoodie')
      ? 'hoodie'
      : garment.id.includes('polo')
      ? 'polo'
      : 'tshirt'

    onClose()
    navigate('/customize', {
      state: {
        apparelType,
        color: activeVariant?.hex,
        colorName: activeVariant?.name,
        view: selectedPosition === 'back' ? 'back' : 'front',
      },
    })
  }

  if (!isOpen || !garment) return null

  return (
    <div
      className="kala-inspection-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      aria-hidden={!isOpen}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inspection-garment-title"
        className="kala-inspection-dialog"
      >
        {/* Top Dialog Action Bar */}
        <div className="kala-inspection-top-bar">
          <div className="kala-inspection-brand-kicker">
            <span className="kala-inspection-kicker-dot" aria-hidden="true" />
            <span>KALA ATELIER SPECIFICATION SHEET</span>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="kala-inspection-close-btn"
            onClick={onClose}
            aria-label="Close product inspection sheet"
            title="Close (Esc)"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span className="kala-close-text">CLOSE</span>
          </button>
        </div>

        {/* Split Two-Column Stage */}
        <div className="kala-inspection-grid">
          {/* COLUMN 1: VISUAL INSPECTION STAGE */}
          <div className="kala-inspection-visual-column">
            {/* View Mode Switcher for garments supporting 360 */}
            {has360Frames && (
              <div className="kala-inspection-mode-tabs" role="tablist" aria-label="Viewer modes">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeViewerMode === '360'}
                  className={`kala-inspection-tab ${activeViewerMode === '360' ? 'is-active' : ''}`}
                  onClick={() => setActiveViewerMode('360')}
                >
                  360° TURNTABLE
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeViewerMode === 'still'}
                  className={`kala-inspection-tab ${activeViewerMode === 'still' ? 'is-active' : ''}`}
                  onClick={() => setActiveViewerMode('still')}
                >
                  STUDIO ARCHIVE VIEW
                </button>
              </div>
            )}

            {/* Viewer Stage */}
            <div ref={previewCardRef} className="kala-inspection-stage-card">
              {has360Frames && activeViewerMode === '360' ? (
                <Garment360Viewer
                  frames={garment.turntableFrames}
                  fallbackImage={activeVariant?.garmentImage || garment.primaryImage}
                  alt={garment.name}
                />
              ) : (
                <GarmentAlternateViewer
                  frontImage={activeVariant?.garmentImage || garment.primaryImage}
                  alternateImage={activeVariant?.alternateImage}
                  alt={garment.name}
                />
              )}
            </div>

            {/* Atelier Studio Handoff Banner */}
            <div className="kala-inspection-studio-card">
              <div className="studio-card-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <div className="studio-card-text">
                <strong>Need custom graphics or bulk team orders?</strong>
                <span>Open in the KALA Custom Studio for full graphic positioning and zero design fees.</span>
              </div>
              <button
                type="button"
                className="kala-inspection-studio-btn"
                onClick={handleHandoffToCustomStudio}
                title="Open in KALA Custom Studio"
              >
                <span>OPEN STUDIO</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* COLUMN 2: ATELIER SPECIFICATIONS & CONFIGURATION */}
          <div className="kala-inspection-details-column">
            {/* Header / Meta */}
            <div className="kala-inspection-meta-block">
              <span className="kala-inspection-badge">
                {garment.badge || garment.category}
              </span>
              <h1 id="inspection-garment-title" className="kala-inspection-title">
                {garment.name}
              </h1>
              {garment.tagline && (
                <p className="kala-inspection-tagline">{garment.tagline}</p>
              )}
              <div className="kala-inspection-price-row">
                <span className="kala-inspection-price">
                  ₹{garment.price.toLocaleString('en-IN')}
                </span>
                <span className="kala-inspection-tax-note">
                  Inclusive of all taxes &amp; Atelier standard shipping
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="kala-inspection-description">{garment.description}</p>

            {/* 1. Verified Specifications */}
            {garment.specifications && (
              <div className="kala-inspection-specs-section">
                <h2 className="kala-inspection-section-label">CRAFTSMANSHIP SPECIFICATIONS</h2>
                <div className="kala-inspection-specs-grid">
                  <div className="kala-inspection-spec-item">
                    <span className="spec-label">FABRIC</span>
                    <span className="spec-value">{garment.specifications.fabric}</span>
                  </div>
                  {garment.specifications.gsm && (
                    <div className="kala-inspection-spec-item">
                      <span className="spec-label">WEIGHT</span>
                      <span className="spec-value">{garment.specifications.gsm} GSM Heavyweight</span>
                    </div>
                  )}
                  <div className="kala-inspection-spec-item">
                    <span className="spec-label">FIT PROFILE</span>
                    <span className="spec-value">{garment.specifications.fit}</span>
                  </div>
                  {garment.specifications.origin && (
                    <div className="kala-inspection-spec-item">
                      <span className="spec-label">ATELIER ORIGIN</span>
                      <span className="spec-value">{garment.specifications.origin}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Colorways */}
            <div className="kala-inspection-variants-section">
              <div className="kala-inspection-section-header">
                <h2 className="kala-inspection-section-label">CURATED COLOURWAY</h2>
                <span className="kala-inspection-selected-color-name">
                  {activeVariant?.name || 'Selected'}
                </span>
              </div>
              <div className="kala-inspection-swatches" role="radiogroup" aria-label="Available colorways">
                {garment.colorVariants.map((variant) => {
                  const isVariantActive = activeVariant?.id === variant.id
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      role="radio"
                      aria-checked={isVariantActive}
                      className={`kala-inspection-swatch ${isVariantActive ? 'is-active' : ''}`}
                      style={{ backgroundColor: variant.hex }}
                      onClick={() => onSelectVariant(garment.id, variant.id)}
                      title={`Select ${variant.name}`}
                      aria-label={variant.ariaLabel || variant.name}
                    />
                  )
                })}
              </div>
            </div>

            {/* 3. Sizing Matrix */}
            {garment.sizes.length > 0 && (
              <div className="kala-inspection-sizes-section">
                <div className="kala-inspection-section-header">
                  <h2 className="kala-inspection-section-label">SIZE SELECTION</h2>
                  {activeSizeObj?.measurementsSummary && (
                    <span className="kala-inspection-size-measurements">
                      {activeSizeObj.measurementsSummary}
                    </span>
                  )}
                </div>
                <div className="kala-inspection-sizes-grid" role="radiogroup" aria-label="Available garment sizes">
                  {garment.sizes.map((s) => {
                    const isSizeSelected = selectedSize === s.size
                    return (
                      <button
                        key={s.size}
                        type="button"
                        role="radio"
                        aria-checked={isSizeSelected}
                        disabled={!s.inStock}
                        className={`kala-inspection-size-btn ${isSizeSelected ? 'is-active' : ''} ${!s.inStock ? 'is-out-of-stock' : ''}`}
                        onClick={() => handleSizeSelect(s.size)}
                        aria-label={`Size ${s.label}${!s.inStock ? ' - Out of Stock' : ''}`}
                        title={!s.inStock ? 'Out of Stock' : `Select Size ${s.size}`}
                      >
                        {s.size}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 4. Customisation Atelier */}
            {garment.customization?.allowed && (
              <div className="kala-inspection-custom-section">
                <div className="kala-inspection-section-header">
                  <h2 className="kala-inspection-section-label">ATELIER CUSTOMISATION</h2>
                  {garment.customization.additionalPrice && (
                    <span className="kala-inspection-surcharge-badge">
                      +₹{garment.customization.additionalPrice} Surcharge
                    </span>
                  )}
                </div>

                {garment.customization.description && (
                  <p className="kala-inspection-custom-desc">
                    {garment.customization.description}
                  </p>
                )}

                {/* Print Placement */}
                {garment.customization.allowedPositions && (
                  <div className="kala-inspection-placement-row">
                    <span className="placement-label">Placement:</span>
                    <div className="placement-options">
                      {garment.customization.allowedPositions.map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          className={`kala-placement-pill ${selectedPosition === pos ? 'is-selected' : ''}`}
                          onClick={() => setSelectedPosition(pos)}
                        >
                          {pos.replace('-', ' ').toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Text Personalisation Input */}
                <div className="kala-inspection-input-wrap">
                  <label htmlFor="custom-personalization-input" className="input-label">
                    Personalized Name / Coordinates / Monogram:
                  </label>
                  <div className="input-box">
                    <input
                      id="custom-personalization-input"
                      type="text"
                      maxLength={maxCustomText}
                      value={customText}
                      onChange={handleCustomTextChange}
                      placeholder="e.g. KALA // 001"
                      className="kala-inspection-text-input"
                    />
                    <span className="char-counter">
                      {customText.length}/{maxCustomText}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Quantity & Pricing Calculation Bar */}
            <div className="kala-inspection-pricing-card">
              <div className="pricing-quantity-row">
                <span className="pricing-qty-label">Quantity:</span>
                <div className="pricing-stepper">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="stepper-val" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    aria-label="Increase quantity"
                    disabled={quantity >= 10}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="pricing-breakdown-row">
                <div className="breakdown-item">
                  <span className="breakdown-label">Unit Price:</span>
                  <span className="breakdown-val">₹{finalUnitPrice.toLocaleString('en-IN')}</span>
                </div>
                {surcharge > 0 && (
                  <div className="breakdown-item surcharge">
                    <span className="breakdown-label">Incl. Custom:</span>
                    <span className="breakdown-val">+₹{surcharge}</span>
                  </div>
                )}
                <div className="breakdown-item total">
                  <span className="breakdown-label">Line Total:</span>
                  <strong className="breakdown-total-val">₹{finalLineTotal.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            {/* Inline Validation Alert */}
            {validationError && (
              <div className="kala-inspection-error-banner" role="alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{validationError}</span>
              </div>
            )}

            {/* Inline Cart Confirmation Feedback */}
            {addedToCartSuccess && (
              <div className="kala-inspection-success-card" role="status" aria-live="polite">
                <div className="success-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Added {quantity} × {garment.name} ({selectedSize}) to Bag!</span>
                </div>
                <div className="success-actions">
                  <button
                    type="button"
                    className="success-btn-view"
                    onClick={() => {
                      onClose()
                      navigate('/cart')
                    }}
                  >
                    View Bag
                  </button>
                  <button
                    type="button"
                    className="success-btn-checkout"
                    onClick={() => {
                      onClose()
                      navigate('/checkout')
                    }}
                  >
                    Checkout Now
                  </button>
                </div>
              </div>
            )}

            {/* 6. Purchase & Cart Handoff Action Footer */}
            <div className="kala-inspection-action-footer">
              <div className="action-button-row">
                <button
                  type="button"
                  className="kala-inspection-add-cart-btn"
                  onClick={() => handleAddToCart()}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <span>ADD TO BAG • ₹{finalLineTotal.toLocaleString('en-IN')}</span>
                </button>

                <button
                  type="button"
                  className="kala-inspection-buy-now-btn"
                  onClick={() => handleAddToCart('checkout')}
                >
                  <span>BUY NOW</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              <button
                type="button"
                className="kala-inspection-return-btn"
                onClick={onClose}
              >
                Return to Showroom Rail
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductInspectionDrawer
