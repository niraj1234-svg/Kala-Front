import React from 'react'
import { SHOWROOM_SAMPLE_GARMENTS } from '../data/showroomFixtures'
import { useShowroomState } from '../hooks/useShowroomState'
import ClothingRail from './ClothingRail'
import ProductInspectionDrawer from './ProductInspectionDrawer'
import '../styles/showroom.tokens.css'

export interface ShowroomContainerProps {
  className?: string
  initialGarmentId?: string
}

/**
 * ShowroomContainer Component — Stage 4
 * 
 * Master architectural stage for the physical KALA apparel showroom.
 * - Warm white / light grey studio wall ambience.
 * - Realistic horizontal metal clothing rail.
 * - Interactive garment selection and colorway preview strip.
 * - Explicit "INSPECT & 360° VIEW" trigger.
 * - ProductInspectionDrawer modal with genuine 360° turntable & atelier specs.
 */
export const ShowroomContainer: React.FC<ShowroomContainerProps> = ({
  className = '',
  initialGarmentId,
}) => {
  const {
    state,
    actions,
    activeGarment,
    activeVariant,
    handleKeyboardNavigation,
  } = useShowroomState({
    garments: SHOWROOM_SAMPLE_GARMENTS,
    initialGarmentId,
  })

  return (
    <div
      className={`kala-showroom-root ${className}`}
      onKeyDown={handleKeyboardNavigation}
      tabIndex={-1}
    >
      {/* 1. ARCHITECTURAL SHOWROOM HEADER */}
      <header className="kala-showroom-header">
        <div className="kala-showroom-kicker">
          <span className="kala-showroom-kicker-dot" aria-hidden="true" />
          <span>KALA ATELIER // PHYSICAL SHOWROOM</span>
        </div>

        <h1 className="kala-showroom-main-title">
          Curated <span className="kala-showroom-title-accent">Silhouettes</span>
        </h1>

        <p className="kala-showroom-instruction">
          Select any garment along the horizontal rail to explore cut, drape, and colorways.
        </p>
      </header>

      {/* 2. THE PHYSICAL CLOTHING RAIL STAGE */}
      <main className="kala-showroom-stage">
        <ClothingRail
          garments={SHOWROOM_SAMPLE_GARMENTS}
          selectedGarmentId={state.selectedGarmentId}
          selectedVariantByGarment={state.selectedVariantByGarment}
          onSelectGarment={actions.selectGarment}
          onOpenInspect={actions.openDetailPanel}
          prefersReducedMotion={state.prefersReducedMotion}
        />
      </main>

      {/* 3. ACTIVE GARMENT CONTEXTUAL FOOTER DOCK */}
      {activeGarment && (
        <footer
          className="kala-showroom-dock"
          aria-label="Active garment details"
        >
          <div className="kala-showroom-dock-inner">
            {/* Left: Garment info */}
            <div className="kala-showroom-dock-info">
              <span className="kala-showroom-dock-badge">
                {activeGarment.badge || activeGarment.category}
              </span>
              <h2 className="kala-showroom-dock-name">{activeGarment.name}</h2>
              <span className="kala-showroom-dock-price">
                ₹{activeGarment.price.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Center: Color swatches for selected garment */}
            {activeGarment.colorVariants.length > 0 && (
              <div
                className="kala-showroom-dock-colors"
                role="radiogroup"
                aria-label={`Color variants for ${activeGarment.name}`}
              >
                <span className="kala-showroom-dock-colors-label">
                  Colourway: <strong>{activeVariant?.name || 'Default'}</strong>
                </span>
                <div className="kala-showroom-swatches-row">
                  {activeGarment.colorVariants.map((variant) => {
                    const isVariantActive = activeVariant?.id === variant.id
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        role="radio"
                        aria-checked={isVariantActive}
                        className={`kala-showroom-color-swatch ${
                          isVariantActive ? 'is-active' : ''
                        }`}
                        style={{ backgroundColor: variant.hex }}
                        onClick={() =>
                          actions.selectVariant(activeGarment.id, variant.id)
                        }
                        title={variant.name}
                        aria-label={variant.ariaLabel || variant.name}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Right: Explicit Inspect & 360 Action + Keyboard Hints */}
            <div className="kala-showroom-dock-actions">
              <button
                type="button"
                className="kala-showroom-dock-inspect-btn"
                onClick={actions.openDetailPanel}
                aria-haspopup="dialog"
                aria-expanded={state.isDetailPanelOpen}
                title={`Inspect ${activeGarment.name} specifications & 360° view`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
                <span>
                  {activeGarment.turntableFrames
                    ? 'INSPECT & 360° VIEW'
                    : 'INSPECT SILHOUETTE'}
                </span>
              </button>

              <div className="kala-showroom-dock-hints" aria-hidden="true">
                <span className="kala-showroom-hint-key">←</span>
                <span className="kala-showroom-hint-key">→</span>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* 4. PRODUCT INSPECTION DRAWER MODAL */}
      <ProductInspectionDrawer
        isOpen={state.isDetailPanelOpen}
        garment={activeGarment}
        selectedVariantId={
          activeGarment
            ? state.selectedVariantByGarment[activeGarment.id]
            : undefined
        }
        selectedSize={state.selectedSize}
        onClose={actions.closeDetailPanel}
        onSelectVariant={actions.selectVariant}
        onSelectSize={actions.selectSize}
        prefersReducedMotion={state.prefersReducedMotion}
      />

      {/* 5. ARCHITECTURAL FLOOR SHADOW PLANE */}
      <div className="kala-showroom-floor-plane" aria-hidden="true" />
    </div>
  )
}

export default ShowroomContainer
