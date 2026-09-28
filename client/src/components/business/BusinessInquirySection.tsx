import React, { useState } from 'react'
import {
  APPAREL_CATEGORIES,
  type ApparelCategoryId,
  type StandardColorType,
  type PaletteColor,
  POPULAR_COLORS,
  type CustomizationOptionId,
} from '../../data/businessProducts'
import { type ContactMethodType } from '../../data/businessSlots'
import { generateWhatsAppInquiryUrl } from '../../services/businessInquiryApi'

import BusinessHero from './BusinessHero'
import ApparelCategorySelector from './ApparelCategorySelector'
import ApparelPreview from './ApparelPreview'
import ColorSelector from './ColorSelector'
import CustomizationSelector from './CustomizationSelector'
import BusinessRequirementForm from './BusinessRequirementForm'
import ContactOptions from './ContactOptions'
import MeetingSchedulerModal from './MeetingSchedulerModal'

import '../../styles/BusinessInquiry.css'

export const BusinessInquirySection: React.FC = () => {
  // 1. Core Selection State
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<ApparelCategoryId>('t-shirts')
  const [colorType, setColorType] = useState<StandardColorType>('Black')
  const [customColor, setCustomColor] = useState<PaletteColor>(POPULAR_COLORS[0])
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front')
  const [customization, setCustomization] =
    useState<CustomizationOptionId>('Front Print')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [approxQuantity, setApproxQuantity] = useState<string>('50')
  const [requirement, setRequirement] = useState<string>('')

  // 2. Modal & Contact State
  const [activeModalMethod, setActiveModalMethod] =
    useState<ContactMethodType | null>(null)

  const activeCategory =
    APPAREL_CATEGORIES.find((c) => c.id === selectedCategoryId) ||
    APPAREL_CATEGORIES[0]

  const colorDisplayName =
    colorType === 'Other' ? customColor.name : colorType

  // Reset side when category changes if back image is missing
  const handleSelectCategory = (id: ApparelCategoryId) => {
    setSelectedCategoryId(id)
    setViewSide('front')
  }

  // Handle Contact Method Selection
  const handleSelectContactMethod = (method: ContactMethodType) => {
    if (method === 'WhatsApp') {
      const url = generateWhatsAppInquiryUrl({
        apparelCategory: activeCategory.name,
        color: colorDisplayName,
        customization,
        approxQuantity,
        requirement,
      })
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      setActiveModalMethod(method)
    }
  }

  return (
    <section
      className="kala-biz-inquiry-section"
      id="bulk-order-calculator"
      aria-labelledby="bulk-order-heading"
    >
      <div className="kala-biz-container">
        {/* Section Header */}
        <BusinessHero />

        {/* Responsive Stage Card */}
        <div className="kala-biz-main-card">
          {/* LEFT COLUMN: Apparel Product Preview Stage */}
          <div className="kala-biz-left-panel">
            <ApparelPreview
              category={activeCategory}
              colorType={colorType}
              customColor={customColor}
              viewSide={viewSide}
              onToggleSide={setViewSide}
            />
          </div>

          {/* RIGHT COLUMN: Selection Controls & Inquiry Options */}
          <div className="kala-biz-right-panel">
            {/* Step 1: Apparel Category (3 options) */}
            <ApparelCategorySelector
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={handleSelectCategory}
            />

            {/* Step 2: Color (White, Black, Other) */}
            <ColorSelector
              selectedColorType={colorType}
              customColor={customColor}
              onSelectColorType={setColorType}
              onSelectCustomColor={setCustomColor}
            />

            {/* Step 3: Customization (Front Print, Front + Back, Custom Design) */}
            <CustomizationSelector
              selectedCustomization={customization}
              uploadedFileName={uploadedFile ? uploadedFile.name : null}
              onSelectCustomization={setCustomization}
              onFileUpload={setUploadedFile}
            />

            {/* Step 4 & 5: Approximate Quantity & Requirement Notes */}
            <BusinessRequirementForm
              approxQuantity={approxQuantity}
              requirement={requirement}
              onChangeQuantity={setApproxQuantity}
              onChangeRequirement={setRequirement}
            />

            {/* Step 6: Contact Options (Meet in Bilaspur, Google Meet, Call, WhatsApp) */}
            <ContactOptions onSelectOption={handleSelectContactMethod} />
          </div>
        </div>
      </div>

      {/* Booking / Callback Modal */}
      <MeetingSchedulerModal
        isOpen={Boolean(activeModalMethod)}
        method={activeModalMethod}
        apparelCategoryName={activeCategory.name}
        colorName={colorDisplayName}
        customizationName={customization}
        approxQuantity={approxQuantity}
        initialRequirement={requirement}
        onClose={() => setActiveModalMethod(null)}
      />
    </section>
  )
}

export default BusinessInquirySection
