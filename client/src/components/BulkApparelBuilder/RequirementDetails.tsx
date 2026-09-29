import React from 'react'

interface RequirementDetailsProps {
  value: string
  onChange: (val: string) => void
}

export const RequirementDetails: React.FC<RequirementDetailsProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="kala-bulk-step-block">
      <div className="kala-bulk-step-heading">
        <span className="kala-bulk-step-num">6</span>
        <h3 className="kala-bulk-step-title">
          REQUIREMENT DETAILS <span className="kala-bulk-optional-tag">(Optional)</span>
        </h3>
      </div>

      <div className="kala-bulk-textarea-wrap">
        <textarea
          rows={3}
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
