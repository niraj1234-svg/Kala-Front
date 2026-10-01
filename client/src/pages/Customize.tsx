import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
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
    <main className="kala-customize-page min-h-[85vh] bg-[#FAF9F6] py-6 sm:py-10 text-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb & Page Title */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#E5E7EB]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#6B7280] mb-1">
              <Link to="/" className="hover:text-[#111111] transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link to="/custom-apparel" className="hover:text-[#111111] transition-colors">
                Custom Apparel
              </Link>
              <span>/</span>
              <span className="text-[#D94700] font-bold">Studio Customizer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111] font-mono">
              DESIGN YOUR APPAREL
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6B7280]">
              Starting from <strong className="text-[#D94700] text-sm">₹{unitPrice}</strong>
            </span>
          </div>
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div
            className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 flex items-center justify-between gap-2 animate-fadeIn"
            role="alert"
          >
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-bold">!</span>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              className="text-red-600 hover:text-red-800 font-bold"
              onClick={() => setErrorMessage(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* Two-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ====================================================================
              LEFT COLUMN: Live Apparel Preview Stage (Desktop: 7 cols)
              ==================================================================== */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <ApparelPreview
              apparelType={apparelType}
              view={currentPosition}
              color={color}
              artwork={artwork}
              transform={currentTransform}
              onChangeTransform={handleTransformChange}
            />

            {/* Quick Placement Bar directly beneath Preview */}
            <div className="bg-white p-3 rounded-xl border border-[#E5E7EB] shadow-sm flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-[#111111] uppercase tracking-wide">
                View Angle:
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {(['front', 'back', 'left', 'right'] as ViewPosition[]).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                      currentPosition === pos
                        ? 'bg-[#111111] text-white shadow-sm'
                        : 'bg-[#F3F4F6] text-[#4B5563] hover:text-[#111111] hover:bg-[#E5E7EB]'
                    }`}
                    onClick={() => setCurrentPosition(pos)}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ====================================================================
              RIGHT COLUMN: Simple Customization Controls (Desktop: 5 cols)
              ==================================================================== */}
          <div className="lg:col-span-5 flex flex-col gap-5">
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
            <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#6B7280]">Item Price</span>
                <span className="font-bold text-[#111111]">₹{unitPrice} / PC</span>
              </div>

              <button
                type="button"
                className="w-full py-3.5 px-6 rounded-xl bg-[#D94700] hover:bg-[#BF3E00] text-white font-bold text-sm tracking-wider uppercase transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
                onClick={handleContinueClick}
              >
                <span>CONTINUE</span>
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <div className="text-center text-[11px] text-[#6B7280]">
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="summary-title"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E7EB] relative animate-scaleUp">
            {/* Close Button */}
            <button
              type="button"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] flex items-center justify-center font-bold transition-colors"
              onClick={() => setShowSummaryModal(false)}
              aria-label="Close summary modal"
            >
              ✕
            </button>

            <h2 id="summary-title" className="text-lg font-bold text-[#111111] uppercase tracking-wide mb-1 font-mono">
              Design Summary
            </h2>
            <p className="text-xs text-[#6B7280] mb-4">
              Review your customized apparel specifications before proceeding to order.
            </p>

            {/* Design Spec Rows */}
            <div className="bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl p-4 space-y-2.5 mb-4 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#E5E7EB]">
                <span className="text-[#6B7280]">Apparel Type:</span>
                <strong className="text-[#111111] uppercase">{selectedApparelOption.name}</strong>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-[#E5E7EB]">
                <span className="text-[#6B7280]">Color:</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-[#CBD5E1]"
                    style={{ backgroundColor: color }}
                  />
                  <strong className="text-[#111111]">{colorName}</strong>
                </div>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-[#E5E7EB]">
                <span className="text-[#6B7280]">Print Position:</span>
                <strong className="text-[#D94700] uppercase font-mono">{currentPosition} Print</strong>
              </div>

              {artwork && (
                <div className="flex justify-between items-center pb-2 border-b border-[#E5E7EB]">
                  <span className="text-[#6B7280]">Artwork File:</span>
                  <div className="flex items-center gap-2 max-w-[200px] truncate">
                    <img
                      src={artwork.dataUrl}
                      alt="Artwork thumbnail"
                      className="w-5 h-5 rounded border border-[#CBD5E1] object-contain shrink-0"
                    />
                    <strong className="text-[#111111] truncate">{artwork.name}</strong>
                  </div>
                </div>
              )}

              {/* Size Selector in Summary */}
              <div className="pt-1">
                <span className="text-[#6B7280] block mb-1.5">Select Size:</span>
                <div className="flex items-center gap-1.5">
                  {SIZES.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                        selectedSize === sz
                          ? 'bg-[#111111] text-white'
                          : 'bg-white border border-[#D1D5DB] text-[#4B5563] hover:bg-[#F3F4F6]'
                      }`}
                      onClick={() => setSelectedSize(sz)}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector in Summary */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-[#6B7280]">Quantity:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="w-6 h-6 rounded border border-[#D1D5DB] bg-white text-xs font-bold hover:bg-[#F3F4F6]"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <span className="font-mono font-bold text-xs px-2">{quantity}</span>
                  <button
                    type="button"
                    className="w-6 h-6 rounded border border-[#D1D5DB] bg-white text-xs font-bold hover:bg-[#F3F4F6]"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Total Price */}
            <div className="flex items-center justify-between mb-5 px-1 font-mono">
              <span className="text-xs text-[#6B7280]">Total Estimation</span>
              <span className="text-lg font-extrabold text-[#D94700]">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                className="flex-1 py-3 px-4 rounded-xl border border-[#D1D5DB] bg-white hover:bg-[#F9FAFB] text-[#111111] text-xs font-bold uppercase transition-colors"
                onClick={() => handleConfirmAndProceed('cart')}
                disabled={isGeneratingPreview}
              >
                Add to Cart
              </button>

              <button
                type="button"
                className="flex-1 py-3 px-4 rounded-xl bg-[#D94700] hover:bg-[#BF3E00] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                onClick={() => handleConfirmAndProceed('checkout')}
                disabled={isGeneratingPreview}
              >
                {isGeneratingPreview ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
