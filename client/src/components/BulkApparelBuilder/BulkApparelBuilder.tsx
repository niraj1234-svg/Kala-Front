import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { generateWhatsAppInquiryUrl } from '../../services/businessInquiryApi'
import { APPAREL_PRICING_CATALOG } from '../../data/customApparelPricing'
import {
  type ApparelId,
  type ApparelColor,
  type ApparelSide,
  type ApparelCustomizationState,
  type PoloModelId,
  type TshirtModelId,
  type SizeKey,
  type SizeQuantities,
  type UploadedApparelImage,
  type OrderMode,
} from './types'
import { APPAREL_CONFIGS, POLO_PRODUCTS, TSHIRT_PRODUCTS, DEFAULT_EMBLEM_URL } from './mockupAssets'
import ApparelPreview from './ApparelPreview'
import ApparelSelector from './ApparelSelector'
import ColorSelector from './ColorSelector'
import DesignUploader from './DesignUploader'
import QuantitySelector, { PRESET_DISTRIBUTIONS } from './QuantitySelector'
import RequirementDetails from './RequirementDetails'
import AccountShortcut from './AccountShortcut'
import DiscussionOptions from './DiscussionOptions'
import './BulkApparelBuilder.css'

interface BulkApparelBuilderProps {
  initialMode?: OrderMode
}

