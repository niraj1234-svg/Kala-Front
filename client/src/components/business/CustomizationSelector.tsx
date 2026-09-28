import React, { useRef } from 'react'
import {
  type CustomizationOptionId,
  CUSTOMIZATION_OPTIONS,
} from '../../data/businessProducts'

interface CustomizationSelectorProps {
  selectedCustomization: CustomizationOptionId
  uploadedFileName: string | null
  onSelectCustomization: (opt: CustomizationOptionId) => void
  onFileUpload: (file: File | null) => void
}

export const CustomizationSelector: React.FC<CustomizationSelectorProps> = ({
  selectedCustomization,
  uploadedFileName,
  onSelectCustomization,
  onFileUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileUpload(file)
    }
  }

  const handleTriggerUpload = () => {
    onSelectCustomization('Custom Design')
    fileInputRef.current?.click()
  }

  return (
    <div className="kala-biz-customization-section">
      <div className="kala-biz-field-label">
        <span className="kala-biz-step-badge">3</span>
        <span>Customization Type</span>
      </div>

      {/* 3 Simple Selectable Cards */}
      <div
        className="kala-biz-custom-cards-grid"
        role="radiogroup"
        aria-label="Customization options"
      >
        {CUSTOMIZATION_OPTIONS.map((opt) => {
          const isSelected = selectedCustomization === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`kala-biz-custom-card ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectCustomization(opt.id)}
            >
              <div className="kala-biz-custom-card-top">
                <span className="kala-biz-custom-title">{opt.label}</span>
                <span className="kala-biz-custom-dot" aria-hidden="true" />
              </div>
              <span className="kala-biz-custom-desc">{opt.description}</span>
            </button>
          )
        })}
      </div>

      {/* Upload Box for Custom Design */}
      {selectedCustomization === 'Custom Design' && (
        <div className="kala-biz-upload-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={handleFileChange}
            className="kala-biz-hidden-file-input"
            id="biz-artwork-upload"
          />

          <div className="kala-biz-upload-box">
            <div className="kala-biz-upload-info">
              <span className="kala-biz-upload-icon" aria-hidden="true">📁</span>
              <div>
                <strong>
                  {uploadedFileName ? `Attached: ${uploadedFileName}` : 'Upload your design'}
                </strong>
                <span className="kala-biz-upload-hint">Accepted formats: PNG, JPG, JPEG, PDF</span>
              </div>
            </div>

            <button
              type="button"
              className="kala-biz-upload-btn"
              onClick={handleTriggerUpload}
            >
              {uploadedFileName ? 'Change File' : 'Browse File'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomizationSelector
