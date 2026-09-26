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

  // Form Options Constants
  const ORGANIZATION_TYPES = [
    'Company',
    'Startup',
    'College / University',
    'School',
    'Sports Team',
    'Gym / Fitness Brand',
    'Event / Community',
    'Creator / Personal Brand',
    'Other',
  ]

  const APPAREL_OPTIONS = [
    'T-Shirts',
    'Oversized T-Shirts',
    'Hoodies',
    'Jerseys',
    'Gymwear',
    'Tracksuits',
    'Caps',
    'Tote / Carry Bags',
    'Custom Apparel',
    'Other',
  ]

  const QUANTITY_OPTIONS = [
    'Under 25',
    '25–50',
    '51–100',
    '101–250',
    '251–500',
    '500–1000',
    '1000+',
  ]

  const DISCUSSION_TOPICS = [
    'Custom T-Shirt Design',
    'Logo / Brand Printing',
    'Team Apparel',
    'College / Event Merchandise',
    'Corporate Apparel',
    'Gym / Fitness Apparel',
    'Custom Packaging',
    'Full Brand Merchandise',
    'Other',
  ]

  const MEETING_METHODS = [
    { id: 'Phone Call', label: 'Phone Call' },
    { id: 'WhatsApp', label: 'WhatsApp' },
    { id: 'Google Meet', label: 'Google Meet' },
    { id: 'In-Person Meeting', label: 'In-Person Meeting' },
  ]

  const MEETING_TIMES = [
    'Morning (9 AM – 12 PM)',
    'Afternoon (12 PM – 3 PM)',
    'Evening (3 PM – 6 PM)',
    'Anytime',
  ]

  // Form State
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [organizationType, setOrganizationType] = useState('Company')
  const [apparelTypes, setApparelTypes] = useState<string[]>(['T-Shirts'])
  const [estimatedQuantity, setEstimatedQuantity] = useState('51–100')
  const [discussionTopics, setDiscussionTopics] = useState<string[]>([
    'Custom T-Shirt Design',
    'Logo / Brand Printing',
  ])
  const [projectDetails, setProjectDetails] = useState('')
  const [preferredMeetingMethod, setPreferredMeetingMethod] = useState('Phone Call')
  const [preferredMeetingTime, setPreferredMeetingTime] = useState('Anytime')

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

  const toggleApparel = (item: string) => {
    setApparelTypes((prev) => {
      const exists = prev.includes(item)
      const next = exists ? prev.filter((i) => i !== item) : [...prev, item]
      if (errors.apparelTypes && next.length > 0) {
        setErrors((e) => ({ ...e, apparelTypes: '' }))
      }
      return next
    })
  }

  const toggleTopic = (item: string) => {
    setDiscussionTopics((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )
  }

  const scrollToForm = (prefillOrgType?: string, prefillApparel?: string) => {
    if (prefillOrgType) {
      const matched = ORGANIZATION_TYPES.find(
        (o) =>
          o.toLowerCase() === prefillOrgType.toLowerCase() ||
          prefillOrgType.toLowerCase().includes(o.toLowerCase()) ||
          o.toLowerCase().includes(prefillOrgType.toLowerCase())
      )
      if (matched) setOrganizationType(matched)
    }
    if (prefillApparel) {
      setApparelTypes((prev) =>
        prev.includes(prefillApparel) ? prev : [...prev, prefillApparel]
      )
    }
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToSolutions = () => {
    solutionsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Please enter your contact name.'
    }

    if (!organization.trim()) {
      newErrors.organization = 'Please enter your company or organization name.'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      newErrors.email = 'Please enter your work email.'
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid work email address.'
    }

    const phoneRegex = /^[0-9+\s-]{7,15}$/
    if (!phone.trim()) {
      newErrors.phone = 'Please enter your contact phone number.'
    } else if (!phoneRegex.test(phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number (7-15 digits).'
    }

    if (apparelTypes.length === 0) {
      newErrors.apparelTypes = 'Please select at least one apparel category you are interested in.'
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
        apparelTypes,
        apparelRequired: apparelTypes.join(', '),
        estimatedQuantity,
        quantity: estimatedQuantity,
        discussionTopics,
        brandingRequirements: discussionTopics.join(', ') || 'Custom Branding',
        projectDetails: projectDetails.trim() || undefined,
        details: projectDetails.trim() || undefined,
        preferredMeetingMethod,
        preferredMeetingTime,
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
            requiredBy: response.request.requiredBy || 'To be discussed',
            brandingRequirements: response.request.brandingRequirements,
            details: response.request.details,
            status: 'Meeting Requested',
          })
        } catch {
          // localStorage failure shouldn't block successful UI presentation
        }

        // Scroll to success card
        setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 50)
      } else {
        throw new Error(response?.message || 'Failed to submit meeting request.')
      }
    } catch (err: any) {
      console.error('[BusinessBranding] Submission error:', err)
      setSubmitError(
        err.message || 'Unable to submit your meeting request right now. Please try again.'
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
    setApparelTypes(['T-Shirts'])
    setEstimatedQuantity('51–100')
    setDiscussionTopics(['Custom T-Shirt Design', 'Logo / Brand Printing'])
    setProjectDetails('')
    setPreferredMeetingMethod('Phone Call')
    setPreferredMeetingTime('Anytime')
    setErrors({})
    setSubmitError(null)
    setSubmittedQuote(null)
  }

  // Business Solutions Visual Cards Data (Referencing high-res photography assets)
  const solutions = [
    {
      id: 'corporate-merch',
      num: '01',
      category: 'WORKPLACE',
      title: 'CORPORATE\nMERCH',
      image: '/business-branding/card-01-corporate-merch.jpg',
      orgType: 'Company',
      apparel: 'T-Shirts',
      isWide: false,
    },
    {
      id: 'event-merch',
      num: '02',
      category: 'EXPERIENCES',
      title: 'EVENT\nMERCH',
      image: '/business-branding/card-02-event-merch.jpg',
      orgType: 'Event',
      apparel: 'T-Shirts',
      isWide: false,
    },
    {
      id: 'team-apparel',
      num: '03',
      category: 'ATHLETICS & ESPORTS',
      title: 'TEAM\nAPPAREL',
      image: '/business-branding/card-03-team-apparel.jpg',
      orgType: 'Sports Team',
      apparel: 'Jerseys',
      isWide: false,
    },
    {
      id: 'brand-merchandise',
      num: '04',
      category: 'RETAIL & PROMO',
      title: 'BRAND\nMERCHANDISE',
      image: '/business-branding/card-04-brand-merchandise.jpg',
      orgType: 'Creator / Community',
      apparel: 'Hoodies',
      isWide: false,
    },
    {
      id: 'college-university',
      num: '05',
      category: 'CAMPUS LIFE',
      title: 'COLLEGE &\nUNIVERSITY',
      image: '/business-branding/card-05-college-university.jpg',
      orgType: 'College',
      apparel: 'Hoodies',
      isWide: true,
    },
    {
      id: 'startups',
      num: '06',
      category: 'FOUNDER SUITE',
      title: 'STARTUPS',
      image: '/business-branding/card-06-startups.jpg',
      orgType: 'Startup',
      apparel: 'Oversized T-Shirts',
      isWide: true,
    },
  ]

  const renderSolutionIcon = (id: string) => {
    switch (id) {
      case 'corporate-merch':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        )
      case 'event-merch':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        )
      case 'team-apparel':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        )
      case 'brand-merchandise':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        )
      case 'college-university':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        )
      case 'startups':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
          </svg>
        )
      default:
        return null
    }
  }

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
          {/* Header with visual typography and handwritten annotation (faded KALA watermark removed) */}
          <div className="kala-solutions-header-wrap">
            <div className="kala-solutions-header-left">
              <div className="kala-solutions-eyebrow">
                <span className="kala-solutions-eyebrow-arrow" aria-hidden="true">&rarr;</span>
                <span>BUSINESS SOLUTIONS</span>
                <span className="kala-solutions-eyebrow-arrow" aria-hidden="true">&larr;</span>
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
          </div>

          {/* 6 Visual Business Solution Cards (4 equal top row + 2 wide bottom row) */}
          <div className="kala-solutions-visual-grid">
            {solutions.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`kala-sol-card ${item.isWide ? 'kala-sol-card-wide' : ''}`}
                onClick={() => scrollToForm(item.orgType, item.apparel)}
                aria-label={`Request custom apparel for ${item.title.replace('\n', ' ')} (${item.category})`}
              >
                <div className="kala-sol-card-inner">
                  {/* High-Resolution Product Photography Layer */}
                  <div className="kala-sol-card-media">
                    <img
                      src={item.image}
                      alt={`${item.category}: ${item.title.replace('\n', ' ')}`}
                      className="kala-sol-card-img"
                      loading={item.num === '01' || item.num === '02' ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  </div>

                  {/* Top-Left Content: Number, Category, Title */}
                  <div className="kala-sol-card-header">
                    <span className="kala-sol-card-num">{item.num}</span>
                    <span className="kala-sol-card-cat">{item.category}</span>
                    <h3 className="kala-sol-card-title">
                      {item.title.split('\n').map((line, idx) => (
                        <React.Fragment key={idx}>
                          {line}
                          {idx < item.title.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </h3>
                  </div>


                  {/* Bottom-Left Category Icon */}
                  <div className="kala-sol-card-icon-badge" aria-hidden="true">
                    {renderSolutionIcon(item.id)}
                  </div>
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
            <span className="kala-b2b-quote-eyebrow">BUSINESS BRANDING</span>
            <h2 className="kala-b2b-quote-heading">
              <span className="kala-b2b-heading-dark">LET'S</span>
              <span className="kala-b2b-heading-orange">BUILD YOUR</span>
              <span className="kala-b2b-heading-dark">BRAND</span>
            </h2>
            <p className="kala-b2b-quote-desc">
              Tell us about your brand, apparel and design requirements. We'll connect with you to understand your vision and discuss the right apparel solution for your organization.
            </p>
          </div>

          {/* RIGHT SIDE — FORM CARD */}
          <div className="kala-b2b-quote-card-wrap">
            {submittedQuote ? (
              <div className="kala-quote-success-card">
                <div className="kala-quote-success-check">✓</div>
                <h3 className="kala-h2" style={{ marginBottom: '0.75rem' }}>
                  Thanks! Let's Create Something Great.
                </h3>
                <p className="kala-body" style={{ color: 'var(--kala-text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                  We've received your requirements. Our team will review the details and contact you to discuss your apparel, design and branding requirements.
                </p>

                <div className="kala-meeting-soon-banner">
                  We'll connect with you soon.
                </div>

                <div className="kala-meeting-details-box">
                  <div className="kala-meeting-row">
                    <span className="kala-meeting-label">INQUIRY REF:</span>
                    <span style={{ fontWeight: 700, color: 'var(--kala-orange)' }}>{submittedQuote.requestId}</span>
                  </div>
                  <div className="kala-meeting-row">
                    <span className="kala-meeting-label">Organization:</span>
                    <span className="kala-meeting-val">{submittedQuote.organization}</span>
                  </div>
                  <div className="kala-meeting-row">
                    <span className="kala-meeting-label">Contact:</span>
                    <span className="kala-meeting-val">{submittedQuote.name}</span>
                  </div>
                  <div className="kala-meeting-row">
                    <span className="kala-meeting-label">Email:</span>
                    <span className="kala-meeting-val">{submittedQuote.email}</span>
                  </div>
                  <div className="kala-meeting-row">
                    <span className="kala-meeting-label">Phone:</span>
                    <span className="kala-meeting-val">{submittedQuote.phone}</span>
                  </div>
                  <div className="kala-meeting-row">
                    <span className="kala-meeting-label">Apparel Interested In:</span>
                    <span className="kala-meeting-val">
                      {submittedQuote.apparelTypes && submittedQuote.apparelTypes.length > 0
                        ? submittedQuote.apparelTypes.join(', ')
                        : submittedQuote.apparelRequired}
                    </span>
                  </div>
                  <div className="kala-meeting-row">
                    <span className="kala-meeting-label">Estimated Quantity:</span>
                    <span className="kala-meeting-val">{submittedQuote.estimatedQuantity || submittedQuote.quantity} units</span>
                  </div>
                  <div className="kala-meeting-row">
                    <span className="kala-meeting-label">Preferred Meeting:</span>
                    <span className="kala-meeting-val">
                      {submittedQuote.preferredMeetingMethod || 'Phone Call'} ({submittedQuote.preferredMeetingTime || 'Anytime'})
                    </span>
                  </div>
                  <div className="kala-meeting-row">
                    <span className="kala-meeting-label">Status:</span>
                    <span style={{ fontWeight: 700, color: 'var(--kala-black)' }}>
                      {(submittedQuote.status || 'Pending').toUpperCase()}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="kala-b2b-submit-btn"
                  onClick={handleResetForm}
                  style={{ maxWidth: '340px', margin: '0 auto' }}
                >
                  <span className="kala-b2b-submit-content">
                    <span>BACK TO BUSINESS BRANDING</span>
                  </span>
                </button>
              </div>
            ) : (
              <div className="kala-b2b-quote-card">
                {/* Form Purpose Header */}
                <div className="kala-b2b-form-header">
                  <h3 className="kala-b2b-form-main-title">Let's Discuss Your Requirements</h3>
                  <p className="kala-b2b-form-main-subtitle">
                    Share a few details about your organization and what you're looking to create. Our team will get in touch to discuss your designs, apparel, branding and requirements.
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  {/* SECTION 1 — YOUR CONTACT DETAILS */}
                  <div className="kala-b2b-form-section">
                    <div className="kala-b2b-section-header">
                      <span className="kala-b2b-section-badge">1</span>
                      <h3 className="kala-b2b-section-title">Your Contact Details</h3>
                      <div className="kala-b2b-section-divider" aria-hidden="true" />
                    </div>

                    <div className="kala-b2b-grid two-col">
                      <div className="kala-b2b-field">
                        <label className="kala-b2b-label" htmlFor="meeting-name">
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
                            id="meeting-name"
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
                        <label className="kala-b2b-label" htmlFor="meeting-org">
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
                            id="meeting-org"
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
                        <label className="kala-b2b-label" htmlFor="meeting-email">
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
                            id="meeting-email"
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
                        <label className="kala-b2b-label" htmlFor="meeting-phone">
                          Phone Number <span className="kala-b2b-req">*</span>
                        </label>
                        <div className="kala-b2b-input-wrap">
                          <span className="kala-b2b-input-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                          </span>
                          <input
                            id="meeting-phone"
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

                  {/* SECTION 2 — YOUR APPAREL REQUIREMENTS */}
                  <div className="kala-b2b-form-section">
                    <div className="kala-b2b-section-header">
                      <span className="kala-b2b-section-badge">2</span>
                      <h3 className="kala-b2b-section-title">Your Apparel Requirements</h3>
                      <div className="kala-b2b-section-divider" aria-hidden="true" />
                    </div>

                    <div className="kala-b2b-grid two-col" style={{ marginBottom: '1.25rem' }}>
                      <div className="kala-b2b-field">
                        <label className="kala-b2b-label" htmlFor="meeting-org-type">
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
                            id="meeting-org-type"
                            className="kala-b2b-select"
                            value={organizationType}
                            onChange={(e) => setOrganizationType(e.target.value)}
                          >
                            {ORGANIZATION_TYPES.map((org) => (
                              <option key={org} value={org}>
                                {org}
                              </option>
                            ))}
                          </select>
                          <span className="kala-b2b-chevron" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </span>
                        </div>
                      </div>

                      <div className="kala-b2b-field">
                        <label className="kala-b2b-label" htmlFor="meeting-quantity">
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
                            id="meeting-quantity"
                            className="kala-b2b-select"
                            value={estimatedQuantity}
                            onChange={(e) => setEstimatedQuantity(e.target.value)}
                          >
                            {QUANTITY_OPTIONS.map((qty) => (
                              <option key={qty} value={qty}>
                                {qty} units
                              </option>
                            ))}
                          </select>
                          <span className="kala-b2b-chevron" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </span>
                        </div>
                        <p className="kala-b2b-field-note">
                          For discussion purposes only — helps us tailor recommendations.
                        </p>
                      </div>
                    </div>

                    {/* Multi-Select: Apparel You're Interested In */}
                    <div className="kala-b2b-field full-width">
                      <label className="kala-b2b-label">
                        Apparel You're Interested In <span className="kala-b2b-req">*</span>
                        <span style={{ fontWeight: 400, color: '#64748B', marginLeft: '6px' }}>
                          (Select all categories that apply)
                        </span>
                      </label>
                      <div className="kala-b2b-pill-group" role="group" aria-label="Select apparel categories">
                        {APPAREL_OPTIONS.map((item) => {
                          const isSelected = apparelTypes.includes(item)
                          return (
                            <button
                              key={item}
                              type="button"
                              className={`kala-b2b-pill-btn ${isSelected ? 'active' : ''}`}
                              onClick={() => toggleApparel(item)}
                              aria-pressed={isSelected}
                            >
                              <span className="kala-b2b-pill-icon" aria-hidden="true">
                                {isSelected ? '✓' : '+'}
                              </span>
                              <span>{item}</span>
                            </button>
                          )
                        })}
                      </div>
                      {errors.apparelTypes && (
                        <p className="kala-form-error" style={{ marginTop: '0.4rem' }}>
                          {errors.apparelTypes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* SECTION 3 — DESIGN & BRANDING */}
                  <div className="kala-b2b-form-section">
                    <div className="kala-b2b-section-header">
                      <span className="kala-b2b-section-badge">3</span>
                      <h3 className="kala-b2b-section-title">Design & Branding</h3>
                      <div className="kala-b2b-section-divider" aria-hidden="true" />
                    </div>

                    {/* Multi-Select: What would you like to discuss? */}
                    <div className="kala-b2b-field full-width" style={{ marginBottom: '1.25rem' }}>
                      <label className="kala-b2b-label">
                        What would you like to discuss?
                        <span style={{ fontWeight: 400, color: '#64748B', marginLeft: '6px' }}>
                          (Select topics for discussion)
                        </span>
                      </label>
                      <div className="kala-b2b-pill-group" role="group" aria-label="Select discussion topics">
                        {DISCUSSION_TOPICS.map((topic) => {
                          const isSelected = discussionTopics.includes(topic)
                          return (
                            <button
                              key={topic}
                              type="button"
                              className={`kala-b2b-pill-btn ${isSelected ? 'active' : ''}`}
                              onClick={() => toggleTopic(topic)}
                              aria-pressed={isSelected}
                            >
                              <span className="kala-b2b-pill-icon" aria-hidden="true">
                                {isSelected ? '✓' : '+'}
                              </span>
                              <span>{topic}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="kala-b2b-field full-width">
                      <label className="kala-b2b-label" htmlFor="meeting-details">
                        Tell us about your project <span style={{ fontWeight: 400, color: '#64748B' }}>(Optional)</span>
                      </label>
                      <textarea
                        id="meeting-details"
                        className="kala-b2b-textarea"
                        placeholder="Tell us about your brand, design ideas, event, team, preferred apparel, colors, printing requirements, timeline, or anything else you'd like us to know..."
                        value={projectDetails}
                        onChange={(e) => setProjectDetails(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* SECTION 4 — LET'S CONNECT */}
                  <div className="kala-b2b-form-section">
                    <div className="kala-b2b-section-header">
                      <span className="kala-b2b-section-badge">4</span>
                      <h3 className="kala-b2b-section-title">Let's Connect</h3>
                      <div className="kala-b2b-section-divider" aria-hidden="true" />
                    </div>

                    {/* Preferred Meeting Method */}
                    <div className="kala-b2b-field full-width" style={{ marginBottom: '1.25rem' }}>
                      <label className="kala-b2b-label">
                        Preferred Meeting Method
                      </label>
                      <div className="kala-b2b-methods-grid" role="radiogroup" aria-label="Preferred meeting method">
                        {MEETING_METHODS.map((method) => {
                          const isSelected = preferredMeetingMethod === method.id
                          return (
                            <button
                              key={method.id}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              className={`kala-b2b-method-card ${isSelected ? 'active' : ''}`}
                              onClick={() => setPreferredMeetingMethod(method.id)}
                            >
                              <div className="kala-b2b-method-icon" aria-hidden="true">
                                {method.id === 'Phone Call' && (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                  </svg>
                                )}
                                {method.id === 'WhatsApp' && (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                  </svg>
                                )}
                                {method.id === 'Google Meet' && (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="23 7 16 12 23 17 23 7" />
                                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                  </svg>
                                )}
                                {method.id === 'In-Person Meeting' && (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                  </svg>
                                )}
                              </div>
                              <span className="kala-b2b-method-title">{method.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Preferred Time to Connect */}
                    <div className="kala-b2b-field full-width">
                      <label className="kala-b2b-label" htmlFor="meeting-time">
                        Preferred Time to Connect
                      </label>
                      <div className="kala-b2b-input-wrap select-wrap">
                        <span className="kala-b2b-input-icon" aria-hidden="true">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        </span>
                        <select
                          id="meeting-time"
                          className="kala-b2b-select"
                          value={preferredMeetingTime}
                          onChange={(e) => setPreferredMeetingTime(e.target.value)}
                        >
                          {MEETING_TIMES.map((timeOption) => (
                            <option key={timeOption} value={timeOption}>
                              {timeOption}
                            </option>
                          ))}
                        </select>
                        <span className="kala-b2b-chevron" aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </span>
                      </div>
                      <p className="kala-b2b-field-note">
                        Preference only — our team will reach out to confirm a mutually convenient discussion time.
                      </p>
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
                        borderRadius: '8px',
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
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      )}
                      <span>{isSubmitting ? 'SUBMITTING REQUEST...' : 'REQUEST A MEETING'}</span>
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
