import React from 'react'
import { CONTACT_OPTIONS, type ContactMethodType } from '../../data/businessSlots'

interface ContactOptionsProps {
  onSelectOption: (method: ContactMethodType) => void
}

export const ContactOptions: React.FC<ContactOptionsProps> = ({ onSelectOption }) => {
  return (
    <div className="kala-biz-contact-section">
      <div className="kala-biz-contact-header">
        <h3 className="kala-biz-contact-title">Let's discuss your requirement</h3>
        <p className="kala-biz-contact-subtitle">
          Choose your preferred way to connect with our custom apparel team.
        </p>
      </div>

      {/* 4 Contact Buttons */}
      <div className="kala-biz-contact-grid" role="group" aria-label="Ways to contact KALA">
        {CONTACT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`kala-biz-contact-btn ${opt.id === 'WhatsApp' ? 'whatsapp' : ''}`}
            onClick={() => onSelectOption(opt.id)}
          >
            <span className="kala-biz-btn-icon" aria-hidden="true">
              {opt.icon}
            </span>
            <div className="kala-biz-btn-text">
              <strong className="kala-biz-btn-label">{opt.label}</strong>
              <span className="kala-biz-btn-note">{opt.locationNote}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Short Explanation Under Options */}
      <p className="kala-biz-options-summary">
        Meet in Bilaspur • Google Meet • Scheduled Call • WhatsApp Anytime
      </p>

      {/* Small, Clear Pricing Note */}
      <div className="kala-biz-disclaimer-wrap">
        <p className="kala-biz-disclaimer-text">
          Final price depends on quantity, fabric and customization.
        </p>
      </div>
    </div>
  )
}

export default ContactOptions
