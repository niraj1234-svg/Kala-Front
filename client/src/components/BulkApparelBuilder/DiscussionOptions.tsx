import React, { useState } from 'react'
import { CONTACT_OPTIONS, type ContactMethodType } from '../../data/businessSlots'
import { generateWhatsAppInquiryUrl } from '../../services/businessInquiryApi'
import MeetingSchedulerModal from '../business/MeetingSchedulerModal'

interface DiscussionOptionsProps {
  apparelName: string
  colorName: string
  quantity: number
  sizeBreakdownText: string
  unitPrice: number
  estimatedTotal: number
  requirement: string
}

export const DiscussionOptions: React.FC<DiscussionOptionsProps> = ({
  apparelName,
  colorName,
  quantity,
  sizeBreakdownText,
  unitPrice,
  estimatedTotal,
  requirement,
}) => {
  const [activeModalMethod, setActiveModalMethod] = useState<ContactMethodType | null>(null)

  const handleSelectContactMethod = (method: ContactMethodType) => {
    const sizeInfo = sizeBreakdownText ? ` (${sizeBreakdownText})` : ''
    if (method === 'WhatsApp') {
      const url = generateWhatsAppInquiryUrl({
        apparelCategory: apparelName,
        color: colorName,
        customization: `Custom Bulk Artwork Print${sizeInfo}`,
        approxQuantity: `${quantity} pcs`,
        requirement: requirement || `Bulk ${apparelName} order enquiry with sizes: ${sizeBreakdownText}. Estimated budget: ₹${estimatedTotal.toLocaleString('en-IN')}`,
      })
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      setActiveModalMethod(method)
    }
  }

  return (
    <div className="kala-bulk-discussion-wrap">
      {/* ====================================================================
          ESTIMATED MONEY REQUIRED SUMMARY
          (Displays calculated total without payment / place order options)
          ==================================================================== */}
      <div className="kala-bulk-estimate-card">
        <div className="kala-bulk-estimate-main">
          <div className="kala-bulk-estimate-left">
            <span className="kala-bulk-estimate-tag">ESTIMATED INVESTMENT</span>
            <div className="kala-bulk-estimate-amount-row">
              <span className="kala-bulk-estimate-amount">₹{estimatedTotal.toLocaleString('en-IN')}</span>
              <span className="kala-bulk-estimate-unit-tag">
                ({quantity} pcs @ ₹{unitPrice}/pc starting)
              </span>
            </div>
            {sizeBreakdownText && (
              <span className="kala-bulk-estimate-sizes">
                Sizes: <strong>{sizeBreakdownText}</strong>
              </span>
            )}
          </div>

          <div className="kala-bulk-estimate-right">
            <span className="kala-bulk-estimate-pill">⚡ No Advance Payment Needed</span>
            <span className="kala-bulk-estimate-subnote">
              Final quote confirmed via direct consultation below
            </span>
          </div>
        </div>
      </div>

      {/* Discussion Header */}
      <div className="kala-bulk-discussion-header">
        <h4 className="kala-bulk-discussion-title">LET'S DISCUSS YOUR REQUIREMENT</h4>
        <p className="kala-bulk-discussion-sub">
          Choose your preferred way to connect with our custom apparel team.
        </p>
      </div>

      {/* 4 Contact Buttons */}
      <div className="kala-bulk-contact-grid" role="group" aria-label="Ways to connect with KALA team">
        {CONTACT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`kala-bulk-contact-card ${opt.id === 'WhatsApp' ? 'whatsapp' : ''}`}
            onClick={() => handleSelectContactMethod(opt.id)}
          >
            <span className="kala-bulk-contact-icon" aria-hidden="true">
              {opt.icon}
            </span>
            <div className="kala-bulk-contact-info">
              <strong className="kala-bulk-contact-label">{opt.label}</strong>
              <span className="kala-bulk-contact-note">{opt.locationNote}</span>
            </div>
          </button>
        ))}
      </div>

      <p className="kala-bulk-discussion-footer">
        Meet in Bilaspur • Google Meet • Scheduled Call • WhatsApp Anytime
      </p>

      <div className="kala-bulk-disclaimer-box">
        <p>Final price depends on quantity, fabric choice, print size and customization.</p>
      </div>

      {/* Meeting Scheduler Modal for Google Meet, In-Person, Call */}
      {activeModalMethod && (
        <MeetingSchedulerModal
          isOpen={true}
          method={activeModalMethod}
          apparelCategoryName={apparelName}
          colorName={colorName}
          customizationName="Custom Bulk Print"
          approxQuantity={String(quantity)}
          sizeBreakdown={sizeBreakdownText}
          estimatedTotal={estimatedTotal}
          initialRequirement={requirement || ''}
          onClose={() => setActiveModalMethod(null)}
        />
      )}
    </div>
  )
}

export default DiscussionOptions