export const BulkApparelBuilder: React.FC<BulkApparelBuilderProps> = ({ initialMode = 'bulk' }) => {
  const navigate = useNavigate()
  const { addToCart } = useCart()

  // 1. Order Mode (Bulk vs Personal)
  const [orderMode, setOrderMode] = useState<OrderMode>(initialMode)
  const [personalSize, setPersonalSize] = useState<SizeKey>('L')
  const [personalQuantity, setPersonalQuantity] = useState<number>(1)

  // 2. Core Selection State
  const [selectedApparel, setSelectedApparel] = useState<ApparelId>('tshirt')
  const [selectedPoloModel, setSelectedPoloModel] = useState<PoloModelId>('regular-jmp')
  const [selectedTshirtModel, setSelectedTshirtModel] = useState<TshirtModelId>('promotion-campaign')
  const [selectedColor, setSelectedColor] = useState<ApparelColor>('black')
  const [selectedSide, setSelectedSide] = useState<ApparelSide>('front')
  const [sizeQuantities, setSizeQuantities] = useState<SizeQuantities>({
    S: 5,
    M: 8,
    L: 7,
    XL: 3,
    XXL: 2,
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
        rotation: 0,
      },
      back: {
        artworkUrl: DEFAULT_EMBLEM_URL,
        artworkName: 'Default KALA Emblem',
        artworkType: 'image/svg+xml',
        x: 50,
        y: 44,
        size: 80,
        rotation: 0,
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
        rotation: 0,
      },
      back: {
        artworkUrl: DEFAULT_EMBLEM_URL,
        artworkName: 'Default KALA Emblem',
        artworkType: 'image/svg+xml',
        x: 50,
        y: 44,
        size: 80,
        rotation: 0,
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
        rotation: 0,
      },
      back: {
        artworkUrl: DEFAULT_EMBLEM_URL,
        artworkName: 'Default KALA Emblem',
        artworkType: 'image/svg+xml',
        x: 50,
        y: 44,
        size: 80,
        rotation: 0,
      },
    },
    polo: {
      front: {
        artworkUrl: DEFAULT_EMBLEM_URL,
        artworkName: 'Default KALA Emblem',
        artworkType: 'image/svg+xml',
        x: 50,
        y: 48,
        size: 80,
        rotation: 0,
      },
      back: {
        artworkUrl: DEFAULT_EMBLEM_URL,
        artworkName: 'Default KALA Emblem',
        artworkType: 'image/svg+xml',
        x: 50,
        y: 44,
        size: 80,
        rotation: 0,
      },
    },
  })

  // 3. Status & Notification State
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const currentConfig = APPAREL_CONFIGS[selectedApparel]
  const currentPoloConfig = POLO_PRODUCTS.find((p) => p.id === selectedPoloModel) || POLO_PRODUCTS[0]
  const currentTshirtConfig = TSHIRT_PRODUCTS.find((t) => t.id === selectedTshirtModel) || TSHIRT_PRODUCTS[0]
  const currentSideData = customizationState[selectedApparel][selectedSide]

  // Mathematical Summation of Pieces Across All Sizes
  const totalQuantity =
    (sizeQuantities.S || 0) +
    (sizeQuantities.M || 0) +
    (sizeQuantities.L || 0) +
    (sizeQuantities.XL || 0) +
    (sizeQuantities.XXL || 0)

  const sizeBreakdownText = (['S', 'M', 'L', 'XL', 'XXL'] as SizeKey[])
    .filter((sz) => (sizeQuantities[sz] || 0) > 0)
    .map((sz) => `${sz}: ${sizeQuantities[sz]}`)
    .join(', ')

  const activeApparelName =
    selectedApparel === 'polo'
      ? currentPoloConfig.name
      : selectedApparel === 'tshirt'
      ? currentTshirtConfig.name
      : currentConfig.name

  const estimatedUnitPrice =
    selectedApparel === 'polo'
      ? currentPoloConfig.startingPrice
      : selectedApparel === 'tshirt'
      ? currentTshirtConfig.startingPrice
      : currentConfig.startingPrice

  const estimatedTotal = estimatedUnitPrice * totalQuantity

  const personalCatalogItem = APPAREL_PRICING_CATALOG.find((item) => item.id === selectedApparel)
  const personalUnitPrice =
    selectedApparel === 'polo'
      ? (currentPoloConfig.personalPrice || 499)
      : selectedApparel === 'tshirt'
      ? (currentTshirtConfig.personalPrice || 399)
      : (personalCatalogItem?.personalPrice || 399)
  const personalTotal = personalUnitPrice * personalQuantity

  const activeApparelPreviewImg =
    uploadedApparel?.dataUrl ||
    (selectedApparel === 'polo' && currentPoloConfig
      ? currentPoloConfig.mockups[selectedColor]?.[selectedSide] || currentPoloConfig.mockups.black?.front
      : selectedApparel === 'tshirt' && currentTshirtConfig
      ? currentTshirtConfig.mockups[selectedColor]?.[selectedSide] || currentTshirtConfig.mockups.black?.front
      : currentConfig.mockups[selectedColor]?.[selectedSide] || currentConfig.mockups.black?.front)

  const handlePersonalAddToCart = (goToCheckout = false) => {
    const productId = `custom-${selectedApparel}`
    addToCart(
      {
        id: productId,
        name: `Custom ${activeApparelName}`,
        image: activeApparelPreviewImg || '/custom-apparel/kala-custom-hero-floating.png',
        price: personalUnitPrice,
        color: selectedColor === 'black' ? 'Black' : 'White',
      },
      personalSize,
      personalQuantity,
      {
        apparelType: activeApparelName,
        color: selectedColor === 'black' ? 'Black' : 'White',
        position: selectedSide,
        artworkUrl: currentSideData.artworkUrl,
        requirementDetails: requirement,
        previewUrl: activeApparelPreviewImg,
        ...(currentSideData.artworkName ? { frontArtwork: { fileName: currentSideData.artworkName } } : {}),
      }
    )

    if (goToCheckout) {
      navigate('/checkout')
    } else {
      setNotification({
        type: 'success',
        message: `Added ${personalQuantity}x Custom ${activeApparelName} (${personalSize}) to your bag!`,
      })
      setTimeout(() => setNotification(null), 4000)
    }
  }

  const handlePersonalWhatsAppOrder = () => {
    const url = generateWhatsAppInquiryUrl({
      apparelCategory: activeApparelName,
      color: selectedColor === 'black' ? 'Black' : 'White',
      customization: `Personal Custom Apparel (${personalSize}, Qty: ${personalQuantity})`,
      approxQuantity: `${personalQuantity} pcs`,
      requirement: `Hi KALA team, I would like to order a personal custom ${activeApparelName}.\nSize: ${personalSize}\nColor: ${selectedColor === 'black' ? 'Black' : 'White'}\nQuantity: ${personalQuantity}\nDesign: ${currentSideData.artworkName}\nPrice: ₹${personalTotal.toLocaleString('en-IN')}${requirement ? `\nNotes: ${requirement}` : ''}`,
    })
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleSelectTshirtModel = (modelId: TshirtModelId) => {
    setSelectedTshirtModel(modelId)
    setSelectedColor('black')
    setSelectedSide('front')
  }

  const handleSelectPoloModel = (modelId: PoloModelId) => {
    setSelectedPoloModel(modelId)
    setSelectedColor('black')
    setSelectedSide('front')
  }

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

  // Update rotation of active design
  const handleUpdateRotation = (rotation: number) => {
    setCustomizationState((prev) => ({
      ...prev,
      [selectedApparel]: {
        ...prev[selectedApparel],
        [selectedSide]: {
          ...prev[selectedApparel][selectedSide],
          rotation,
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
          rotation: 0,
        },
      },
    }))
  }

  return (
    <section className="kala-bulk-section" id="bulk-apparel-builder" aria-label="Interactive Custom Apparel Builder">
      <div className="kala-bulk-container">
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
          {/* LEFT COLUMN: Live Product Preview + Upload Design + Adjuster + Requirements */}
          <div className="kala-bulk-col-left">
            <ApparelPreview
              selectedApparel={selectedApparel}
              currentPoloConfig={currentPoloConfig}
              currentTshirtConfig={currentTshirtConfig}
              selectedColor={selectedColor}
              selectedSide={selectedSide}
              customizationState={customizationState}
              uploadedApparel={uploadedApparel}
              customPriceLabel={
                orderMode === 'personal'
                  ? `₹${personalUnitPrice}/pc`
                  : `From ₹${estimatedUnitPrice}/pc`
              }
              onSelectApparel={setSelectedApparel}
              onSelectColor={setSelectedColor}
              onSelectSide={setSelectedSide}
              onUpdatePosition={handleUpdatePosition}
              onUpdateSize={handleUpdateSize}
              onUpdateRotation={handleUpdateRotation}
            />

            {/* 2nd Image: Upload Your Design & Upload Own Apparel */}
            <DesignUploader
              currentArtworkName={currentSideData.artworkName}
              currentArtworkUrl={currentSideData.artworkUrl}
              onUpload={handleUploadArtwork}
              onResetDefault={handleResetDefault}
              uploadedApparel={uploadedApparel}
              onUploadApparel={handleUploadApparel}
              onRemoveApparel={handleRemoveApparel}
            />

            {/* 3rd Section: Requirement Details */}
            <RequirementDetails
              value={requirement}
              onChange={setRequirement}
            />
          </div>

          {/* RIGHT COLUMN: Configuration Controls */}
          <div className="kala-bulk-col-right">
            {/* Top Row: Order Mode Switcher (Bulk vs Personal) + Account Shortcut */}
            <div className="kala-bulk-top-row">
              <div className="kala-builder-mode-switcher" role="tablist" aria-label="Select Order Mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={orderMode === 'bulk'}
                  className={`kala-builder-mode-btn ${orderMode === 'bulk' ? 'active' : ''}`}
                  onClick={() => setOrderMode('bulk')}
                >
                  <span className="mode-btn-badge bulk">BULK</span>
                  <div className="mode-btn-content">
                    <strong className="mode-btn-title">Bulk Order (25+ Pcs)</strong>
                    <span className="mode-btn-desc">Team rates, tiered discounts &amp; quote</span>
                  </div>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={orderMode === 'personal'}
                  className={`kala-builder-mode-btn ${orderMode === 'personal' ? 'active' : ''}`}
                  onClick={() => setOrderMode('personal')}
                >
                  <span className="mode-btn-badge personal">PERSONAL</span>
                  <div className="mode-btn-content">
                    <strong className="mode-btn-title">Personal Piece (1+ Pcs)</strong>
                    <span className="mode-btn-desc">No MOQ &amp; ₹0 design setup fee</span>
                  </div>
                </button>
              </div>
              <AccountShortcut />
            </div>

            {/* Step 1: Select Apparel */}
            <ApparelSelector
              selectedApparel={selectedApparel}
              selectedPoloModel={selectedPoloModel}
              selectedTshirtModel={selectedTshirtModel}
              selectedColor={selectedColor}
              onSelectApparel={setSelectedApparel}
              onSelectPoloModel={handleSelectPoloModel}
              onSelectTshirtModel={handleSelectTshirtModel}
              orderMode={orderMode}
            />

            {/* Step 2: Select Color */}
            <ColorSelector
              apparelName={activeApparelName}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
            />

            {/* Conditional Flow based on Order Mode */}
            {orderMode === 'bulk' ? (
              <>
                {/* Step 3: Approximate Quantity by Size */}
                <QuantitySelector
                  sizeQuantities={sizeQuantities}
                  onUpdateSizeQuantity={handleUpdateSizeQuantity}
                  onBulkPresetApply={handleBulkPresetApply}
                  totalQuantity={totalQuantity}
                  unitPrice={estimatedUnitPrice}
                  estimatedTotal={estimatedTotal}
                />

                {/* Discussion Options & Estimated Investment Display */}
                <DiscussionOptions
                  apparelId={selectedApparel}
                  apparelName={activeApparelName}
                  colorName={selectedColor === 'black' ? 'Black' : 'White'}
                  quantity={totalQuantity}
                  sizeQuantities={sizeQuantities}
                  sizeBreakdownText={sizeBreakdownText}
                  unitPrice={estimatedUnitPrice}
                  estimatedTotal={estimatedTotal}
                  requirement={
                    uploadedApparel
                      ? `${requirement ? `${requirement}\n` : ''}[Customer Uploaded Apparel: ${uploadedApparel.fileName}]`
                      : requirement
                  }
                  currentArtworkName={currentSideData.artworkName}
                  currentArtworkUrl={currentSideData.artworkUrl}
                  uploadedApparelFileName={uploadedApparel?.fileName}
                  apparelPreviewImage={activeApparelPreviewImg}
                />
              </>
            ) : (
              <div className="kala-personal-flow-wrap">
                {/* Step 3: Select Size & Quantity */}
                <div className="kala-bulk-step-block">
                  <div className="kala-bulk-step-heading">
                    <span className="kala-bulk-step-num">3</span>
                    <h3 className="kala-bulk-step-title">SELECT SIZE &amp; QUANTITY</h3>
                  </div>

                  <div className="kala-personal-config-card">
                    {/* Size Selection */}
                    <div className="kala-personal-size-section">
                      <div className="kala-personal-field-label-row">
                        <span className="field-label">Garment Size:</span>
                        <span className="field-current-size">Selected: <strong>{personalSize}</strong></span>
                      </div>
                      <div className="kala-personal-size-pills" role="radiogroup" aria-label="Select apparel size">
                        {(['S', 'M', 'L', 'XL', 'XXL'] as SizeKey[]).map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            role="radio"
                            aria-checked={personalSize === sz}
                            className={`kala-personal-size-btn ${personalSize === sz ? 'active' : ''}`}
                            onClick={() => setPersonalSize(sz)}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity Counter */}
                    <div className="kala-personal-qty-section">
                      <span className="field-label">Quantity:</span>
                      <div className="kala-personal-stepper">
                        <button
                          type="button"
                          className="kala-stepper-btn minus"
                          onClick={() => setPersonalQuantity((q) => Math.max(1, q - 1))}
                          disabled={personalQuantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="kala-stepper-value">{personalQuantity}</span>
                        <button
                          type="button"
                          className="kala-stepper-btn plus"
                          onClick={() => setPersonalQuantity((q) => q + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Personal Price Estimate Box */}
                    <div className="kala-personal-price-card">
                      <div className="kala-personal-price-row">
                        <div className="kala-personal-price-left">
                          <span className="kala-personal-price-tag">PERSONAL ORDER ESTIMATE</span>
                          <div className="kala-personal-total-amount">
                            ₹{personalTotal.toLocaleString('en-IN')}
                            <span className="kala-personal-unit-sub">
                              ({personalQuantity} × ₹{personalUnitPrice})
                            </span>
                          </div>
                        </div>
                        <div className="kala-personal-price-badges">
                          <span className="kala-personal-badge-free">✓ ₹0 Design Fee</span>
                          <span className="kala-personal-badge-moq">1+ Pieces (No Minimum)</span>
                        </div>
                      </div>
                      <p className="kala-personal-fee-note">
                        Customer provides artwork. Premium DTF print &amp; combed cotton garment included.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 4: Personal Order Actions */}
                <div className="kala-bulk-step-block">
                  <div className="kala-bulk-step-heading">
                    <span className="kala-bulk-step-num">4</span>
                    <h3 className="kala-bulk-step-title">CHECKOUT &amp; ORDER</h3>
                  </div>

                  <div className="kala-personal-actions-card">
                    <div className="kala-personal-btn-grid">
                      <button
                        type="button"
                        className="kala-personal-btn cart"
                        onClick={() => handlePersonalAddToCart(false)}
                      >
                        <span className="btn-icon">🛒</span>
                        <span>ADD TO CART</span>
                      </button>
                      <button
                        type="button"
                        className="kala-personal-btn checkout"
                        onClick={() => handlePersonalAddToCart(true)}
                      >
                        <span>BUY NOW</span>
                        <span className="btn-arrow">→</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      className="kala-personal-btn whatsapp"
                      onClick={handlePersonalWhatsAppOrder}
                    >
                      <span>Order Directly via WhatsApp</span>
                      <span className="btn-arrow">→</span>
                    </button>

                    <div className="kala-personal-trust-footnotes">
                      <span>✓ 100% Combed Ringspun Cotton</span>
                      <span>✓ High-Definition Washproof Print</span>
                      <span>✓ All-India Tracked Dispatch</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default BulkApparelBuilder
