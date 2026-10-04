import React from 'react'

interface BusinessRequirementFormProps {
  approxQuantity: string
  requirement: string
  onChangeQuantity: (qty: string) => void
  onChangeRequirement: (text: string) => void
}

export const BusinessRequirementForm: React.FC<BusinessRequirementFormProps> = ({
  approxQuantity,
  requirement,
  onChangeQuantity,
  onChangeRequirement,
}) => {
  const QUANTITY_PRESETS = ['25', '50', '100', '250', '500+']

  return (
    <div className="kala-biz-req-section">
      {/* 4. Approximate Quantity */}
      <div className="kala-biz-field-group">
        <div className="kala-biz-field-label">
          <span className="kala-biz-step-badge">4</span>
          <span>Approximate Quantity</span>
          <span className="kala-biz-optional-tag">(Optional)</span>
        </div>

        <div className="kala-biz-qty-row">
          <div className="kala-biz-qty-chips" role="group" aria-label="Quick quantity presets">
            {QUANTITY_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`kala-biz-qty-chip ${approxQuantity === preset ? 'active' : ''}`}
                onClick={() => onChangeQuantity(preset)}
              >
                {preset} pcs
              </button>
            ))}
          </div>

          <div className="kala-biz-qty-custom-wrap">
            <input
              type="text"
              className="kala-biz-qty-input"
              placeholder="Or enter quantity"
              value={approxQuantity}
              onChange={(e) => onChangeQuantity(e.target.value.replace(/[^0-9+]/g, ''))}
              aria-label="Approximate quantity of garments"
            />
          </div>
        </div>
      </div>

      {/* 5. Requirement / Notes */}
      <div className="kala-biz-field-group">
        <div className="kala-biz-field-label">
          <span className="kala-biz-step-badge">5</span>
          <span>Requirement Details</span>
          <span className="kala-biz-optional-tag">(Optional)</span>
        </div>

        <textarea
          className="kala-biz-textarea"
          rows={3}
          placeholder="Tell us about your requirement (e.g. event date, logo placement, team details, sizing requirements)"
          value={requirement}
          onChange={(e) => onChangeRequirement(e.target.value)}
          aria-label="Project requirement details"
        />
      </div>
    </div>
  )
}

export default BusinessRequirementForm
