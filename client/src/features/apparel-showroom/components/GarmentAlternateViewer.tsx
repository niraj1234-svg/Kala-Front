import React, { useState } from 'react'

export interface GarmentAlternateViewerProps {
  frontImage: string
  alternateImage?: string
  alt: string
  className?: string
}

export const GarmentAlternateViewer: React.FC<GarmentAlternateViewerProps> = ({
  frontImage,
  alternateImage,
  alt,
  className = '',
}) => {
  const [activeView, setActiveView] = useState<'front' | 'back'>('front')
  const hasAlternate = Boolean(alternateImage && alternateImage !== frontImage)

  const currentDisplayImage =
    activeView === 'back' && alternateImage ? alternateImage : frontImage

  return (
    <div className={`kala-alternate-viewer-wrapper ${className}`}>
      {/* Header View Indicator */}
      <div className="kala-alternate-header-row">
        <div className="kala-alternate-badge">
          <span className="kala-alternate-badge-dot" aria-hidden="true" />
          <span>STUDIO APPAREL INSPECTION</span>
        </div>

        {hasAlternate && (
          <div className="kala-alternate-toggle-group" role="tablist" aria-label="Garment angle view">
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'front'}
              className={`kala-alternate-tab-btn ${activeView === 'front' ? 'is-active' : ''}`}
              onClick={() => setActiveView('front')}
            >
              FRONT VIEW
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'back'}
              className={`kala-alternate-tab-btn ${activeView === 'back' ? 'is-active' : ''}`}
              onClick={() => setActiveView('back')}
            >
              BACK VIEW
            </button>
          </div>
        )}
      </div>

      {/* Main Image Stage */}
      <div className="kala-alternate-stage" role="region" aria-label={`${alt} - ${activeView} view`}>
        <img
          src={currentDisplayImage}
          alt={`${alt} - ${activeView} view`}
          className="kala-alternate-image"
          draggable={false}
        />
      </div>

      {/* Angle Caption */}
      <div className="kala-alternate-caption">
        <span>{hasAlternate ? `Viewing: ${activeView.toUpperCase()} ANGLE` : 'STUDIO ARCHIVAL VIEW'}</span>
      </div>
    </div>
  )
}

export default GarmentAlternateViewer
