import React from 'react'

interface RequirementDetailsProps {
  value: string
  onChange: (val: string) => void
  hideHeading?: boolean
}

export const RequirementDetails: React.FC<RequirementDetailsProps> = ({
  value,
  onChange,
  hideHeading = false,
}) => {
  return (
    <div className={hideHeading ? 'kala-bulk-notes-inline-wrap' : 'kala-bulk-step-block'}>
      {!hideHeading ? (
        <div className="kala-bulk-step-heading">
          <span className="kala-bulk-step-num">4</span>
          <h3 className="kala-bulk-step-title">
            REQUIREMENT DETAILS <span className="kala-bulk-optional-tag">(Optional)</span>
          </h3>
        </div>
      ) : (
        <label className="kala-bulk-notes-inline-label">
          <span>Order Notes &amp; Special Instructions</span>
          <span className="kala-bulk-optional-tag">(Optional)</span>
        </label>
      )}

      <div className="kala-bulk-textarea-wrap">
        <textarea
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tell us about your requirement (e.g. event date, logo placement, team details, sizing requirements)"
          className="kala-bulk-textarea"
          aria-label="Requirement details notes"
        />
      </div>
    </div>
  )
}

export default RequirementDetails
