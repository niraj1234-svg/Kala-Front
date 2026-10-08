import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import ApparelPreview from '../components/CustomApparel/ApparelPreview'
import ApparelSelector, { APPAREL_OPTIONS } from '../components/CustomApparel/ApparelSelector'
import ColorSelector from '../components/CustomApparel/ColorSelector'
import PlacementSelector from '../components/CustomApparel/PlacementSelector'
import DesignUploader, { type UploadedArtwork } from '../components/CustomApparel/DesignUploader'
import DesignControls, { type ArtworkTransform } from '../components/CustomApparel/DesignControls'
import { type ApparelType, type ViewPosition, PRINTABLE_AREAS } from '../components/CustomApparel/ApparelMockup'
import { generateProductionPreview } from '../utils/productionPreviewGenerator'
import '../styles/Customize.css'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

export const Customize: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { addToCart } = useCart()

  // State from location or sensible defaults
  const stateFromNav = location.state as {
    apparelType?: ApparelType
    color?: string
    colorName?: string
    artwork?: UploadedArtwork
    view?: ViewPosition
  } | undefined

  const [apparelType, setApparelType] = useState<ApparelType>(stateFromNav?.apparelType || 'tshirt')
  const [color, setColor] = useState<string>(stateFromNav?.color || '#18181B')
  const [colorName, setColorName] = useState<string>(stateFromNav?.colorName || 'Black')
  const [currentPosition, setCurrentPosition] = useState<ViewPosition>(stateFromNav?.view || 'front')
  const [artwork, setArtwork] = useState<UploadedArtwork | null>(stateFromNav?.artwork || null)

  // Per-view transform mapping so user can position artwork on front, back, etc.
  const [transforms, setTransforms] = useState<Record<ViewPosition, ArtworkTransform>>({
    front: { x: 50, y: 46, scale: 1.0, rotation: 0 },
    back: { x: 50, y: 45, scale: 1.0, rotation: 0 },
    left: { x: 50, y: 46, scale: 0.9, rotation: 0 },
    right: { x: 50, y: 46, scale: 0.9, rotation: 0 },
  })

  // Size & Quantity
  const [selectedSize, setSelectedSize] = useState<string>('L')
  const [quantity, setQuantity] = useState<number>(1)

  // Modals & Feedback
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const currentTransform = transforms[currentPosition]

  const handleTransformChange = (newTransform: ArtworkTransform) => {
    setTransforms((prev) => ({
      ...prev,
      [currentPosition]: newTransform,
    }))
  }

  const handleResetTransform = () => {
    const bounds = PRINTABLE_AREAS[apparelType][currentPosition]
    const centerX = +(bounds.x + bounds.width / 2).toFixed(1)
    const centerY = +(bounds.y + bounds.height / 2).toFixed(1)
    handleTransformChange({
      x: centerX,
      y: centerY,
      scale: 1.0,
      rotation: 0,
    })
  }

  // Active apparel pricing info
  const selectedApparelOption =
    APPAREL_OPTIONS.find((opt) => opt.id === apparelType) || APPAREL_OPTIONS[0]
  const unitPrice = selectedApparelOption.startingPrice
  const subtotal = unitPrice * quantity

  // Initiate confirmation
  const handleContinueClick = () => {
    if (!artwork) {
      setErrorMessage('Please upload your artwork before continuing to checkout.')
      return
    }
    setErrorMessage(null)
    setShowSummaryModal(true)
  }

  // Final confirmation: Generate high-resolution composite preview and add to cart
  const handleConfirmAndProceed = async (targetDestination: 'checkout' | 'cart' = 'checkout') => {
    if (!artwork) return
    setIsGeneratingPreview(true)

    try {
      // 1. Generate High-Resolution Composite Production Preview
      const productionPreviewUrl = await generateProductionPreview({
        apparelType,
        view: currentPosition,
        color,
        artworkDataUrl: artwork.dataUrl,
        transform: currentTransform,
        width: 1200,
        height: 1200,
      })

      // 2. Add to existing Cart with full customization structure
      const productId = `custom-${apparelType}`
      const productName = `KALA Custom ${selectedApparelOption.name}`

      addToCart(
        {
          id: productId,
          name: productName,
          image: productionPreviewUrl,
          price: unitPrice,
          color: colorName,
        },
        selectedSize,
        quantity,
        {
          apparelType,
          color: colorName,
          position: currentPosition,
          artworkUrl: artwork.dataUrl,
          previewUrl: productionPreviewUrl,
          artwork: {
            x: currentTransform.x,
            y: currentTransform.y,
            width: Math.round(200 * currentTransform.scale),
            height: Math.round(200 * currentTransform.scale),
            rotation: currentTransform.rotation,
            scale: currentTransform.scale,
          },
        }
      )

      setShowSummaryModal(false)

      // 3. Continue to existing checkout or cart flow
      if (targetDestination === 'checkout') {
        navigate('/checkout')
      } else {
        navigate('/cart')
      }
    } catch (err: any) {
      console.error('[Customize] Failed to generate production preview:', err)
      setErrorMessage('Failed to generate final design preview. Please try again.')
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  return (
    <main className="kala-customize-page">
      <div className="kala-customize-container">
        {/* Navigation Breadcrumb & Page Title */}
        <div className="kala-customize-header">
          <div className="kala-customize-header-left">

            <h1 className="kala-customize-title">
              DESIGN YOUR APPAREL
            </h1>
          </div>

          <div className="kala-customize-header-right">
            <div className="kala-customize-price-badge">
              <span>Starting from</span>
              <strong>₹{unitPrice}</strong>
            </div>
          </div>
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="kala-customize-error-banner" role="alert">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <strong>!</strong>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Two-Column Responsive Workspace */}
        <div className="kala-customize-workspace">
          {/* ====================================================================
              LEFT COLUMN: Live Apparel Preview Stage (Desktop: Sticky Stage)
              ==================================================================== */}
          <div className="kala-customize-stage-col">
            <ApparelPreview
              apparelType={apparelType}
              view={currentPosition}
              color={color}
              artwork={artwork}
              transform={currentTransform}
              onChangeTransform={handleTransformChange}
            />

            {/* Quick Placement Bar directly beneath Preview */}
            <div className="kala-customize-angle-bar">
              <div className="kala-customize-angle-label">
                View Angle:
              </div>
              <div className="kala-customize-angle-buttons">
                {(['front', 'back', 'left', 'right'] as ViewPosition[]).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    className={`kala-customize-angle-btn ${currentPosition === pos ? 'active' : ''}`}
                    onClick={() => setCurrentPosition(pos)}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ====================================================================
              RIGHT COLUMN: Simple Customization Controls
              ==================================================================== */}
          <div className="kala-customize-controls-col">
            {/* 1. Apparel Selector */}
            <ApparelSelector
              selectedApparel={apparelType}
              onSelectApparel={(type) => setApparelType(type)}
            />

            {/* 2. Color Selector */}
            <ColorSelector
              selectedColor={color}
              colorName={colorName}
              onSelectColor={(hex, name) => {
                setColor(hex)
                setColorName(name)
              }}
            />

            {/* 3. Placement Selector */}
            <PlacementSelector
              currentPosition={currentPosition}
              onSelectPosition={setCurrentPosition}
            />

            {/* 4. Design Uploader */}
            <DesignUploader
              artwork={artwork}
              onArtworkChange={(art) => {
                setArtwork(art)
                if (art) setErrorMessage(null)
              }}
            />

            {/* 5. Live Position & Size Adjustment (shown when artwork is uploaded) */}
            {artwork && (
              <DesignControls
                transform={currentTransform}
                onChangeTransform={handleTransformChange}
                onReset={handleResetTransform}
                onDelete={() => setArtwork(null)}
                onReplace={() => {
                  const input = document.querySelector('input[type="file"]') as HTMLInputElement | null
                  input?.click()
                }}
              />
            )}

            {/* 6. Main Action Shelf (Continue Button) */}
            <div className="kala-customize-action-card">
              <div className="kala-customize-action-price-row">
                <span className="kala-customize-action-price-label">Item Price</span>
                <span className="kala-customize-action-price-value">₹{unitPrice} / PC</span>
              </div>

              <button
                type="button"
                className="kala-customize-cta-btn"
                onClick={handleContinueClick}
              >
                <span>CONTINUE</span>
                <svg
                  style={{ width: '1rem', height: '1rem' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <div className="kala-customize-action-trust">
                Clean plain mockups • Free standard packaging • Fast Indian shipping
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          FINAL DESIGN CONFIRMATION MODAL (Requirement 9)
          ==================================================================== */}
      {showSummaryModal && (
        <div
          className="kala-customize-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="summary-title"
        >
          <div className="kala-customize-modal-card">
            {/* Close Button */}
            <button
              type="button"
              className="kala-customize-modal-close"
              onClick={() => setShowSummaryModal(false)}
              aria-label="Close summary modal"
            >
              ✕
            </button>

            <h2 id="summary-title" style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', fontFamily: 'var(--kala-font-mono, monospace)', color: 'var(--kala-black, #111111)' }}>
              Design Summary
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '1rem' }}>
              Review your customized apparel specifications before proceeding to order.
            </p>

            {/* Design Spec Rows */}
            <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Apparel Type:</span>
                <strong style={{ color: '#111111', textTransform: 'uppercase' }}>{selectedApparelOption.name}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Color:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span
                    style={{ width: '14px', height: '14px', borderRadius: '9999px', border: '1px solid #CBD5E1', backgroundColor: color, display: 'inline-block' }}
                  />
                  <strong style={{ color: '#111111' }}>{colorName}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Print Position:</span>
                <strong style={{ color: '#D94700', textTransform: 'uppercase', fontFamily: 'var(--kala-font-mono, monospace)' }}>{currentPosition} Print</strong>
              </div>

              {artwork && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid #E5E7EB' }}>
                  <span style={{ color: '#6B7280' }}>Artwork File:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '200px' }}>
                    <img
                      src={artwork.dataUrl}
                      alt="Artwork thumbnail"
                      style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #CBD5E1', objectFit: 'contain' }}
                    />
                    <strong style={{ color: '#111111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{artwork.name}</strong>
                  </div>
                </div>
              )}

              {/* Size Selector in Summary */}
              <div style={{ paddingTop: '0.25rem' }}>
                <span style={{ color: '#6B7280', display: 'block', marginBottom: '0.4rem' }}>Select Size:</span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {SIZES.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      style={{
                        flex: 1,
                        padding: '0.4rem 0',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        fontFamily: 'var(--kala-font-mono, monospace)',
                        cursor: 'pointer',
                        border: selectedSize === sz ? '1px solid #111111' : '1px solid #D1D5DB',
                        background: selectedSize === sz ? '#111111' : '#FFFFFF',
                        color: selectedSize === sz ? '#FFFFFF' : '#4B5563',
                        transition: 'all 0.15s ease',
                      }}
                      onClick={() => setSelectedSize(sz)}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector in Summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
                <span style={{ color: '#6B7280' }}>Quantity:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #D1D5DB', background: '#FFFFFF', cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <span style={{ fontFamily: 'var(--kala-font-mono, monospace)', fontWeight: 800, padding: '0 0.5rem' }}>{quantity}</span>
                  <button
                    type="button"
                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #D1D5DB', background: '#FFFFFF', cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Total Price */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontFamily: 'var(--kala-font-mono, monospace)' }}>
              <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Total Estimation</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#D94700' }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  minWidth: '120px',
                  padding: '0.8rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #D1D5DB',
                  background: '#FFFFFF',
                  color: '#111111',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onClick={() => handleConfirmAndProceed('cart')}
                disabled={isGeneratingPreview}
              >
                Add to Cart
              </button>

              <button
                type="button"
                style={{
                  flex: 1,
                  minWidth: '140px',
                  padding: '0.8rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#D94700',
                  color: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  cursor: isGeneratingPreview ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(217, 71, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  opacity: isGeneratingPreview ? 0.6 : 1,
                }}
                onClick={() => handleConfirmAndProceed('checkout')}
                disabled={isGeneratingPreview}
              >
                {isGeneratingPreview ? (
                  <>
                    <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #FFFFFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span>Preparing Design...</span>
                  </>
                ) : (
                  <span>Proceed to Checkout</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Customize
