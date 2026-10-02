import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  type ApparelId,
  type ApparelColor,
  type ApparelSide,
  type ApparelCustomizationState,
  type SizeKey,
  type SizeQuantities,
  type UploadedApparelImage,
} from './types'
import { APPAREL_CONFIGS, DEFAULT_EMBLEM_URL } from './mockupAssets'
import ApparelPreview from './ApparelPreview'
import ApparelSelector from './ApparelSelector'
import ColorSelector from './ColorSelector'
import DesignUploader from './DesignUploader'
import DesignAdjuster from './DesignAdjuster'
import QuantitySelector, { PRESET_DISTRIBUTIONS } from './QuantitySelector'
import RequirementDetails from './RequirementDetails'
import AccountShortcut from './AccountShortcut'
import DiscussionOptions from './DiscussionOptions'
import './BulkApparelBuilder.css'

export const BulkApparelBuilder: React.FC = () => {
  // 1. Core Selection State
  const [selectedApparel, setSelectedApparel] = useState<ApparelId>('tshirt')
  const [selectedColor, setSelectedColor] = useState<ApparelColor>('black')
  const [selectedSide, setSelectedSide] = useState<ApparelSide>('front')
  const [sizeQuantities, setSizeQuantities] = useState<SizeQuantities>({
    S: 10,
    M: 35,
    L: 35,
    XL: 15,
    XXL: 5,
  })
  const [requirement, setRequirement] = useState<string>('')
  const [uploadedApparel, setUploadedApparel] = useState<UploadedApparelImage | null>(null)

  // 2. Independent Customization State per apparel & side
  const [customizationState, setCustomizationState] = useState<ApparelCustomizationState>({
    tshirt: {
      front: {
        artworkUrl: DEFAULT_EMBLEM_URL,
        artworkName: 'Default KALA Emblem',
        artworkType: 'image/svg+xml',
        x: 50,
        y: 46,
        size: 80,
      },
      back: {
        artworkUrl: DEFAULT_EMBLEM_URL,
        artworkName: 'Default KALA Emblem',
        artworkType: 'image/svg+xml',
        x: 50,
        y: 44,
        size: 80,
      },
    },
    hoodie: {
      front: {
        artworkUrl: DEFAULT_EMBLEM_URL,
        artworkName: 'Default KALA Emblem',
        artworkType: 'image/svg+xml',
        x: 50,
        y: 48,
        size: 80,
      },
      back: {
        artworkUrl: DEFAULT_EMBLEM_URL,
        artworkName: 'Default KALA Emblem',
        artworkType: 'image/svg+xml',
        x: 50,
        y: 44,
        size: 80,
      },
    },
    jersey: {
      front: {
        artworkUrl: DEFAULT_EMBLEM_URL,
        artworkName: 'Default KALA Emblem',
        artworkType: 'image/svg+xml',
        x: 50,
        y: 46,
        size: 80,
      },
      back: {
        artworkUrl: DEFAULT_EMBLEM_URL,
        artworkName: 'Default KALA Emblem',
        artworkType: 'image/svg+xml',
        x: 50,
        y: 44,
        size: 80,
      },
    },
  })

  // 3. Status & Notification State
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const currentConfig = APPAREL_CONFIGS[selectedApparel]
  const currentSideData = customizationState[selectedApparel][selectedSide]

  // Mathematical Summation of Pieces Across All Sizes
  const totalQuantity = Math.max(
    1,
    (sizeQuantities.S || 0) +
      (sizeQuantities.M || 0) +
      (sizeQuantities.L || 0) +
      (sizeQuantities.XL || 0) +
      (sizeQuantities.XXL || 0)
  )

  const sizeBreakdownText = (['S', 'M', 'L', 'XL', 'XXL'] as SizeKey[])
    .filter((sz) => (sizeQuantities[sz] || 0) > 0)
    .map((sz) => `${sz}: ${sizeQuantities[sz]}`)
    .join(', ')

  const estimatedUnitPrice = currentConfig.startingPrice
  const estimatedTotal = estimatedUnitPrice * totalQuantity

  const handleUpdateSizeQuantity = (size: SizeKey, qty: number) => {
    setSizeQuantities((prev) => ({
      ...prev,
      [size]: Math.max(0, qty),
    }))
  }

  const handleBulkPresetApply = (presetTotal: number) => {
    if (PRESET_DISTRIBUTIONS[presetTotal]) {
      setSizeQuantities(PRESET_DISTRIBUTIONS[presetTotal])
    } else {
      const s = Math.round(presetTotal * 0.1)
      const m = Math.round(presetTotal * 0.35)
      const l = Math.round(presetTotal * 0.35)
      const xl = Math.round(presetTotal * 0.15)
      const xxl = Math.max(0, presetTotal - (s + m + l + xl))
      setSizeQuantities({ S: s, M: m, L: l, XL: xl, XXL: xxl })
    }
  }

  // Update position of active design
  const handleUpdatePosition = (x: number, y: number) => {
    setCustomizationState((prev) => ({
      ...prev,
      [selectedApparel]: {
        ...prev[selectedApparel],
        [selectedSide]: {
          ...prev[selectedApparel][selectedSide],
          x,
          y,
        },
      },
    }))
  }

  // Update size of active design
  const handleUpdateSize = (size: number) => {
    setCustomizationState((prev) => ({
      ...prev,
      [selectedApparel]: {
        ...prev[selectedApparel],
        [selectedSide]: {
          ...prev[selectedApparel][selectedSide],
          size,
        },
      },
    }))
  }

  // Handle uploaded artwork file
  const handleUploadArtwork = (dataUrl: string, fileName: string, fileType: string) => {
    setCustomizationState((prev) => ({
      ...prev,
      [selectedApparel]: {
        ...prev[selectedApparel],
        [selectedSide]: {
          ...prev[selectedApparel][selectedSide],
          artworkUrl: dataUrl,
          artworkName: fileName,
          artworkType: fileType,
        },
      },
    }))
    setNotification({
      type: 'success',
      message: `Artwork "${fileName}" successfully applied to ${currentConfig.name} (${selectedSide.toUpperCase()})!`,
    })
    setTimeout(() => setNotification(null), 3500)
  }

  // Handle customer's own apparel upload
  const handleUploadApparel = (apparel: UploadedApparelImage) => {
    setUploadedApparel({
      ...apparel,
      uploadedSide: selectedSide,
    })
    setNotification({
      type: 'success',
      message: `Your apparel "${apparel.fileName}" applied to live preview!`,
    })
    setTimeout(() => setNotification(null), 3500)
  }

  // Handle remove customer's uploaded apparel
  const handleRemoveApparel = () => {
    setUploadedApparel(null)
    setNotification({
      type: 'success',
      message: 'Reverted to default KALA apparel mockup.',
    })
    setTimeout(() => setNotification(null), 3500)
  }

  // Reset to default demo graphic
  const handleResetDefault = () => {
    setCustomizationState((prev) => ({
      ...prev,
      [selectedApparel]: {
        ...prev[selectedApparel],
        [selectedSide]: {
          ...prev[selectedApparel][selectedSide],
          artworkUrl: DEFAULT_EMBLEM_URL,
          artworkName: 'Default KALA Emblem',
          artworkType: 'image/svg+xml',
          size: 80,
        },
      },
    }))
  }

  return (
    <section className="kala-bulk-section" id="bulk-apparel-builder" aria-label="Create Custom Apparel for Bulk Orders">
      <div className="kala-bulk-container">
        {/* ====================================================================
            PAGE HEADER (Compact, with Back to Shop and Trust Badges)
            ==================================================================== */}
        <header className="kala-dedicated-page-header">
          <div className="kala-dedicated-top-nav">
            <Link to="/shop" className="kala-back-to-shop-btn">
              <span aria-hidden="true">←</span>
              <span>BACK TO SHOP</span>
            </Link>
          </div>

          <div className="kala-dedicated-title-wrap">
            <h1 className="kala-dedicated-main-title">
              CREATE CUSTOM APPAREL
            </h1>
            <p className="kala-dedicated-subtitle">
              Custom apparel for companies, colleges, events, gyms and sports teams.
            </p>
          </div>

          <div className="kala-dedicated-trust-row" aria-label="KALA Custom Apparel Highlights">
            <span className="kala-dedicated-trust-item">
              <span className="dot">●</span>
              <span>Premium Quality</span>
            </span>
            <span className="kala-dedicated-trust-item">
              <span className="dot">●</span>
              <span>Bulk Orders</span>
            </span>
            <span className="kala-dedicated-trust-item">
              <span className="dot">●</span>
              <span>Trusted by Teams</span>
            </span>
          </div>
        </header>

        {/* Global Notification Feedback */}
        {notification && (
          <div className={`kala-bulk-toast ${notification.type}`} role="status">
            <span>{notification.message}</span>
            <button
              type="button"
              className="kala-bulk-toast-close"
              onClick={() => setNotification(null)}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        )}

        {/* ====================================================================
            TWO-COLUMN BUILDER CONTAINER (Large Rounded Bordered Box)
            ==================================================================== */}
        <div className="kala-bulk-builder-card">
          {/* LEFT COLUMN: Live Product Preview (~40% Desktop) */}
          <div className="kala-bulk-col-left">
            <ApparelPreview
              selectedApparel={selectedApparel}
              selectedColor={selectedColor}
              selectedSide={selectedSide}
              customizationState={customizationState}
              uploadedApparel={uploadedApparel}
              onSelectApparel={setSelectedApparel}
              onSelectColor={setSelectedColor}
              onSelectSide={setSelectedSide}
              onUpdatePosition={handleUpdatePosition}
            />
          </div>

          {/* RIGHT COLUMN: Configuration Controls (~60% Desktop) */}
          <div className="kala-bulk-col-right">
            {/* Top-Right Account Shortcut */}
            <div className="kala-bulk-top-row">
              <AccountShortcut />
            </div>

            {/* Step 1: Select Apparel */}
            <ApparelSelector
              selectedApparel={selectedApparel}
              onSelectApparel={setSelectedApparel}
            />

            {/* Step 2: Select Color */}
            <ColorSelector
              apparelName={currentConfig.name}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
            />

            {/* Step 3: Upload Your Design */}
            <DesignUploader
              currentArtworkName={currentSideData.artworkName}
              currentArtworkUrl={currentSideData.artworkUrl}
              onUpload={handleUploadArtwork}
              onResetDefault={handleResetDefault}
              uploadedApparel={uploadedApparel}
              onUploadApparel={handleUploadApparel}
              onRemoveApparel={handleRemoveApparel}
            />

            {/* Step 4: Design Preview & Adjust */}
            <DesignAdjuster
              size={currentSideData.size}
              onSizeChange={handleUpdateSize}
            />

            {/* Step 5: Approximate Quantity by Size */}
            <QuantitySelector
              sizeQuantities={sizeQuantities}
              onUpdateSizeQuantity={handleUpdateSizeQuantity}
              onBulkPresetApply={handleBulkPresetApply}
              totalQuantity={totalQuantity}
              unitPrice={estimatedUnitPrice}
              estimatedTotal={estimatedTotal}
            />

            {/* Step 6: Requirement Details */}
            <RequirementDetails
              value={requirement}
              onChange={setRequirement}
            />

            {/* Discussion Options & Estimated Investment Display */}
            <DiscussionOptions
              apparelName={currentConfig.name}
              colorName={selectedColor === 'black' ? 'Black' : 'White'}
              quantity={totalQuantity}
              sizeBreakdownText={sizeBreakdownText}
              unitPrice={estimatedUnitPrice}
              estimatedTotal={estimatedTotal}
              requirement={
                uploadedApparel
                  ? `${requirement ? `${requirement}\n` : ''}[Customer Uploaded Apparel: ${uploadedApparel.fileName}]`
                  : requirement
              }
              currentArtworkName={currentSideData.artworkName}
              uploadedApparelFileName={uploadedApparel?.fileName}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default BulkApparelBuilder
