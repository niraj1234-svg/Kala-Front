import React, { useState, useEffect } from 'react'
import {
  BUSINESS_CONFIG,
  PREDEFINED_TIME_SLOTS,
  getUpcomingAvailableDates,
  type ContactMethodType,
  type AvailableDate,
} from '../../data/businessSlots'
import {
  submitBusinessInquiry,
  fetchBookedSlots,
  generateWhatsAppInquiryUrl,
  type BookedSlotItem,
} from '../../services/businessInquiryApi'

interface MeetingSchedulerModalProps {
  isOpen: boolean
  method: ContactMethodType | null
  apparelCategoryName: string
  colorName: string
  customizationName: string
  approxQuantity: string
  initialRequirement: string
  onClose: () => void
}

export const MeetingSchedulerModal: React.FC<MeetingSchedulerModalProps> = ({
  isOpen,
  method,
  apparelCategoryName,
  colorName,
  customizationName,
  approxQuantity,
  initialRequirement,
  onClose,
}) => {
  const availableDates: AvailableDate[] = getUpcomingAvailableDates()

  // Form State
  const [selectedDate, setSelectedDate] = useState<string>(
    availableDates[0]?.dateString || ''
  )
  const [selectedTime, setSelectedTime] = useState<string>(
    PREDEFINED_TIME_SLOTS[0]?.timeLabel || ''
  )

  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [requirement, setRequirement] = useState(initialRequirement)

  // Status State
  const [bookedSlots, setBookedSlots] = useState<BookedSlotItem[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [confirmedData, setConfirmedData] = useState<{
    date: string
    time: string
    method: ContactMethodType
    location?: string
  } | null>(null)

  // Sync initial requirement whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setRequirement(initialRequirement || '')
      setSubmitError(null)
      setIsSubmitted(false)
      setErrors({})
    }
  }, [isOpen, initialRequirement])

  // Fetch already booked slots whenever modal opens or date changes
  useEffect(() => {
    if (!isOpen || !method) return

    let isMounted = true
    fetchBookedSlots(method, selectedDate)
      .then((slots) => {
        if (isMounted) {
          setBookedSlots(slots)
          // If current selected time is booked, auto-select first available time slot
          const isCurrentBooked = slots.some(
            (s) => s.meetingDate === selectedDate && s.meetingTime === selectedTime
          )
          if (isCurrentBooked) {
            const firstAvailable = PREDEFINED_TIME_SLOTS.find(
              (slot) => !slots.some((s) => s.meetingDate === selectedDate && s.meetingTime === slot.timeLabel)
            )
            if (firstAvailable) {
              setSelectedTime(firstAvailable.timeLabel)
            }
          }
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [isOpen, method, selectedDate])

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !method || method === 'WhatsApp') return null

  const isCall = method === 'Call'
  const isBilaspur = method === 'In-Person Meeting'
  const isMeet = method === 'Google Meet'

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Please enter your full name.'
    }

    const cleanMobile = mobile.replace(/[^0-9]/g, '')
    if (!cleanMobile) {
      newErrors.mobile = 'Please enter your contact mobile number.'
    } else if (cleanMobile.length < 10 || cleanMobile.length > 15) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number.'
    }

    if (!isCall) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!email.trim()) {
        newErrors.email = 'Please enter your work or personal email.'
      } else if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address.'
      }

      if (!organization.trim()) {
        newErrors.organization = 'Please enter your company, college, or team name.'
      }
    }

    if (!requirement.trim()) {
      newErrors.requirement = 'Please describe your requirement or event details.'
    }

    if (!selectedDate) {
      newErrors.date = 'Please select a date.'
    }

    if (!selectedTime) {
      newErrors.time = 'Please select a time slot.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validate()) return

    setIsSubmitting(true)

    try {
      await submitBusinessInquiry({
        name: name.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        organization: organization.trim(),
        apparelCategory: apparelCategoryName,
        color: colorName,
        customization: customizationName,
        approxQuantity: approxQuantity || undefined,
        requirement: requirement.trim(),
        contactMethod: method,
        meetingDate: selectedDate,
        meetingTime: selectedTime,
        meetingLocation: isBilaspur ? BUSINESS_CONFIG.location : undefined,
      })

      setConfirmedData({
        date: selectedDate,
        time: selectedTime,
        method,
        location: isBilaspur ? BUSINESS_CONFIG.location : undefined,
      })
      setIsSubmitted(true)
    } catch (err: any) {
      setSubmitError(err.message || 'Unable to submit your request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format date for display
  const selectedDateObj = availableDates.find((d) => d.dateString === selectedDate)

  // Check which time slots are booked for current selected date
  const availableSlotsCount = PREDEFINED_TIME_SLOTS.filter(
    (slot) => !bookedSlots.some((s) => s.meetingDate === selectedDate && s.meetingTime === slot.timeLabel)
  ).length

  return (
    <div
      className="kala-biz-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="biz-modal-title"
    >
      <div
        className="kala-biz-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="kala-biz-modal-header">
          <div>
            <div className="kala-biz-modal-badge">
              {isBilaspur && '📍 IN-PERSON MEETING (BILASPUR ONLY)'}
              {isMeet && '📹 GOOGLE MEET (SCHEDULED)'}
              {isCall && '📞 DIRECT CALLBACK (SCHEDULED)'}
            </div>
            <h3 id="biz-modal-title" className="kala-biz-modal-title">
              {isBilaspur && 'Meet Us in Bilaspur'}
              {isMeet && 'Book a Google Meet'}
              {isCall && 'Request a Call'}
            </h3>
          </div>
          <button
            type="button"
            className="kala-biz-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Selected Summary Pill */}
        <div className="kala-biz-modal-summary-chip">
          <span>{apparelCategoryName}</span>
          <span className="dot">•</span>
          <span>{colorName}</span>
          <span className="dot">•</span>
          <span>{customizationName}</span>
          {approxQuantity && (
            <>
              <span className="dot">•</span>
              <span>{approxQuantity} pcs</span>
            </>
          )}
        </div>

        {/* ================================================================
            SUCCESS STATE SCREEN
            ================================================================ */}
        {isSubmitted && confirmedData ? (
          <div className="kala-biz-modal-success">
            <div className="kala-biz-success-icon-wrap" aria-hidden="true">
              ✓
            </div>
            <h4 className="kala-biz-success-title">
              Thank you. Your request has been received.
            </h4>
            <p className="kala-biz-success-sub">
              Our team will contact you shortly.
            </p>

            <div className="kala-biz-confirmed-details-card">
              <div className="kala-biz-detail-row">
                <span className="label">Meeting Type:</span>
                <strong className="val">{confirmedData.method}</strong>
              </div>

              {confirmedData.location && (
                <div className="kala-biz-detail-row">
                  <span className="label">Location:</span>
                  <strong className="val">{confirmedData.location}</strong>
                </div>
              )}

              <div className="kala-biz-detail-row">
                <span className="label">Confirmed Date:</span>
                <strong className="val">{selectedDateObj?.formattedDisplay || confirmedData.date}</strong>
              </div>

              <div className="kala-biz-detail-row">
                <span className="label">Confirmed Time:</span>
                <strong className="val">{confirmedData.time}</strong>
              </div>
            </div>

            {isMeet && (
              <p className="kala-biz-meet-notice">
                Your meeting request has been received. We will share the Google Meet link after confirmation.
              </p>
            )}

            {isCall && (
              <p className="kala-biz-meet-notice">
                Your callback request has been received. We will contact you during the selected time slot.
              </p>
            )}

            <button
              type="button"
              className="kala-btn kala-btn-primary kala-biz-modal-done-btn"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        ) : (
          /* ================================================================
              INQUIRY / BOOKING FORM
              ================================================================ */
          <form className="kala-biz-modal-form" onSubmit={handleSubmit} noValidate>
            {/* 1. Date Selector */}
            <div className="kala-biz-form-group">
              <label className="kala-biz-form-label">
                Select Date <span className="req">*</span>
              </label>
              <div className="kala-biz-dates-scroll-row" role="radiogroup" aria-label="Available Dates">
                {availableDates.map((d) => (
                  <button
                    key={d.dateString}
                    type="button"
                    role="radio"
                    aria-checked={selectedDate === d.dateString}
                    className={`kala-biz-date-pill ${selectedDate === d.dateString ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedDate(d.dateString)
                      setErrors((prev) => ({ ...prev, date: '' }))
                    }}
                  >
                    <span className="day-name">{d.dayLabel}</span>
                    <strong className="date-num">{d.dateString.split('-')[2]}</strong>
                    <span className="month-name">{d.formattedDisplay.split(' ')[2] || ''}</span>
                  </button>
                ))}
              </div>
              {errors.date && <p className="kala-biz-form-error">{errors.date}</p>}
            </div>

            {/* 2. Predefined Time Slot Selector */}
            <div className="kala-biz-form-group">
              <div className="kala-biz-label-row">
                <label className="kala-biz-form-label">
                  Select Time Slot (IST) <span className="req">*</span>
                </label>
                <span className="kala-biz-ist-tag">Asia/Kolkata</span>
              </div>

              {availableSlotsCount === 0 ? (
                <div className="kala-biz-no-slots-box">
                  <p>No slots are currently available for this date.</p>
                  <a
                    href={generateWhatsAppInquiryUrl({
                      name,
                      apparelCategory: apparelCategoryName,
                      color: colorName,
                      customization: customizationName,
                      approxQuantity,
                      requirement,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="kala-biz-whatsapp-fallback-btn"
                  >
                    Contact us on WhatsApp
                  </a>
                </div>
              ) : (
                <div className="kala-biz-slots-grid" role="radiogroup" aria-label="Available Time Slots">
                  {PREDEFINED_TIME_SLOTS.map((slot) => {
                    const isBooked = bookedSlots.some(
                      (s) => s.meetingDate === selectedDate && s.meetingTime === slot.timeLabel
                    )
                    const isSelected = selectedTime === slot.timeLabel && !isBooked

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        role="radio"
                        disabled={isBooked}
                        aria-checked={isSelected}
                        aria-disabled={isBooked}
                        className={`kala-biz-slot-btn ${isSelected ? 'active' : ''} ${isBooked ? 'booked' : ''}`}
                        onClick={() => {
                          if (!isBooked) {
                            setSelectedTime(slot.timeLabel)
                            setErrors((prev) => ({ ...prev, time: '' }))
                          }
                        }}
                      >
                        <span className="slot-time">{slot.timeLabel.replace(' IST', '')}</span>
                        <span className="slot-status">{isBooked ? 'Booked' : 'Available'}</span>
                      </button>
                    )
                  })}
                </div>
              )}
              {errors.time && <p className="kala-biz-form-error">{errors.time}</p>}
            </div>

            {/* 3. Customer Details Fields */}
            <div className="kala-biz-customer-inputs-grid">
              {/* Full Name */}
              <div className="kala-biz-input-field">
                <label htmlFor="biz-cust-name" className="kala-biz-form-label">
                  Full Name <span className="req">*</span>
                </label>
                <input
                  id="biz-cust-name"
                  type="text"
                  className={`kala-biz-text-input ${errors.name ? 'has-error' : ''}`}
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (errors.name) setErrors((p) => ({ ...p, name: '' }))
                  }}
                />
                {errors.name && <p className="kala-biz-form-error">{errors.name}</p>}
              </div>

              {/* Mobile Number */}
              <div className="kala-biz-input-field">
                <label htmlFor="biz-cust-mobile" className="kala-biz-form-label">
                  Mobile Number <span className="req">*</span>
                </label>
                <input
                  id="biz-cust-mobile"
                  type="tel"
                  className={`kala-biz-text-input ${errors.mobile ? 'has-error' : ''}`}
                  placeholder="e.g. 9876543210"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value.replace(/[^0-9+\s-]/g, ''))
                    if (errors.mobile) setErrors((p) => ({ ...p, mobile: '' }))
                  }}
                />
                {errors.mobile && <p className="kala-biz-form-error">{errors.mobile}</p>}
              </div>

              {/* Email (Required for Bilaspur & Google Meet) */}
              {!isCall && (
                <div className="kala-biz-input-field">
                  <label htmlFor="biz-cust-email" className="kala-biz-form-label">
                    Email Address <span className="req">*</span>
                  </label>
                  <input
                    id="biz-cust-email"
                    type="email"
                    className={`kala-biz-text-input ${errors.email ? 'has-error' : ''}`}
                    placeholder="e.g. rahul@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors((p) => ({ ...p, email: '' }))
                    }}
                  />
                  {errors.email && <p className="kala-biz-form-error">{errors.email}</p>}
                </div>
              )}

              {/* Company / College / Team Name */}
              {!isCall && (
                <div className="kala-biz-input-field">
                  <label htmlFor="biz-cust-org" className="kala-biz-form-label">
                    Company / College / Team <span className="req">*</span>
                  </label>
                  <input
                    id="biz-cust-org"
                    type="text"
                    className={`kala-biz-text-input ${errors.organization ? 'has-error' : ''}`}
                    placeholder="e.g. Nexus Tech / IIT Bombay"
                    value={organization}
                    onChange={(e) => {
                      setOrganization(e.target.value)
                      if (errors.organization) setErrors((p) => ({ ...p, organization: '' }))
                    }}
                  />
                  {errors.organization && <p className="kala-biz-form-error">{errors.organization}</p>}
                </div>
              )}
            </div>

            {/* Requirement / Notes */}
            <div className="kala-biz-form-group">
              <label htmlFor="biz-cust-req" className="kala-biz-form-label">
                Requirement Details <span className="req">*</span>
              </label>
              <textarea
                id="biz-cust-req"
                rows={2}
                className={`kala-biz-textarea ${errors.requirement ? 'has-error' : ''}`}
                placeholder="Mention sizes, expected delivery date, or special branding requirements"
                value={requirement}
                onChange={(e) => {
                  setRequirement(e.target.value)
                  if (errors.requirement) setErrors((p) => ({ ...p, requirement: '' }))
                }}
              />
              {errors.requirement && <p className="kala-biz-form-error">{errors.requirement}</p>}
            </div>

            {/* Server Error Notice */}
            {submitError && (
              <div className="kala-biz-server-error-banner" role="alert">
                <span>{submitError}</span>
              </div>
            )}

            {/* Form Actions */}
            <div className="kala-biz-modal-actions">
              <button
                type="button"
                className="kala-biz-btn-cancel"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="kala-btn kala-btn-primary kala-biz-submit-btn"
              >
                {isSubmitting ? (
                  <span>Submitting request...</span>
                ) : (
                  <span>
                    {isBilaspur && 'Confirm Bilaspur Meeting'}
                    {isMeet && 'Confirm Google Meet'}
                    {isCall && 'Request Callback'}
                  </span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default MeetingSchedulerModal
