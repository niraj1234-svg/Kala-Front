import React, { useState, useEffect, useRef } from 'react'
import { saveBusinessRequest } from '../types/requests'
import {
  createBusinessRequest,
  type BackendBusinessRequest,
} from '../services/businessRequestApi'
import '../styles/BusinessBranding.css'

export const BusinessBranding: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Form State
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [organizationType, setOrganizationType] = useState('Company')
  const [apparelRequired, setApparelRequired] = useState('T-Shirts')
  const [quantity, setQuantity] = useState('51–100')
  const [requiredBy, setRequiredBy] = useState('')
  const [brandingRequirements, setBrandingRequirements] = useState('Logo')
  const [details, setDetails] = useState('')

  // Validation & Submission State
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submittedQuote, setSubmittedQuote] = useState<BackendBusinessRequest | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formRef = useRef<HTMLDivElement>(null)
  const solutionsRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = heroRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    heroRef.current.style.setProperty('--b-mouse-x', x.toFixed(3))
    heroRef.current.style.setProperty('--b-mouse-y', y.toFixed(3))
  }

  const handleHeroMouseLeave = () => {
    if (!heroRef.current) return
    heroRef.current.style.setProperty('--b-mouse-x', '0')
    heroRef.current.style.setProperty('--b-mouse-y', '0')
  }

  const scrollToForm = (prefillOrgType?: string, prefillApparel?: string) => {
    if (prefillOrgType) setOrganizationType(prefillOrgType)
    if (prefillApparel) setApparelRequired(prefillApparel)
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToSolutions = () => {
    solutionsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Please enter contact person name.'
    }

    if (!organization.trim()) {
      newErrors.organization = 'Please enter company or organization name.'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      newErrors.email = 'Please enter a work or contact email.'
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.'
    }

    const phoneRegex = /^[0-9+\s-]{7,15}$/
    if (!phone.trim()) {
      newErrors.phone = 'Please enter a contact phone number.'
    } else if (!phoneRegex.test(phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number (7-15 digits).'
    }

    if (!requiredBy) {
      newErrors.requiredBy = 'Please specify your target delivery deadline.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await createBusinessRequest({
        name: name.trim(),
        organization: organization.trim(),
        email: email.trim(),
        phone: phone.trim(),
        organizationType,
        apparelRequired,
        quantity,
        requiredBy,
        brandingRequirements,
        details: details.trim() || undefined,
      })

      if (response && response.success && response.requestId) {
        setSubmittedQuote(response.request)

        // Compatibility cache in localStorage
        try {
          saveBusinessRequest({
            id: response.requestId,
            createdAt: response.request.createdAt,
            name: response.request.name,
            organization: response.request.organization,
            email: response.request.email,
            phone: response.request.phone,
            organizationType: response.request.organizationType,
            apparelRequired: response.request.apparelRequired,
            quantity: response.request.quantity,
            requiredBy: response.request.requiredBy,
            brandingRequirements: response.request.brandingRequirements,
            details: response.request.details,
            status: 'Quote Requested',
          })
        } catch {
          // localStorage failure shouldn't block successful UI presentation
        }

        // Scroll to success card
        setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 50)
      } else {
        throw new Error(response?.message || 'Failed to submit quote request.')
      }
    } catch (err: any) {
      console.error('[BusinessBranding] Submission error:', err)
      setSubmitError(
        err.message || 'Unable to submit your quote request right now. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetForm = () => {
    setName('')
    setOrganization('')
    setEmail('')
    setPhone('')
    setOrganizationType('Company')
    setApparelRequired('T-Shirts')
    setQuantity('51–100')
    setRequiredBy('')
    setBrandingRequirements('Logo')
    setDetails('')
    setErrors({})
    setSubmitError(null)
    setSubmittedQuote(null)
  }

  // Business Solutions Visual Cards Data
  const solutions = [
    {
      id: 'corporate-merch',
      num: '01',
      category: 'WORKPLACE',
      title: 'CORPORATE MERCH',
      image: '/business-branding/solution-card-01.jpg',
      annotation: 'YOUR BRAND EVERYWHERE',
      orgType: 'Company',
      apparel: 'T-Shirts',
      isWide: false,
    },
    {
      id: 'event-merch',
      num: '02',
      category: 'EXPERIENCES',
      title: 'EVENT MERCH',
      image: '/business-branding/solution-card-02.jpg',
      annotation: 'MAKE EVENTS MEMORABLE',
      orgType: 'Event',
      apparel: 'T-Shirts',
      isWide: false,
    },
    {
      id: 'team-apparel',
      num: '03',
      category: 'ATHLETICS & ESPORTS',
      title: 'TEAM APPAREL',
      image: '/business-branding/solution-card-03.jpg',
      annotation: 'PLAY TOGETHER',
      orgType: 'Sports Team',
      apparel: 'Jerseys',
      isWide: false,
    },
    {
      id: 'brand-merchandise',
      num: '04',
      category: 'RETAIL & PROMO',
      title: 'BRAND MERCHANDISE',
      image: '/business-branding/solution-card-04.jpg',
      annotation: 'YOUR BRAND EVERYWHERE',
      orgType: 'Creator / Community',
      apparel: 'Hoodies',
      isWide: false,
    },
    {
      id: 'college-university',
      num: '05',
      category: 'CAMPUS LIFE',
      title: 'COLLEGE & UNIVERSITY',
      image: '/business-branding/solution-card-05.jpg',
      annotation: 'CAMPUS CULTURE',
      orgType: 'College',
      apparel: 'Hoodies',
      isWide: true,
    },
    {
      id: 'startups',
      num: '06',
      category: 'FOUNDER SUITE',
      title: 'STARTUPS',
      image: '/business-branding/solution-card-06.jpg',
      annotation: 'IDEAS INTO IDENTITY',
      orgType: 'Startup',
      apparel: 'Oversized T-Shirts',
      isWide: true,
    },
  ]

  return (
    <main className="kala-business-page">
      {/* 1. HERO SECTION (Editorial Corporate Streetwear) */}
      <section
        ref={heroRef}
        className="kala-business-editorial-section"
        aria-labelledby="business-hero-title"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        <div className="kala-business-editorial-container">
          <div className="kala-business-editorial-grid">
            {/* Left Column: Typography, Annotation, CTAs */}
            <div className="kala-business-left-content">
              {/* Eyebrow with line */}
              <div className="kala-b-eyebrow-row">
                <span className="kala-b-eyebrow-badge">CORPORATE &amp; MERCH</span>
                <span className="kala-b-eyebrow-rule" aria-hidden="true" />
              </div>

              {/* Main Heading */}
              <h1 id="business-hero-title" className="kala-b-display-title">
                BRAND IT.<br />
                <span className="kala-b-wear-word">
                  WEAR IT.
                  <svg className="kala-b-underline-svg" viewBox="0 0 240 18" fill="none" aria-hidden="true">
                    <path d="M4 12C65 5 180 6 236 12" stroke="#111111" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              {/* Description */}
              <p className="kala-b-desc-text">
                Custom apparel for teams, brands &amp; events.
              </p>

              {/* CTAs */}
              <div className="kala-b-buttons-row">
                <button
                  type="button"
                  className="kala-b-cta-btn kala-b-cta-primary"
                  onClick={() => scrollToForm()}
                >
                  <span className="kala-b-btn-inner">
                    <svg
                      className="kala-b-btn-icon"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <span>REQUEST A QUOTE</span>
                  </span>
                  <svg
                    className="kala-b-btn-arrow"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="kala-b-cta-btn kala-b-cta-secondary"
                  onClick={scrollToSolutions}
                >
                  <span className="kala-b-btn-inner">
                    <svg
                      className="kala-b-btn-icon"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span>EXPLORE MERCH</span>
                  </span>
                  <svg
                    className="kala-b-btn-arrow"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right Column: Editorial Corporate Streetwear Collage */}
            <div className="kala-business-right-collage" aria-hidden="true">
              {/* Vertical Orange Paint Splatter / Brush Stroke */}
              <div className="kala-b-parallax-orange">
                <div className="kala-b-float-orange">
                  <div className="kala-b-orange-splash" />
                </div>
              </div>

              {/* Annotation between Heading & Collage */}
              <div className="kala-b-annotation-mid">
                <span className="kala-b-ann-line">TEAMS</span>
                <span className="kala-b-ann-line">EVENTS</span>
                <span className="kala-b-ann-line">BRANDS</span>
                <span className="kala-b-ann-line">COMMUNITIES</span>
                <svg className="kala-b-ann-curve" viewBox="0 0 90 12" fill="none">
                  <path d="M2 8C28 4 62 4 88 8" stroke="#D94700" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>

              {/* Central White Board Frame with Main Black T-Shirt */}
              <div className="kala-b-parallax-main">
                <div className="kala-b-float-main">
                  <div className="kala-b-shirt-polaroid-frame">
                    <img
                      src="/business-branding/kala-corporate-tee.jpg"
                      alt="KALA Corporate Streetwear T-Shirt"
                      className="kala-b-shirt-img"
                      loading="eager"
                    />
                  </div>
                </div>
              </div>

              {/* Left Overlapping Polaroid Detail Card */}
              <div className="kala-b-parallax-detail">
                <div className="kala-b-float-detail">
                  <div className="kala-b-detail-polaroid">
                    <div className="kala-b-polaroid-tape" />
                    <div className="kala-b-polaroid-inner">
                      <img
                        src="/business-branding/kala-corporate-detail.jpg"
                        alt="KALA Apparel Fabric & Brand Detail"
                        className="kala-b-polaroid-img"
                        loading="eager"
                      />
                    </div>
                    <div className="kala-b-polaroid-caption">
                      <span>YOUR BRAND.</span>
                      <span>OUR CRAFT.</span>
                      <div className="kala-b-caption-spark">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M2 10L6 7M5 4L8 6" stroke="#D94700" strokeWidth="2.2" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                    {/* Curved Arrow to Main Shirt */}
                    <div className="kala-b-arrow-connector">
                      <svg width="40" height="28" viewBox="0 0 40 28" fill="none">
                        <path d="M4 14C14 4 28 8 36 20" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M30 20L36 21L37 14" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Stack of 5 Compact Category Cards */}
              <div className="kala-b-parallax-stack">
                <div className="kala-b-category-stack">
                  <div className="kala-b-cat-card">
                    <svg className="kala-b-cat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18M3 7v14M21 7v14M6 11h2M6 15h2M10 11h2M10 15h2M14 11h2M14 15h2M9 3h6v4H9z" />
                    </svg>
                    <span>Startups</span>
                  </div>
                  <div className="kala-b-cat-card">
                    <svg className="kala-b-cat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>Colleges</span>
                  </div>
                  <div className="kala-b-cat-card">
                    <svg className="kala-b-cat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Events</span>
                  </div>
                  <div className="kala-b-cat-card">
                    <svg className="kala-b-cat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    <span>Businesses</span>
                  </div>
                  <div className="kala-b-cat-card">
                    <svg className="kala-b-cat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                      <path d="M4 22h16M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v3h10v-3c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34" />
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
                    </svg>
                    <span>Sports Teams</span>
                  </div>

                  {/* Double-ended Doodle Arrow */}
                  <div className="kala-b-cat-doodle-arrow">
                    <svg width="26" height="16" viewBox="0 0 28 16" fill="none">
                      <path d="M2 8C8 3 20 3 26 8" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M6 4L2 8L6 12M22 4L26 8L22 12" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Top-Right Marker: MORE THAN MERCH */}
              <div className="kala-b-more-merch-box">
                <div className="kala-b-mm-sparks">
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                    <path d="M3 10L1 2M8 10L10 2M14 10L17 3" stroke="#D94700" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="kala-b-mm-text">MORE</span>
                <span className="kala-b-mm-text">THAN</span>
                <span className="kala-b-mm-text">MERCH</span>
                <svg className="kala-b-mm-stroke" viewBox="0 0 95 12" fill="none">
                  <path d="M2 8C28 4 68 4 92 8" stroke="#D94700" strokeWidth="3.2" strokeLinecap="round" />
                </svg>
              </div>

              {/* Bottom-Right Horizontal Orange Taped Banner */}
              <div className="kala-b-bottom-banner">
                <div className="kala-b-banner-sparks">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 14L13 2M14 10L16 6M7 16L11 14" stroke="#D94700" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="kala-b-bb-text-wrap">
                  <span className="kala-b-bb-sub">APPAREL</span>
                  <span className="kala-b-bb-main">FOR REAL IMPACT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BUSINESS SOLUTIONS */}
      <section ref={solutionsRef} id="solutions" className="kala-solutions-section">
        <div className="kala-container">
          {/* Header with visual typography, watermark, and handwritten annotation */}
          <div className="kala-solutions-header-wrap">
            <div className="kala-solutions-header-left">
              <div className="kala-solutions-eyebrow">
                <span className="kala-solutions-eyebrow-arrow">&rarr;</span>
                <span>BUSINESS SOLUTIONS</span>
                <span className="kala-solutions-eyebrow-line"></span>
              </div>
              <h2 className="kala-solutions-heading">
                <span className="kala-solutions-heading-dark">TAILORED APPAREL</span>
                <span className="kala-solutions-heading-orange">FOR EVERY VISION.</span>
              </h2>
              <div className="kala-solutions-heading-brush" aria-hidden="true"></div>
              <p className="kala-solutions-subtext">
                Custom apparel for teams, brands &amp; events.
              </p>
            </div>

            {/* Faint KALA background watermark */}
            <div className="kala-solutions-watermark" aria-hidden="true">
              KALA
            </div>

            {/* Handwritten-style annotation toward the right */}
            <div className="kala-solutions-annotation">
              <div className="kala-solutions-annotation-items">
                <span>TEAMS</span>
                <span>BRANDS</span>
                <span>EVENTS</span>
                <span>COMMUNITIES</span>
              </div>
              <svg
                className="kala-solutions-annotation-stroke"
                viewBox="0 0 120 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M3 9C35 4 80 4 117 8"
                  stroke="#E85A2A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* 6 Visual Business Solution Cards (4 equal top row + 2 wide bottom row) */}
          <div className="kala-solutions-visual-grid">
            {solutions.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`kala-sol-card ${item.isWide ? 'kala-sol-card-wide' : ''}`}
                onClick={() => scrollToForm(item.orgType, item.apparel)}
                aria-label={`Request custom apparel for ${item.title} (${item.category})`}
              >
                <div className="kala-sol-card-media">
                  <img
                    src={item.image}
                    alt={`${item.category}: ${item.title}`}
                    className="kala-sol-card-img"
                    loading="lazy"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. BUSINESS QUOTE FORM (COMMERCIAL INQUIRY SPLIT LAYOUT) */}
      <section ref={formRef} id="quote-form" className="kala-b2b-quote-section">
        <div className="kala-b2b-quote-container">
          {/* LEFT SIDE — INTRODUCTION */}
          <div className="kala-b2b-quote-intro">
            <span className="kala-b2b-quote-eyebrow">COMMERCIAL INQUIRY</span>
            <h2 className="kala-b2b-quote-heading">
              <span className="kala-b2b-heading-dark">REQUEST A</span>
              <span className="kala-b2b-heading-orange">BUSINESS QUOTE</span>
            </h2>
            <p className="kala-b2b-quote-desc">
              Submit your organizational requirements and our commercial sales lead will prepare a custom proposal within 24 hours.
            </p>
          </div>

          {/* RIGHT SIDE — FORM CARD */}
          <div className="kala-b2b-quote-card-wrap">
            {submittedQuote ? (
              <div className="kala-quote-success-card">
                <div className="kala-quote-success-check">✓</div>
                <h3 className="kala-h2" style={{ marginBottom: '0.75rem' }}>
                  QUOTE REQUEST RECEIVED
                </h3>
                <p className="kala-body" style={{ color: 'var(--kala-text-secondary)', marginBottom: '1.5rem' }}>
                  Our team has received your requirements. A dedicated B2B account specialist will reach out with pricing tiers, swatch recommendations, and production timelines.
                </p>

                <div
                  style={{
                    backgroundColor: 'var(--kala-bg-warm)',
                    border: '1px solid var(--kala-border)',
                    padding: '1.25rem',
                    marginBottom: '2rem',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid var(--kala-border)', paddingBottom: '0.5rem' }}>
                    <span className="kala-label">REFERENCE:</span>
                    <span style={{ fontWeight: 700, color: 'var(--kala-orange)' }}>{submittedQuote.requestId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--kala-text-secondary)' }}>Organization:</span>
                    <span style={{ fontWeight: 600 }}>{submittedQuote.organization}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--kala-text-secondary)' }}>Contact:</span>
                    <span style={{ fontWeight: 600 }}>{submittedQuote.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--kala-text-secondary)' }}>Apparel Required:</span>
                    <span style={{ fontWeight: 600 }}>{submittedQuote.apparelRequired}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--kala-text-secondary)' }}>Quantity Tier:</span>
                    <span style={{ fontWeight: 600 }}>{submittedQuote.quantity} Units</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--kala-text-secondary)' }}>Required By:</span>
                    <span style={{ fontWeight: 600 }}>{submittedQuote.requiredBy}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--kala-text-secondary)' }}>Status:</span>
                    <span style={{ fontWeight: 700, color: 'var(--kala-black)' }}>{submittedQuote.status.toUpperCase()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="kala-cta-btn kala-cta-primary"
                  onClick={handleResetForm}
                  style={{ minWidth: '240px', justifyContent: 'center' }}
                >
                  <span className="kala-cta-content">
                    <span>SUBMIT ANOTHER QUOTE</span>
                  </span>
                </button>
              </div>
            ) : (
              <div className="kala-b2b-quote-card">
                <form onSubmit={handleSubmit} noValidate>
                  {/* SECTION 1 — CONTACT DETAILS */}
                  <div className="kala-b2b-form-section">
                    <div className="kala-b2b-section-header">
                      <span className="kala-b2b-section-badge">1</span>
                      <h3 className="kala-b2b-section-title">Contact Details</h3>
                      <div className="kala-b2b-section-divider" aria-hidden="true" />
                    </div>

                    <div className="kala-b2b-grid two-col">
                      <div className="kala-b2b-field">
                        <label className="kala-b2b-label" htmlFor="quote-name">
                          Contact Name <span className="kala-b2b-req">*</span>
                        </label>
                        <div className="kala-b2b-input-wrap">
                          <span className="kala-b2b-input-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </span>
                          <input
                            id="quote-name"
                            type="text"
                            className={`kala-b2b-input ${errors.name ? 'error' : ''}`}
                            placeholder="e.g. Vikram Sharma"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value)
                              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
                              if (submitError) setSubmitError(null)
                            }}
                          />
                        </div>
                        {errors.name && <p className="kala-form-error">{errors.name}</p>}
                      </div>

                      <div className="kala-b2b-field">
                        <label className="kala-b2b-label" htmlFor="quote-org">
                          Company / Organization <span className="kala-b2b-req">*</span>
                        </label>
                        <div className="kala-b2b-input-wrap">
                          <span className="kala-b2b-input-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="4" y="2" width="16" height="20" rx="2" />
                              <path d="M9 22v-4h6v4" />
                              <path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
                            </svg>
                          </span>
                          <input
                            id="quote-org"
                            type="text"
                            className={`kala-b2b-input ${errors.organization ? 'error' : ''}`}
                            placeholder="e.g. Acme Tech Labs"
                            value={organization}
                            onChange={(e) => {
                              setOrganization(e.target.value)
                              if (errors.organization) setErrors((prev) => ({ ...prev, organization: '' }))
                              if (submitError) setSubmitError(null)
                            }}
                          />
                        </div>
                        {errors.organization && <p className="kala-form-error">{errors.organization}</p>}
                      </div>

                      <div className="kala-b2b-field">
                        <label className="kala-b2b-label" htmlFor="quote-email">
                          Work Email <span className="kala-b2b-req">*</span>
                        </label>
                        <div className="kala-b2b-input-wrap">
                          <span className="kala-b2b-input-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                          </span>
                          <input
                            id="quote-email"
                            type="email"
                            className={`kala-b2b-input ${errors.email ? 'error' : ''}`}
                            placeholder="e.g. vikram@acmelabs.com"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value)
                              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
                              if (submitError) setSubmitError(null)
                            }}
                          />
                        </div>
                        {errors.email && <p className="kala-form-error">{errors.email}</p>}
                      </div>

                      <div className="kala-b2b-field">
                        <label className="kala-b2b-label" htmlFor="quote-phone">
                          Phone Number <span className="kala-b2b-req">*</span>
                        </label>
                        <div className="kala-b2b-input-wrap">
                          <span className="kala-b2b-input-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                          </span>
                          <input
                            id="quote-phone"
                            type="tel"
                            className={`kala-b2b-input ${errors.phone ? 'error' : ''}`}
                            placeholder="e.g. +91 98765 43210"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value)
                              if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }))
                              if (submitError) setSubmitError(null)
                            }}
                          />
                        </div>
                        {errors.phone && <p className="kala-form-error">{errors.phone}</p>}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2 — ORGANIZATION & REQUIREMENTS */}
                  <div className="kala-b2b-form-section">
                    <div className="kala-b2b-section-header">
                      <span className="kala-b2b-section-badge">2</span>
                      <h3 className="kala-b2b-section-title">Organization & Requirements</h3>
                      <div className="kala-b2b-section-divider" aria-hidden="true" />
                    </div>

                    <div className="kala-b2b-grid two-col">
                      <div className="kala-b2b-field">
                        <label className="kala-b2b-label" htmlFor="quote-org-type">
                          Organization Type
                        </label>
                        <div className="kala-b2b-input-wrap select-wrap">
                          <span className="kala-b2b-input-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="4" y="2" width="16" height="20" rx="2" />
                              <path d="M9 22v-4h6v4" />
                              <path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
                            </svg>
                          </span>
                          <select
                            id="quote-org-type"
                            className="kala-b2b-select"
                            value={organizationType}
                            onChange={(e) => setOrganizationType(e.target.value)}
                          >
                            <option value="Company">Company</option>
                            <option value="Startup">Startup</option>
                            <option value="College">College</option>
                            <option value="School">School</option>
                            <option value="Sports Team">Sports Team</option>
                            <option value="Event">Event</option>
                            <option value="Creator / Community">Creator / Community</option>
                            <option value="Other">Other</option>
                          </select>
                          <span className="kala-b2b-chevron" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </span>
                        </div>
                      </div>

                      <div className="kala-b2b-field">
                        <label className="kala-b2b-label" htmlFor="quote-apparel">
                          Apparel Required
                        </label>
                        <div className="kala-b2b-input-wrap select-wrap">
                          <span className="kala-b2b-input-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                            </svg>
                          </span>
                          <select
                            id="quote-apparel"
                            className="kala-b2b-select"
                            value={apparelRequired}
                            onChange={(e) => setApparelRequired(e.target.value)}
                          >
                            <option value="T-Shirts">T-Shirts</option>
                            <option value="Oversized T-Shirts">Oversized T-Shirts</option>
                            <option value="Hoodies">Hoodies</option>
                            <option value="Jerseys">Jerseys</option>
                            <option value="Tracksuits">Tracksuits</option>
                            <option value="Mixed Apparel">Mixed Apparel</option>
                          </select>
                          <span className="kala-b2b-chevron" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </span>
                        </div>
                      </div>

                      <div className="kala-b2b-field">
                        <label className="kala-b2b-label" htmlFor="quote-quantity">
                          Estimated Quantity
                        </label>
                        <div className="kala-b2b-input-wrap select-wrap">
                          <span className="kala-b2b-input-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                              <line x1="12" y1="22.08" x2="12" y2="12" />
                            </svg>
                          </span>
                          <select
                            id="quote-quantity"
                            className="kala-b2b-select"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                          >
                            <option value="1–20">1–20 units</option>
                            <option value="21–50">21–50 units</option>
                            <option value="51–100">51–100 units</option>
                            <option value="101–250">101–250 units</option>
                            <option value="251–500">251–500 units</option>
                            <option value="500+">500+ units</option>
                          </select>
                          <span className="kala-b2b-chevron" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </span>
                        </div>
                      </div>

                      <div className="kala-b2b-field">
                        <label className="kala-b2b-label" htmlFor="quote-required-by">
                          Required by Date <span className="kala-b2b-req">*</span>
                        </label>
                        <div className="kala-b2b-input-wrap">
                          <span className="kala-b2b-input-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                          </span>
                          <input
                            id="quote-required-by"
                            type="date"
                            className={`kala-b2b-input ${errors.requiredBy ? 'error' : ''}`}
                            value={requiredBy}
                            onChange={(e) => {
                              setRequiredBy(e.target.value)
                              if (errors.requiredBy) setErrors((prev) => ({ ...prev, requiredBy: '' }))
                              if (submitError) setSubmitError(null)
                            }}
                          />
                        </div>
                        {errors.requiredBy && <p className="kala-form-error">{errors.requiredBy}</p>}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3 — BRANDING & ADDITIONAL DETAILS */}
                  <div className="kala-b2b-form-section">
                    <div className="kala-b2b-section-header">
                      <span className="kala-b2b-section-badge">3</span>
                      <h3 className="kala-b2b-section-title">Branding & Additional Details</h3>
                      <div className="kala-b2b-section-divider" aria-hidden="true" />
                    </div>

                    <div className="kala-b2b-field full-width">
                      <label className="kala-b2b-label" htmlFor="quote-branding">
                        Branding Requirements
                      </label>
                      <div className="kala-b2b-input-wrap select-wrap">
                        <span className="kala-b2b-input-icon" aria-hidden="true">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                            <line x1="7" y1="7" x2="7.01" y2="7" />
                          </svg>
                        </span>
                        <select
                          id="quote-branding"
                          className="kala-b2b-select"
                          value={brandingRequirements}
                          onChange={(e) => setBrandingRequirements(e.target.value)}
                        >
                          <option value="Logo">Logo Placement</option>
                          <option value="Custom Design">Custom Design & Artwork</option>
                          <option value="Embroidery">Embroidery Only</option>
                          <option value="Printing">Printing (Screen / DTF)</option>
                          <option value="Multiple Branding Locations">Multiple Branding Locations</option>
                          <option value="Other">Other / Full Custom</option>
                        </select>
                        <span className="kala-b2b-chevron" aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </span>
                      </div>
                    </div>

                    <div className="kala-b2b-field full-width" style={{ marginTop: '1rem' }}>
                      <label className="kala-b2b-label" htmlFor="quote-details">
                        Additional Details / Project Notes
                      </label>
                      <textarea
                        id="quote-details"
                        className="kala-b2b-textarea"
                        placeholder="Share details about your brand guidelines, color palettes, event timeline, packaging expectations, or multiple shipping addresses..."
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                      />
                    </div>
                  </div>

                  {submitError && (
                    <div
                      className="kala-form-error-banner"
                      style={{
                        color: '#b91c1c',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        padding: '0.85rem',
                        marginBottom: '1.25rem',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                      role="alert"
                    >
                      <span style={{ fontWeight: 700 }}>✕</span>
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="kala-b2b-submit-btn"
                    disabled={isSubmitting}
                  >
                    <span className="kala-b2b-submit-content">
                      {isSubmitting ? (
                        <svg className="kala-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      )}
                      <span>{isSubmitting ? 'SUBMITTING REQUEST...' : 'REQUEST B2B QUOTE'}</span>
                      {!isSubmitting && <span className="kala-b2b-arrow">&rarr;</span>}
                    </span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default BusinessBranding
