import React, { useState } from 'react'
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
  MIN_CUSTOM_APPAREL_QTY,
} from '../BulkApparelBuilder/types'
import { APPAREL_CONFIGS, POLO_PRODUCTS, TSHIRT_PRODUCTS, DEFAULT_EMBLEM_URL } from '../BulkApparelBuilder/mockupAssets'
import ApparelPreview from '../BulkApparelBuilder/ApparelPreview'
import ApparelSelector from '../BulkApparelBuilder/ApparelSelector'
import ColorSelector from '../BulkApparelBuilder/ColorSelector'
import DesignUploader from '../BulkApparelBuilder/DesignUploader'
import QuantitySelector, { PRESET_DISTRIBUTIONS } from '../BulkApparelBuilder/QuantitySelector'
import RequirementDetails from '../BulkApparelBuilder/RequirementDetails'
import AccountShortcut from '../BulkApparelBuilder/AccountShortcut'
import { createBusinessRequest } from '../../services/businessRequestApi'
import { generateWhatsAppInquiryUrl } from '../../services/businessInquiryApi'
import '../BulkApparelBuilder/BulkApparelBuilder.css'

const ORGANIZATION_TYPES = [
  'Company / Corporate',
  'Startup',
  'College / University',
  'School / Academy',
  'Sports Team / Club',
  'Gym / Fitness Brand',
  'Event / Festival',
  'Creator / Community',
  'Other',
]

export const BusinessApparelBuilder: React.FC = () => {
  // 1. Order Mode: 'bulk' (25+ Pcs) vs 'small' (1-24 Pcs Pilot)
  const [orderMode, setOrderMode] = useState<'bulk' | 'small'>('bulk')

  // 2. Apparel & Mockup State
  const [selectedApparel, setSelectedApparel] = useState<ApparelId>('polo')
  const [selectedPoloModel, setSelectedPoloModel] = useState<PoloModelId>('regular-jmp')
  const [selectedTshirtModel, setSelectedTshirtModel] = useState<TshirtModelId>('promotion-campaign')
  const [selectedColor, setSelectedColor] = useState<ApparelColor>('black')
  const [selectedSide, setSelectedSide] = useState<ApparelSide>('front')
  const [uploadedApparel, setUploadedApparel] = useState<UploadedApparelImage | null>(null)

  // 3. Design Service Policy (0% for own logo vs 10% for KALA design support)
  const [designService, setDesignService] = useState<'ready' | 'needs_design'>('ready')

  // 4. Quantities State
  const [sizeQuantities, setSizeQuantities] = useState<SizeQuantities>({
    S: 5,
    M: 15,
    L: 15,
    XL: 10,
    XXL: 5,
  })
  const [smallQuantity, setSmallQuantity] = useState<number>(5)
  const [smallSize, setSmallSize] = useState<SizeKey>('L')

  // 5. Business Intake Form Fields
  const [companyName, setCompanyName] = useState('')
  const [organizationType, setOrganizationType] = useState('Company / Corporate')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [gstin, setGstin] = useState('')
  const [requirement, setRequirement] = useState('')

  // 6. Form Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // 7. Customization Coordinates State
  const [customizationState, setCustomizationState] = useState<ApparelCustomizationState>({
    tshirt: {
      front: { artworkUrl: DEFAULT_EMBLEM_URL, artworkName: 'Corporate Logo Emblem', artworkType: 'image/svg+xml', x: 50, y: 46, size: 80, rotation: 0 },
      back: { artworkUrl: DEFAULT_EMBLEM_URL, artworkName: 'Corporate Logo Emblem', artworkType: 'image/svg+xml', x: 50, y: 44, size: 80, rotation: 0 },
    },
    hoodie: {
      front: { artworkUrl: DEFAULT_EMBLEM_URL, artworkName: 'Corporate Logo Emblem', artworkType: 'image/svg+xml', x: 50, y: 48, size: 80, rotation: 0 },
      back: { artworkUrl: DEFAULT_EMBLEM_URL, artworkName: 'Corporate Logo Emblem', artworkType: 'image/svg+xml', x: 50, y: 44, size: 80, rotation: 0 },
    },
    jersey: {
      front: { artworkUrl: DEFAULT_EMBLEM_URL, artworkName: 'Corporate Logo Emblem', artworkType: 'image/svg+xml', x: 50, y: 46, size: 80, rotation: 0 },
      back: { artworkUrl: DEFAULT_EMBLEM_URL, artworkName: 'Corporate Logo Emblem', artworkType: 'image/svg+xml', x: 50, y: 44, size: 80, rotation: 0 },
    },
    polo: {
      front: { artworkUrl: DEFAULT_EMBLEM_URL, artworkName: 'Corporate Logo Emblem', artworkType: 'image/svg+xml', x: 50, y: 48, size: 80, rotation: 0 },
      back: { artworkUrl: DEFAULT_EMBLEM_URL, artworkName: 'Corporate Logo Emblem', artworkType: 'image/svg+xml', x: 50, y: 44, size: 80, rotation: 0 },
    },
  })

  const currentConfig = APPAREL_CONFIGS[selectedApparel]
  const currentPoloConfig = POLO_PRODUCTS.find((p) => p.id === selectedPoloModel) || POLO_PRODUCTS[0]
  const currentTshirtConfig = TSHIRT_PRODUCTS.find((t) => t.id === selectedTshirtModel) || TSHIRT_PRODUCTS[0]
  const currentSideData = customizationState[selectedApparel][selectedSide]

  const activeApparelName =
    selectedApparel === 'polo'
      ? currentPoloConfig.name
      : selectedApparel === 'tshirt'
      ? currentTshirtConfig.name
      : currentConfig.name

  // Pricing calculations
  const wholesaleUnitPrice =
    selectedApparel === 'polo'
      ? currentPoloConfig.startingPrice
      : selectedApparel === 'tshirt'
      ? currentTshirtConfig.startingPrice
      : currentConfig.startingPrice

  const smallBatchUnitPrice =
    selectedApparel === 'polo'
      ? (currentPoloConfig.personalPrice || 499)
      : selectedApparel === 'tshirt'
      ? (currentTshirtConfig.personalPrice || 399)
      : selectedApparel === 'jersey'
      ? 549
      : 899

  const totalQuantity =
    orderMode === 'bulk'
      ? (sizeQuantities.S || 0) + (sizeQuantities.M || 0) + (sizeQuantities.L || 0) + (sizeQuantities.XL || 0) + (sizeQuantities.XXL || 0)
      : smallQuantity

  const activeUnitPrice = orderMode === 'bulk' ? wholesaleUnitPrice : smallBatchUnitPrice
  const rawSubtotal = activeUnitPrice * totalQuantity
  const designFeeAmount = designService === 'needs_design' ? Math.round(rawSubtotal * 0.1) : 0
  const estimatedTotal = rawSubtotal + designFeeAmount

  const sizeBreakdownText =
    orderMode === 'bulk'
      ? (['S', 'M', 'L', 'XL', 'XXL'] as SizeKey[])
          .filter((sz) => (sizeQuantities[sz] || 0) > 0)
          .map((sz) => `${sz}: ${sizeQuantities[sz]}`)
          .join(', ')
      : `${smallSize}: ${smallQuantity}`

  const activePreviewImage =
    uploadedApparel?.dataUrl ||
    (selectedApparel === 'polo' && currentPoloConfig
      ? currentPoloConfig.mockups[selectedColor]?.[selectedSide] || currentPoloConfig.mockups.black?.front
      : selectedApparel === 'tshirt' && currentTshirtConfig
      ? currentTshirtConfig.mockups[selectedColor]?.[selectedSide] || currentTshirtConfig.mockups.black?.front
      : currentConfig.mockups[selectedColor]?.[selectedSide] || currentConfig.mockups.black?.front)

  // Handlers for model / quantity
  const handleSelectPoloModel = (modelId: PoloModelId) => {
    setSelectedPoloModel(modelId)
    setSelectedColor('black')
    setSelectedSide('front')
  }

  const handleSelectTshirtModel = (modelId: TshirtModelId) => {
    setSelectedTshirtModel(modelId)
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

  // Position, size, rotation
  const handleUpdatePosition = (x: number, y: number) => {
    setCustomizationState((prev) => ({
      ...prev,
      [selectedApparel]: {
        ...prev[selectedApparel],
        [selectedSide]: { ...prev[selectedApparel][selectedSide], x, y },
      },
    }))
  }

  const handleUpdateSize = (size: number) => {
    setCustomizationState((prev) => ({
      ...prev,
      [selectedApparel]: {
        ...prev[selectedApparel],
        [selectedSide]: { ...prev[selectedApparel][selectedSide], size },
      },
    }))
  }

  const handleUpdateRotation = (rotation: number) => {
    setCustomizationState((prev) => ({
      ...prev,
      [selectedApparel]: {
        ...prev[selectedApparel],
        [selectedSide]: { ...prev[selectedApparel][selectedSide], rotation },
      },
    }))
  }

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
      message: `Logo "${fileName}" applied to corporate preview (${selectedSide.toUpperCase()})!`,
    })
    setTimeout(() => setNotification(null), 3500)
  }

  const handleUploadApparel = (apparel: UploadedApparelImage) => {
    setUploadedApparel({ ...apparel, uploadedSide: selectedSide })
    setNotification({
      type: 'success',
      message: `Custom garment "${apparel.fileName}" loaded for preview!`,
    })
    setTimeout(() => setNotification(null), 3500)
  }

  const handleRemoveApparel = () => {
    setUploadedApparel(null)
    setNotification({ type: 'success', message: 'Reverted to standard KALA corporate mockup.' })
    setTimeout(() => setNotification(null), 3500)
  }

  const handleResetDefault = () => {
    setCustomizationState((prev) => ({
      ...prev,
      [selectedApparel]: {
        ...prev[selectedApparel],
        [selectedSide]: {
          ...prev[selectedApparel][selectedSide],
          artworkUrl: DEFAULT_EMBLEM_URL,
          artworkName: 'Corporate Logo Emblem',
          artworkType: 'image/svg+xml',
          size: 80,
          rotation: 0,
        },
      },
    }))
  }

  // Submit quote request to Express Backend API
  const handleSubmitBusinessQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (orderMode === 'bulk' && totalQuantity < MIN_CUSTOM_APPAREL_QTY) {
      setSubmitError(`Bulk corporate orders require a minimum of ${MIN_CUSTOM_APPAREL_QTY} pieces (Current: ${totalQuantity} pcs).`)
      return
    }

    if (!companyName.trim()) {
      setSubmitError('Please enter your Company / Organization name.')
      return
    }
    if (!contactName.trim()) {
      setSubmitError('Please enter your Contact Person name.')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setSubmitError('Please enter a valid work email address.')
      return
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    if (cleanPhone.length < 10) {
      setSubmitError('Please enter a valid 10-digit phone number.')
      return
    }

    setIsSubmitting(true)
    try {
      const designFeeNote = designService === 'ready' ? 'Customer provides ready logo (0% fee)' : 'Needs KALA design creation (10% fee)'
      const fullDetails = [
        `Apparel: ${activeApparelName} (${selectedColor === 'black' ? 'Black' : 'White'})`,
        `Order Mode: ${orderMode === 'bulk' ? 'Bulk Corporate Run (25+ Pcs)' : 'Small / Pilot Team Batch (1-24 Pcs)'}`,
        `Size Breakdown: ${sizeBreakdownText}`,
        `Total Quantity: ${totalQuantity} pcs`,
        `Estimated Total: ₹${estimatedTotal.toLocaleString('en-IN')}`,
        `Design Service: ${designFeeNote}`,
        gstin.trim() ? `GSTIN: ${gstin.trim()}` : '',
        requirement.trim() ? `Notes: ${requirement.trim()}` : '',
      ].filter(Boolean).join('\n')

      const response = await createBusinessRequest({
        name: contactName.trim(),
        organization: companyName.trim(),
        email: email.trim(),
        phone: cleanPhone,
        organizationType,
        apparelRequired: activeApparelName,
        apparelTypes: [activeApparelName],
        quantity: `${totalQuantity} pcs`,
        estimatedQuantity: orderMode === 'bulk' ? `${totalQuantity} pcs` : 'Under 25 (Small Team Order)',
        brandingRequirements: designFeeNote,
        details: fullDetails,
        projectDetails: fullDetails,
        bulkOrderDetails: {
          previewImage: activePreviewImage,
          selectedApparel,
          selectedColor,
          selectedSide,
        },
      })

      if (response.success) {
        setSubmittedRequestId(response.requestId || 'REQ-SUCCESS')
      } else {
        setSubmitError(response.message || 'Failed to submit quote request. Please try again.')
      }
    } catch (err: any) {
      console.error('[BusinessApparelBuilder] Submission error:', err)
      setSubmitError('Connection error. Please try again or reach out on WhatsApp.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Direct WhatsApp contact handler
  const handleWhatsAppInquiry = () => {
    const org = companyName.trim() || 'Our Company'
    const designText = designService === 'ready' ? 'Have ready logo (₹0 fee)' : 'Need KALA design support (10% fee)'
    const url = generateWhatsAppInquiryUrl({
      apparelCategory: activeApparelName,
      color: selectedColor === 'black' ? 'Black' : 'White',
      customization: `Business Branding — ${designText} (${sizeBreakdownText})`,
      approxQuantity: `${totalQuantity} pcs (${orderMode === 'bulk' ? 'Bulk Corporate' : 'Small Team'})`,
      requirement: `Hi KALA team, I would like to inquire about a business apparel order for ${org}.\nApparel: ${activeApparelName}\nColor: ${selectedColor}\nQuantity: ${totalQuantity} pcs (${sizeBreakdownText})\nDesign: ${designText}\nEst. Budget: ₹${estimatedTotal.toLocaleString('en-IN')}${contactName ? `\nContact: ${contactName} (${phone})` : ''}`,
    })
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="kala-bulk-section" id="business-branding-builder" aria-label="Interactive Business Branding Builder">
      <div className="kala-bulk-container">
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

        <div className="kala-bulk-builder-card">
          {/* ====================================================================
              LEFT COLUMN: Live Garment Preview + Brand Logo Uploader + Requirements
              ==================================================================== */}
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
                orderMode === 'bulk'
                  ? `From ₹${wholesaleUnitPrice}/pc`
                  : `From ₹${smallBatchUnitPrice}/pc`
              }
              onSelectApparel={setSelectedApparel}
              onSelectColor={setSelectedColor}
              onSelectSide={setSelectedSide}
              onUpdatePosition={handleUpdatePosition}
              onUpdateSize={handleUpdateSize}
              onUpdateRotation={handleUpdateRotation}
            />

            {/* Design Uploader */}
            <DesignUploader
              currentArtworkName={currentSideData.artworkName}
              currentArtworkUrl={currentSideData.artworkUrl}
              onUpload={handleUploadArtwork}
              onResetDefault={handleResetDefault}
              uploadedApparel={uploadedApparel}
              onUploadApparel={handleUploadApparel}
              onRemoveApparel={handleRemoveApparel}
            />

            {/* Design Service Toggle (Ready Logo vs KALA Support) */}
            <div className="kala-bulk-step-block">
              <div className="kala-bulk-step-heading">
                <span className="kala-bulk-step-num">★</span>
                <h3 className="kala-bulk-step-title">DESIGN CREATION PREFERENCE</h3>
              </div>
              <div className="kala-biz-service-pills" role="radiogroup" aria-label="Design creation pricing">
                <label className={`kala-biz-service-pill ${designService === 'ready' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="bizDesignPref"
                    checked={designService === 'ready'}
                    onChange={() => setDesignService('ready')}
                  />
                  <div className="service-pill-info">
                    <strong>Have Ready Brand Logo (₹0 Fee)</strong>
                    <span>You upload vector or image logo &bull; Zero artwork setup charges</span>
                  </div>
                </label>
                <label className={`kala-biz-service-pill ${designService === 'needs_design' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="bizDesignPref"
                    checked={designService === 'needs_design'}
                    onChange={() => setDesignService('needs_design')}
                  />
                  <div className="service-pill-info">
                    <strong>Need KALA Design Support (10% Fee)</strong>
                    <span>Our creative team drafts concepts and custom typography</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Requirements Notes */}
            <RequirementDetails
              value={requirement}
              onChange={setRequirement}
            />
          </div>

          {/* ====================================================================
              RIGHT COLUMN: Controls, Mode Switcher & Business Intake
              ==================================================================== */}
          <div className="kala-bulk-col-right">
            {/* Top Row: Business Order Mode Switcher + Account Shortcut */}
            <div className="kala-bulk-top-row">
              <div className="kala-builder-mode-switcher" role="tablist" aria-label="Select Business Order Mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={orderMode === 'bulk'}
                  className={`kala-builder-mode-btn ${orderMode === 'bulk' ? 'active' : ''}`}
                  onClick={() => setOrderMode('bulk')}
                >
                  <span className="mode-btn-badge bulk">BULK RUN</span>
                  <div className="mode-btn-content">
                    <strong className="mode-btn-title">Bulk Corporate (25+ Pcs)</strong>
                    <span className="mode-btn-desc">Tiered wholesale rates, GST invoice &amp; quote</span>
                  </div>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={orderMode === 'small'}
                  className={`kala-builder-mode-btn ${orderMode === 'small' ? 'active' : ''}`}
                  onClick={() => setOrderMode('small')}
                >
                  <span className="mode-btn-badge personal">PILOT BATCH</span>
                  <div className="mode-btn-content">
                    <strong className="mode-btn-title">Small / Pilot (1–24 Pcs)</strong>
                    <span className="mode-btn-desc">No MOQ barrier, founder &amp; team samples</span>
                  </div>
                </button>
              </div>
              <AccountShortcut />
            </div>

            {/* Step 1: Select Corporate Apparel */}
            <ApparelSelector
              selectedApparel={selectedApparel}
              selectedPoloModel={selectedPoloModel}
              selectedTshirtModel={selectedTshirtModel}
              selectedColor={selectedColor}
              onSelectApparel={setSelectedApparel}
              onSelectPoloModel={handleSelectPoloModel}
              onSelectTshirtModel={handleSelectTshirtModel}
              orderMode={orderMode === 'bulk' ? 'bulk' : 'personal'}
            />

            {/* Step 2: Select Color */}
            <ColorSelector
              apparelName={activeApparelName}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
            />

            {/* Step 3: Quantities and Volume Configuration */}
            {orderMode === 'bulk' ? (
              <QuantitySelector
                sizeQuantities={sizeQuantities}
                onUpdateSizeQuantity={handleUpdateSizeQuantity}
                onBulkPresetApply={handleBulkPresetApply}
                totalQuantity={totalQuantity}
                unitPrice={wholesaleUnitPrice}
                estimatedTotal={estimatedTotal}
              />
            ) : (
              <div className="kala-bulk-step-block">
                <div className="kala-bulk-step-heading">
                  <span className="kala-bulk-step-num">3</span>
                  <h3 className="kala-bulk-step-title">PILOT BATCH QUANTITY &amp; SIZE</h3>
                </div>

                <div className="kala-personal-config-card">
                  <div className="kala-personal-size-section">
                    <div className="kala-personal-field-label-row">
                      <span className="field-label">Sample Size:</span>
                      <span className="field-current-size">Selected: <strong>{smallSize}</strong></span>
                    </div>
                    <div className="kala-personal-size-pills">
                      {(['S', 'M', 'L', 'XL', 'XXL'] as SizeKey[]).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          className={`kala-personal-size-btn ${smallSize === sz ? 'active' : ''}`}
                          onClick={() => setSmallSize(sz)}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="kala-personal-qty-section">
                    <span className="field-label">Quantity (1 to 24 pcs):</span>
                    <div className="kala-personal-stepper">
                      <button
                        type="button"
                        className="kala-stepper-btn minus"
                        onClick={() => setSmallQuantity((q) => Math.max(1, q - 1))}
                        disabled={smallQuantity <= 1}
                      >
                        −
                      </button>
                      <span className="kala-stepper-value">{smallQuantity}</span>
                      <button
                        type="button"
                        className="kala-stepper-btn plus"
                        onClick={() => setSmallQuantity((q) => Math.min(24, q + 1))}
                        disabled={smallQuantity >= 24}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="kala-personal-price-card">
                    <div className="kala-personal-price-row">
                      <div className="kala-personal-price-left">
                        <span className="kala-personal-price-tag">PILOT ESTIMATE</span>
                        <div className="kala-personal-total-amount">
                          ₹{estimatedTotal.toLocaleString('en-IN')}
                          <span className="kala-personal-unit-sub">
                            ({smallQuantity} × ₹{smallBatchUnitPrice}{designService === 'needs_design' ? ' + 10% design' : ''})
                          </span>
                        </div>
                      </div>
                      <div className="kala-personal-price-badges">
                        <span className="kala-personal-badge-free">
                          {designService === 'ready' ? '✓ ₹0 Design Fee' : '+10% Design Fee'}
                        </span>
                        <span className="kala-personal-badge-moq">Pilot Run (1-24 Pcs)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Company & Contact Intake Form */}
            <div className="kala-bulk-step-block">
              <div className="kala-bulk-step-heading">
                <span className="kala-bulk-step-num">4</span>
                <h3 className="kala-bulk-step-title">COMPANY &amp; INQUIRY DETAILS</h3>
              </div>

              {submittedRequestId ? (
                <div className="kala-b2b-builder-success">
                  <div className="success-icon" aria-hidden="true">✓</div>
                  <h4 className="success-heading">Quote Request Received!</h4>
                  <p className="success-message">
                    Thank you, <strong>{contactName}</strong>. Your inquiry for <strong>{companyName}</strong> (Ref: <code>{submittedRequestId}</code>) has been submitted. Our B2B coordinator will contact you shortly with your digital mockup &amp; GST quote.
                  </p>
                  <button
                    type="button"
                    className="kala-b2b-reset-btn"
                    onClick={() => {
                      setSubmittedRequestId(null)
                      setCompanyName('')
                      setContactName('')
                    }}
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitBusinessQuote} className="kala-biz-builder-form" noValidate>
                  <div className="kala-biz-fields-grid">
                    <div className="form-group">
                      <label htmlFor="biz-company-name">Company / Organization Name *</label>
                      <input
                        id="biz-company-name"
                        type="text"
                        placeholder="e.g. Acme Corp / IIT Delhi"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="biz-org-type">Organization Type</label>
                      <select
                        id="biz-org-type"
                        value={organizationType}
                        onChange={(e) => setOrganizationType(e.target.value)}
                      >
                        {ORGANIZATION_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="biz-contact-name">Contact Person *</label>
                      <input
                        id="biz-contact-name"
                        type="text"
                        placeholder="e.g. Rahul Verma"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="biz-contact-email">Work Email *</label>
                      <input
                        id="biz-contact-email"
                        type="email"
                        placeholder="e.g. rahul@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="biz-contact-phone">Phone / WhatsApp *</label>
                      <input
                        id="biz-contact-phone"
                        type="tel"
                        placeholder="e.g. +91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="biz-gstin">GSTIN (Optional, for Input Tax Credit)</label>
                      <input
                        id="biz-gstin"
                        type="text"
                        placeholder="e.g. 07AAAAA0000A1Z5"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                      />
                    </div>
                  </div>

                  {submitError && (
                    <div className="kala-biz-form-error" role="alert">
                      <span>✕</span>
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Summary Callout */}
                  <div className="kala-biz-quote-summary">
                    <div className="quote-summary-row">
                      <span>Order Summary:</span>
                      <strong>
                        {totalQuantity}x {activeApparelName} ({sizeBreakdownText}) &bull; ₹{estimatedTotal.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <span className="quote-summary-note">
                      {orderMode === 'bulk' ? 'Wholesale bulk rates applied &bull; Official GST invoice support' : 'Flexible pilot run &bull; Direct sample proofing'}
                    </span>
                  </div>

                  {/* Primary CTA Buttons */}
                  <div className="kala-biz-submit-row">
                    <button
                      type="submit"
                      className="kala-biz-primary-submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'SUBMITTING INQUIRY...' : 'SUBMIT OFFICIAL QUOTE REQUEST'}
                      <span aria-hidden="true">&rarr;</span>
                    </button>

                    <button
                      type="button"
                      className="kala-biz-whatsapp-btn"
                      onClick={handleWhatsAppInquiry}
                    >
                      <span>Direct B2B Desk on WhatsApp</span>
                      <span aria-hidden="true">&rarr;</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BusinessApparelBuilder
