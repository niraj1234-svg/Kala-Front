import React, { useState, useEffect, useRef } from 'react'
import {
  submitCampusCorporateQuote,
  type CampusCorporateQuoteInput,
} from '../services/campusSolutionsApi'
import '../styles/CampusCorporateSolutions.css'

// 5 Prominent Target Groups
export const ORGANISATION_TYPES = [
  'Coaching Academies',
  'Colleges & Universities',
  'Offices, Startups & Businesses',
  'Schools',
  'Hostels, Canteens & Mess Contractors',
] as const

export type OrganisationType = (typeof ORGANISATION_TYPES)[number]

// Comprehensive List of Campus & Corporate Services (Multi-select)
export const SERVICE_OPTIONS = [
  { id: 'welcome-kits', label: 'Admission & Onboarding Welcome Kits' },
  { id: 'stationery-ids', label: 'Branded Notebooks, Pens, ID Cards & Lanyards' },
  { id: 'bottles-bags', label: 'Custom Bottles, Die-Cut Stickers & Carry Bags' },
  { id: 'faculty-staff-apparel', label: 'Faculty & Staff Polos, Shirts, Hoodies & Caps' },
  { id: 'appreciation-kits', label: 'Parent, Alumni & Employee Appreciation Kits' },
  { id: 'event-signage', label: 'Event Posters, Banners, Standees & Backdrops' },
  { id: 'event-apparel-ids', label: 'Event Fest T-Shirts, Delegate IDs & Certificates' },
  { id: 'guest-gifting', label: 'Speaker Nameplates, VIP Gifts, Gift Bags & Packaging' },
  { id: 'trophies-medals', label: 'Custom Trophies, Medals & Appreciation Mementos' },
  { id: 'event-media', label: 'Event Photography & Cinematic Video Editing' },
  { id: 'social-templates', label: 'Instagram & LinkedIn Post/Story Templates' },
  { id: 'speaker-announcements', label: 'Speaker Reveals & Event Countdown Creatives' },
  { id: 'presentation-decks', label: 'Keynote Presentation & Certificate Templates' },
  { id: 'monthly-retainer', label: 'Monthly Social Media Creative Packages' },
]

export const QUANTITY_PRESETS = [
  '25–50 units (Pilot Batch)',
  '51–100 units (Standard Cohort)',
  '101–250 units (Departmental/Event)',
  '251–500 units (Institutional Fest/Annual)',
  '501–1,000 units (Full Campus/Enterprise)',
  '1,000+ units (Large-Scale Run)',
]

export const CampusCorporateSolutions: React.FC = () => {
  const formRef = useRef<HTMLDivElement>(null)
  const solutionsRef = useRef<HTMLDivElement>(null)

  // Form State
  const [orgName, setOrgName] = useState<string>('')
  const [contactPerson, setContactPerson] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [selectedOrgType, setSelectedOrgType] = useState<string>('Colleges & Universities')
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Admission & Onboarding Welcome Kits',
    'Faculty & Staff Polos, Shirts, Hoodies & Caps',
  ])
  const [approxQuantity, setApproxQuantity] = useState<string>('101–250 units (Departmental/Event)')
  const [customQuantity, setCustomQuantity] = useState<string>('')
  const [requiredDate, setRequiredDate] = useState<string>('')
  const [deliveryCity, setDeliveryCity] = useState<string>('')
  const [additionalNotes, setAdditionalNotes] = useState<string>('')

  // Logo file state
  const [logoFile, setLogoFile] = useState<{
    name: string
    size: number
    dataUrl?: string
  } | null>(null)
  const [isDragOver, setIsDragOver] = useState<boolean>(false)

  // Form Submission States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<{
    requestId: string
    message: string
  } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Set Document Title & Meta SEO
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.title = 'Campus & Corporate Solutions | KALA'

    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Everything your institution needs. One KALA partner. Custom merchandise, student welcome kits, event branding, faculty uniforms, and digital creatives for colleges, schools, academies and businesses.'
      )
    }
  }, [])

  // Smooth scroll helpers
  const scrollToForm = (preselectedType?: string) => {
    if (preselectedType) {
      setSelectedOrgType(preselectedType)
    }
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const scrollToSolutions = () => {
    if (solutionsRef.current) {
      solutionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Toggle Services Multi-selection
  const handleToggleService = (serviceLabel: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceLabel)
        ? prev.filter((s) => s !== serviceLabel)
        : [...prev, serviceLabel]
    )
    if (fieldErrors.services) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next.services
        return next
      })
    }
  }

  // File Upload Handlers (Client-side base64 conversion)
  const processUploadedFile = (file: File) => {
    // 10MB limit check
    if (file.size > 10 * 1024 * 1024) {
      setSubmitError('File size exceeds 10MB limit. Please upload a smaller logo or asset.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setLogoFile({
        name: file.name,
        size: file.size,
        dataUrl: reader.result as string,
      })
      setSubmitError(null)
    }
    reader.onerror = () => {
      setSubmitError('Unable to read selected file. Please try another file.')
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0])
    }
  }

  const removeLogoFile = () => {
    setLogoFile(null)
  }

  // Calculate minimum delivery date (tomorrow)
  const tomorrowStr = (() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })()

  // Form Validation & Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    const errors: Record<string, string> = {}

    if (!orgName.trim()) {
      errors.orgName = 'Organisation / Institution name is required.'
    }
    if (!contactPerson.trim()) {
      errors.contactPerson = 'Contact person name is required.'
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'A valid email address is required.'
    }
    const cleanPhone = phone.trim()
    if (!cleanPhone || !/^[0-9+\s-]{7,15}$/.test(cleanPhone)) {
      errors.phone = 'A valid mobile/phone number (7–15 digits) is required.'
    }
    if (!selectedOrgType) {
      errors.orgType = 'Please select your organisation type.'
    }
    if (selectedServices.length === 0) {
      errors.services = 'Please select at least one service required.'
    }
    const resolvedQty = customQuantity.trim() || approxQuantity
    if (!resolvedQty) {
      errors.quantity = 'Please specify an approximate quantity.'
    }
    if (!requiredDate) {
      errors.requiredDate = 'Target delivery date is required.'
    }
    if (!deliveryCity.trim()) {
      errors.deliveryCity = 'Delivery city is required.'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)

    const payload: CampusCorporateQuoteInput = {
      organizationName: orgName.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim(),
      phone: cleanPhone,
      organizationType: selectedOrgType,
      servicesRequired: selectedServices,
      approxQuantity: resolvedQty,
      requiredDeliveryDate: requiredDate,
      deliveryCity: deliveryCity.trim(),
      logoFile: logoFile
        ? {
            name: logoFile.name,
            dataUrl: logoFile.dataUrl,
            size: logoFile.size,
          }
        : null,
      additionalRequirements: additionalNotes.trim(),
    }

    try {
      const response = await submitCampusCorporateQuote(payload)
      setSubmitSuccess({
        requestId: response.requestId,
        message:
          response.message ||
          'Your institutional quote request has been received. Our B2B coordinator will review your requirements and reach out within 24 hours with an itemized quote and digital proofs.',
      })
    } catch (err: any) {
      setSubmitError(
        err.message ||
          'Unable to submit your quote request right now. Please try again or connect directly on WhatsApp.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetForm = () => {
    setSubmitSuccess(null)
    setSubmitError(null)
    setFieldErrors({})
    setOrgName('')
    setContactPerson('')
    setEmail('')
    setPhone('')
    setDeliveryCity('')
    setRequiredDate('')
    setCustomQuantity('')
    setAdditionalNotes('')
    setLogoFile(null)
  }

  return (
    <main className="kala-campus-page" id="main-content">
      {/* ====================================================================
          1. HERO SECTION
          ==================================================================== */}
      <section className="campus-hero" aria-labelledby="campus-hero-title">
        <div className="campus-container">
          <div className="campus-hero-grid">
            {/* Left Content */}
            <div className="campus-hero-content">
              <div className="campus-hero-badge">
                <span className="campus-kicker-dot" aria-hidden="true" />
                <span>KALA INSTITUTIONAL PARTNERSHIP</span>
              </div>

              <h1 id="campus-hero-title" className="campus-hero-title">
                Everything Your Institution Needs.{' '}
                <span className="accent-orange">One KALA Partner.</span>
              </h1>

              <p className="campus-hero-desc">
                From custom merchandise and student admission welcome kits to high-impact fest
                branding, faculty uniforms, and digital creatives — KALA delivers retail-finish
                solutions for colleges, schools, coaching academies, and enterprises across India.
              </p>

              <div className="campus-hero-actions">
                <button
                  type="button"
                  onClick={() => scrollToForm()}
                  className="campus-btn-primary"
                  id="hero-request-quote-btn"
                >
                  <span>Request a Bulk Quote</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
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
                  onClick={scrollToSolutions}
                  className="campus-btn-secondary"
                  id="hero-explore-solutions-btn"
                >
                  <span>Explore Solutions</span>
                  <svg
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
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>

              {/* Trust Metric Counters */}
              <div className="campus-hero-trust" aria-label="Partner assurances">
                <div className="trust-item">
                  <span className="trust-number">100%</span>
                  <span className="trust-label">Official GST Input Credit &amp; Invoicing</span>
                </div>
                <div className="trust-item">
                  <span className="trust-number">₹0</span>
                  <span className="trust-label">Vector Setup &amp; Digitization Fee</span>
                </div>
                <div className="trust-item">
                  <span className="trust-number">Pan-India</span>
                  <span className="trust-label">Insured Doorstep Campus Dispatch</span>
                </div>
              </div>
            </div>

            {/* Right Showcase Card */}
            <div className="campus-hero-visual" aria-hidden="true">
              <div className="hero-visual-card">
                <div className="hero-visual-media">
                  <img
                    src="/business-branding/card-05-college-university.jpg"
                    alt="Campus and Corporate Institutional Branding Showcase"
                    className="hero-visual-img"
                    loading="eager"
                  />
                  <div className="hero-visual-badge-floating">KALA Campus Solutions</div>
                </div>

                <div className="hero-visual-info">
                  <strong className="hero-visual-title">Comprehensive Institutional Suite</strong>
                  <p className="solution-card-desc">
                    Complete end-to-end merchandise kits, event decor, custom apparel, and social
                    media creative packages under a single dedicated B2B coordinator.
                  </p>
                  <div className="hero-visual-tags">
                    <span className="hero-pill-tag">Admission Welcome Kits</span>
                    <span className="hero-pill-tag">College Fests</span>
                    <span className="hero-pill-tag">Corporate Summits</span>
                    <span className="hero-pill-tag">Faculty Polos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. STUDENT & EMPLOYEE EXPERIENCE
          ==================================================================== */}
      <section
        className="campus-section with-border-top"
        id="student-employee-experience"
        ref={solutionsRef}
        aria-labelledby="student-experience-title"
      >
        <div className="campus-container">
          <div className="campus-section-header">
            <span className="campus-kicker">
              <span className="campus-kicker-dot" aria-hidden="true" />
              COHORT ONBOARDING &amp; DAILY CULTURE
            </span>
            <h2 id="student-experience-title" className="campus-section-title">
              Student &amp; Employee Experience
            </h2>
            <p className="campus-section-desc">
              Make day one unforgettable. Equip your students, professors, and team members with
              retail-grade identity kits and custom apparel designed to foster lasting belonging.
            </p>
          </div>

          <div className="experience-grid">
            {/* Card 1: Admission Welcome Kits */}
            <article className="solution-card">
              <div className="solution-card-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <span className="solution-card-tag">DAY-ONE ONBOARDING</span>
              <h3 className="solution-card-title">Admission &amp; Joining Welcome Kits</h3>
              <p className="solution-card-desc">
                Premium boxed presentation sets crafted for freshmen, scholarship cohorts, or new corporate joiners with custom sleeve packaging.
              </p>
              <ul className="solution-card-items-list">
                <li className="solution-item-row">
                  <span className="solution-item-bullet">•</span>
                  <span>Hardbound customized institutional welcome box</span>
                </li>
                <li className="solution-item-row">
                  <span className="solution-item-bullet">•</span>
                  <span>Personalized welcome letter &amp; orientation handbook</span>
                </li>
                <li className="solution-item-row">
                  <span className="solution-item-bullet">•</span>
                  <span>Combed cotton graphic tee or polo inside</span>
                </li>
              </ul>
            </article>

            {/* Card 2: Branded Notebooks, Pens & IDs */}
            <article className="solution-card">
              <div className="solution-card-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <span className="solution-card-tag">DAILY IDENTITY</span>
              <h3 className="solution-card-title">Notebooks, Pens, ID Cards &amp; Lanyards</h3>
              <p className="solution-card-desc">
                High-utility academic and workplace essentials finished with embossed logos, durable satin ribbon lanyards, and metallic identity tags.
              </p>
              <ul className="solution-card-items-list">
                <li className="solution-item-row">
                  <span className="solution-item-bullet">•</span>
                  <span>Faux leather &amp; kraft debossed hardbound notebooks</span>
                </li>
                <li className="solution-item-row">
                  <span className="solution-item-bullet">•</span>
                  <span>Matte metal stylus pens with high-yield German ink</span>
                </li>
                <li className="solution-item-row">
                  <span className="solution-item-bullet">•</span>
                  <span>Sublimation satin lanyards with metal swivel dog hooks</span>
                </li>
              </ul>
            </article>

            {/* Card 3: Bottles, Stickers & Bags */}
            <article className="solution-card">
              <div className="solution-card-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <span className="solution-card-tag">CAMPUS UTILITY</span>
              <h3 className="solution-card-title">Bottles, Stickers &amp; Carry Bags</h3>
              <p className="solution-card-desc">
                Eco-conscious, long-lasting gear for daily lectures, labs, library sessions, and campus commutes.
              </p>
              <ul className="solution-card-items-list">
                <li className="solution-item-row">
                  <span className="solution-item-bullet">•</span>
                  <span>Double-wall insulated stainless steel drinkware</span>
                </li>
                <li className="solution-item-row">
                  <span className="solution-item-bullet">•</span>
                  <span>Waterproof vinyl die-cut laptop &amp; helmet stickers</span>
                </li>
                <li className="solution-item-row">
                  <span className="solution-item-bullet">•</span>
                  <span>Heavyweight cotton canvas tote &amp; drawstring kit bags</span>
                </li>
              </ul>
            </article>

            {/* Card 4: Faculty & Staff Apparel */}
            <article className="solution-card">
              <div className="solution-card-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                </svg>
              </div>
              <span className="solution-card-tag">OFFICIAL ATTIRE</span>
              <h3 className="solution-card-title">Faculty &amp; Staff Apparel</h3>
              <p className="solution-card-desc">
                Distinguished collar polos, crisp formal shirts, heavyweight 220 GSM combed tees, winter fleece hoodies, and embroidered caps.
              </p>
              <ul className="solution-card-items-list">
                <li className="solution-item-row">
                  <span className="solution-item-bullet">•</span>
                  <span>240 GSM breathable pique knit executive polos</span>
                </li>
                <li className="solution-item-row">
                  <span className="solution-item-bullet">•</span>
                  <span>320 GSM brushed fleece zipped &amp; pullover hoodies</span>
                </li>
                <li className="solution-item-row">
                  <span className="solution-item-bullet">•</span>
                  <span>Structured twill dad caps with 3D high-density embroidery</span>
                </li>
              </ul>
            </article>

            {/* Card 5: Appreciation Kits */}
            <article className="solution-card">
              <div className="solution-card-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <span className="solution-card-tag">HONOR &amp; RECOGNITION</span>
              <h3 className="solution-card-title">Parent, Alumni &amp; Employee Kits</h3>
              <p className="solution-card-desc">
                Commemorative gifts and milestone packages tailored for alumni homecomings, convocation ceremonies, and long-service employee awards.
              </p>
              <ul className="solution-card-items-list">
                <li className="solution-item-row">
                  <span className="solution-item-bullet">•</span>
                  <span>Custom keepsake wooden boxes with gold foil embossing</span>
                </li>
                <li className="solution-item-row">
                  <span className="solution-item-bullet">•</span>
                  <span>Alumni heritage commemorative pins &amp; cufflinks</span>
                </li>
                <li className="solution-item-row">
                  <span className="solution-item-bullet">•</span>
                  <span>Custom personalized appreciation plaque with certificate</span>
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. EVENT BRANDING & MERCHANDISE
          ==================================================================== */}
      <section
        className="campus-section alt-bg with-border-top"
        id="event-branding-merchandise"
        aria-labelledby="event-branding-title"
      >
        <div className="campus-container">
          <div className="campus-section-header">
            <span className="campus-kicker">
              <span className="campus-kicker-dot" aria-hidden="true" />
              FESTS, CONCLAVES &amp; SUMMITS
            </span>
            <h2 id="event-branding-title" className="campus-section-title">
              Event Branding &amp; Merchandise
            </h2>
            <p className="campus-section-desc">
              Transform your annual fest, national conference, hackathon, or sports meet into an
              immersive physical experience. From stage backdrops to VIP guest gift hampers.
            </p>
          </div>

          <div className="event-showcase-grid">
            {/* 1. Stage & Venue Signage */}
            <article className="event-feature-card">
              <span className="event-feature-badge highlight">VENUE &amp; STAGE DECOR</span>
              <h3 className="event-feature-title">Posters, Banners, Standees &amp; Backdrops</h3>
              <p className="event-feature-desc">
                High-definition flex, star-matte vinyl, roll-up standees, registration backdrops,
                directional campus signage, and stage photo-op walls.
              </p>
              <div className="event-chips-wrap">
                <span className="event-chip">Non-Glare Star Flex</span>
                <span className="event-chip">Roll-Up Standees</span>
                <span className="event-chip">Red Carpet Media Walls</span>
                <span className="event-chip">Directional Signboards</span>
              </div>
            </article>

            {/* 2. Fest T-Shirts & Identity */}
            <article className="event-feature-card">
              <span className="event-feature-badge">ATTENDEE GEAR</span>
              <h3 className="event-feature-title">Event T-Shirts, ID Cards &amp; Certificates</h3>
              <p className="event-feature-desc">
                Custom crew T-shirts, participant badges, barcoded RFID delegate credentials, and
                hot-foil stamped participation certificates.
              </p>
              <div className="event-chips-wrap">
                <span className="event-chip">Screen &amp; DTF Print Tees</span>
                <span className="event-chip">350 GSM Gold Foil Certificates</span>
                <span className="event-chip">Laminated Delegate Badges</span>
                <span className="event-chip">Volunteer Wristbands</span>
              </div>
            </article>

            {/* 3. Speaker & Guest Hospitality */}
            <article className="event-feature-card">
              <span className="event-feature-badge highlight">VIP HOSPITALITY</span>
              <h3 className="event-feature-title">Speaker Nameplates, Gifts, Bags &amp; Packaging</h3>
              <p className="event-feature-desc">
                Laser-cut acrylic podium nameplates, curated VIP speaker hampers, rigid keepsake
                boxes, and satin-ribbon laminated gift carry bags.
              </p>
              <div className="event-chips-wrap">
                <span className="event-chip">Frosted Acrylic Nameplates</span>
                <span className="event-chip">Curated Gourmet &amp; Tech Hampers</span>
                <span className="event-chip">Rigid Magnetic Gift Boxes</span>
                <span className="event-chip">Laminated Carry Bags</span>
              </div>
            </article>

            {/* 4. Trophies & Medals */}
            <article className="event-feature-card">
              <span className="event-feature-badge">AWARDS &amp; ACCOLADES</span>
              <h3 className="event-feature-title">Trophies, Medals &amp; Appreciation Gifts</h3>
              <p className="event-feature-desc">
                Custom laser-engraved wooden and metal trophies, heavyweight die-cast medals with
                printed ribbons, and chief guest mementos.
              </p>
              <div className="event-chips-wrap">
                <span className="event-chip">Crystal &amp; Wood Trophies</span>
                <span className="event-chip">Die-Cast Gold/Silver Medals</span>
                <span className="event-chip">Custom Printed Ribbons</span>
                <span className="event-chip">Executive Brass Shields</span>
              </div>
            </article>

            {/* 5. Event Media Production */}
            <article className="event-feature-card">
              <span className="event-feature-badge">MEDIA COVERAGE</span>
              <h3 className="event-feature-title">Event Photography &amp; Video Editing</h3>
              <p className="event-feature-desc">
                Professional multi-camera photography, rapid same-day reels for social buzz, and
                cinematic 4K aftermovie editing capturing every highlight.
              </p>
              <div className="event-chips-wrap">
                <span className="event-chip">Same-Day Social Reels</span>
                <span className="event-chip">High-Resolution Photo Gallery</span>
                <span className="event-chip">Cinematic 4K Aftermovie</span>
                <span className="event-chip">Guest Interview Clips</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. DIGITAL BRANDING & CREATIVE SERVICES
          ==================================================================== */}
      <section
        className="campus-section with-border-top"
        id="digital-branding-creative"
        aria-labelledby="digital-branding-title"
      >
        <div className="campus-container">
          <div className="campus-section-header">
            <span className="campus-kicker">
              <span className="campus-kicker-dot" aria-hidden="true" />
              CREATIVE STUDIO &amp; DIGITAL REACH
            </span>
            <h2 id="digital-branding-title" className="campus-section-title">
              Digital Branding &amp; Creative Services
            </h2>
            <p className="campus-section-desc">
              Level up your institutional presence online. Clean typography, cohesive visual
              identity, and social media creative assets crafted for maximum engagement.
            </p>
          </div>

          <div className="digital-services-grid">
            {/* 1. Instagram Templates */}
            <article className="digital-card">
              <div className="digital-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>
              <h3 className="digital-card-title">Instagram Post &amp; Story Templates</h3>
              <p className="digital-card-desc">
                Cohesive feed aesthetics, Figma/Canva brand kits, announcement carousels, and
                animated story templates customized with your institutional identity.
              </p>
              <ul className="digital-deliverables">
                <li className="digital-deliverable-item">
                  <span className="digital-check-icon">✓</span> 9-grid cohesive feed layout design
                </li>
                <li className="digital-deliverable-item">
                  <span className="digital-check-icon">✓</span> Multi-slide informational carousels
                </li>
                <li className="digital-deliverable-item">
                  <span className="digital-check-icon">✓</span> Story highlight covers &amp; animated stickers
                </li>
              </ul>
            </article>

            {/* 2. LinkedIn Announcements */}
            <article className="digital-card">
              <div className="digital-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </div>
              <h3 className="digital-card-title">LinkedIn Announcements &amp; PR Banners</h3>
              <p className="digital-card-desc">
                Executive-level graphics for accreditation milestones, placement success, MoU
                signings, faculty appointments, and corporate partnerships.
              </p>
              <ul className="digital-deliverables">
                <li className="digital-deliverable-item">
                  <span className="digital-check-icon">✓</span> High-conversion 1200x627 px post graphics
                </li>
                <li className="digital-deliverable-item">
                  <span className="digital-check-icon">✓</span> Placement statistics infographic templates
                </li>
                <li className="digital-deliverable-item">
                  <span className="digital-check-icon">✓</span> Director &amp; Dean thought-leadership templates
                </li>
              </ul>
            </article>

            {/* 3. Speaker Reveals & Decks */}
            <article className="digital-card">
              <div className="digital-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="digital-card-title">Countdowns, Speaker Reveals &amp; Decks</h3>
              <p className="digital-card-desc">
                Buzz-generating countdown posters, VIP guest speaker introduction tiles, masterclass
                announcements, and widescreen keynote slide templates.
              </p>
              <ul className="digital-deliverables">
                <li className="digital-deliverable-item">
                  <span className="digital-check-icon">✓</span> 7-day to 1-day countdown visual teasers
                </li>
                <li className="digital-deliverable-item">
                  <span className="digital-check-icon">✓</span> Speaker photo &amp; bio reveal poster designs
                </li>
                <li className="digital-deliverable-item">
                  <span className="digital-check-icon">✓</span> 16:9 Presentation master decks (PowerPoint/Keynote)
                </li>
              </ul>
            </article>

            {/* 4. Monthly Creative Retainers */}
            <article className="digital-card">
              <div className="digital-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="digital-card-title">Monthly Social Media Packages</h3>
              <p className="digital-card-desc">
                Dedicated monthly creative retainer providing festival greetings, event recaps,
                sponsor appreciation posts, and regular academic calendar updates.
              </p>
              <ul className="digital-deliverables">
                <li className="digital-deliverable-item">
                  <span className="digital-check-icon">✓</span> 12 to 24 curated posts per month
                </li>
                <li className="digital-deliverable-item">
                  <span className="digital-check-icon">✓</span> Sponsor appreciation &amp; partner shoutout tiles
                </li>
                <li className="digital-deliverable-item">
                  <span className="digital-check-icon">✓</span> Fast-turnaround emergency broadcast graphics
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. WHO WE SERVE (FIVE EQUALLY PROMINENT CATEGORIES)
          ==================================================================== */}
      <section
        className="campus-section alt-bg with-border-top"
        id="who-we-serve"
        aria-labelledby="who-we-serve-title"
      >
        <div className="campus-container">
          <div className="campus-section-header">
            <span className="campus-kicker">
              <span className="campus-kicker-dot" aria-hidden="true" />
              SPECIALIZED INDUSTRY EXPERTISE
            </span>
            <h2 id="who-we-serve-title" className="campus-section-title">
              Who We Serve
            </h2>
            <p className="campus-section-desc">
              Tailored procurement packages engineered for the exact operational needs, compliance
              rules, and aesthetic expectations of five core institutional sectors.
            </p>
          </div>

          <div className="who-we-serve-grid">
            {/* Category 1: Coaching Academies */}
            <div
              className={`serve-card ${selectedOrgType === 'Coaching Academies' ? 'selected' : ''}`}
              onClick={() => scrollToForm('Coaching Academies')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') scrollToForm('Coaching Academies')
              }}
              aria-label="Select Coaching Academies category"
            >
              <span className="serve-card-index">01 / ACADEMIES</span>
              <h3 className="serve-card-title">Coaching Academies</h3>
              <p className="serve-card-desc">
                High-volume student study backpacks, test series kits, batch T-shirts, uniform
                polos for faculty, and topper celebration mementos.
              </p>
              <div className="serve-card-deliverables">
                <div className="serve-card-deliverables-title">Key Offerings:</div>
                <div className="serve-card-deliverables-text">
                  Student Kit Bags • Batch Polos • Test File Folders • Topper Felicitations
                </div>
              </div>
              <button type="button" className="serve-card-select-btn">
                <span>Request Quote</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>

            {/* Category 2: Colleges & Universities */}
            <div
              className={`serve-card ${selectedOrgType === 'Colleges & Universities' ? 'selected' : ''}`}
              onClick={() => scrollToForm('Colleges & Universities')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') scrollToForm('Colleges & Universities')
              }}
              aria-label="Select Colleges & Universities category"
            >
              <span className="serve-card-index">02 / CAMPUS</span>
              <h3 className="serve-card-title">Colleges &amp; Universities</h3>
              <p className="serve-card-desc">
                Annual cultural and tech fest merchandise, department hoodies, sports team jerseys,
                convocation stoles, and institutional alumni gift boxes.
              </p>
              <div className="serve-card-deliverables">
                <div className="serve-card-deliverables-title">Key Offerings:</div>
                <div className="serve-card-deliverables-text">
                  Fest Merch • Department Hoodies • Sports Jerseys • Convocation Gifts
                </div>
              </div>
              <button type="button" className="serve-card-select-btn">
                <span>Request Quote</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>

            {/* Category 3: Offices, Startups & Businesses */}
            <div
              className={`serve-card ${selectedOrgType === 'Offices, Startups & Businesses' ? 'selected' : ''}`}
              onClick={() => scrollToForm('Offices, Startups & Businesses')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') scrollToForm('Offices, Startups & Businesses')
              }}
              aria-label="Select Offices, Startups & Businesses category"
            >
              <span className="serve-card-index">03 / CORPORATE</span>
              <h3 className="serve-card-title">Offices, Startups &amp; Businesses</h3>
              <p className="serve-card-desc">
                Day-one employee welcome boxes, corporate collar polos, executive fleece jackets,
                hackathon apparel, and luxury festival gifting sets.
              </p>
              <div className="serve-card-deliverables">
                <div className="serve-card-deliverables-title">Key Offerings:</div>
                <div className="serve-card-deliverables-text">
                  New Hire Boxes • Company Polos • Offsite Merch • Diwali/Festive Hampers
                </div>
              </div>
              <button type="button" className="serve-card-select-btn">
                <span>Request Quote</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>

            {/* Category 4: Schools */}
            <div
              className={`serve-card ${selectedOrgType === 'Schools' ? 'selected' : ''}`}
              onClick={() => scrollToForm('Schools')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') scrollToForm('Schools')
              }}
              aria-label="Select Schools category"
            >
              <span className="serve-card-index">04 / K-12</span>
              <h3 className="serve-card-title">Schools</h3>
              <p className="serve-card-desc">
                House T-shirts, sports day uniform kits, teacher appreciation gift hampers, student
                identity lanyards, and annual day medals/trophies.
              </p>
              <div className="serve-card-deliverables">
                <div className="serve-card-deliverables-title">Key Offerings:</div>
                <div className="serve-card-deliverables-text">
                  House Color Tees • Sports Day Medals • Teacher Diaries • Identity Lanyards
                </div>
              </div>
              <button type="button" className="serve-card-select-btn">
                <span>Request Quote</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>

            {/* Category 5: Hostels, Canteens & Mess Contractors */}
            <div
              className={`serve-card ${selectedOrgType === 'Hostels, Canteens & Mess Contractors' ? 'selected' : ''}`}
              onClick={() => scrollToForm('Hostels, Canteens & Mess Contractors')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') scrollToForm('Hostels, Canteens & Mess Contractors')
              }}
              aria-label="Select Hostels, Canteens & Mess Contractors category"
            >
              <span className="serve-card-index">05 / HOSPITALITY</span>
              <h3 className="serve-card-title">Hostels, Canteens &amp; Mess</h3>
              <p className="serve-card-desc">
                Hygienic chef coats, server aprons, staff hairnets and caps, kitchen identity kits,
                and durable customized hostel staff apparel.
              </p>
              <div className="serve-card-deliverables">
                <div className="serve-card-deliverables-title">Key Offerings:</div>
                <div className="serve-card-deliverables-text">
                  Heavy-Duty Aprons • Staff Visors &amp; Caps • Chef Polos • Staff ID Kits
                </div>
              </div>
              <button type="button" className="serve-card-select-btn">
                <span>Request Quote</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. HOW IT WORKS SECTION
          ==================================================================== */}
      <section
        className="campus-section with-border-top"
        id="how-it-works"
        aria-labelledby="how-it-works-title"
      >
        <div className="campus-container">
          <div className="campus-section-header">
            <span className="campus-kicker">
              <span className="campus-kicker-dot" aria-hidden="true" />
              TRANSPARENT PROCUREMENT PIPELINE
            </span>
            <h2 id="how-it-works-title" className="campus-section-title">
              How It Works
            </h2>
            <p className="campus-section-desc">
              From requirement brief to doorstep campus dispatch — 5 structured stages that keep
              you informed and completely in control.
            </p>
          </div>

          <div className="how-it-works-pipeline">
            {/* Step 1 */}
            <div className="pipeline-step-card">
              <div className="pipeline-step-header">
                <span className="pipeline-step-number">01</span>
                <span className="pipeline-step-phase">BRIEF</span>
              </div>
              <h3 className="pipeline-step-title">Share Requirements</h3>
              <p className="pipeline-step-desc">
                Tell us your expected items, volume, required delivery date, and upload your logo or
                concept art via our form.
              </p>
            </div>

            {/* Step 2 */}
            <div className="pipeline-step-card">
              <div className="pipeline-step-header">
                <span className="pipeline-step-number">02</span>
                <span className="pipeline-step-phase">REVIEW</span>
              </div>
              <h3 className="pipeline-step-title">KALA Reviews Request</h3>
              <p className="pipeline-step-desc">
                Our institutional coordinator reviews quantities, technical fabric suitability,
                print placements, and logistic schedules.
              </p>
            </div>

            {/* Step 3 */}
            <div className="pipeline-step-card">
              <div className="pipeline-step-header">
                <span className="pipeline-step-number">03</span>
                <span className="pipeline-step-phase">QUOTATION</span>
              </div>
              <h3 className="pipeline-step-title">Receive Custom Quote</h3>
              <p className="pipeline-step-desc">
                Get an itemized proposal with transparent volume tiers, GST breakdown, and digital
                garment/mockup proof sheets.
              </p>
            </div>

            {/* Step 4 */}
            <div className="pipeline-step-card">
              <div className="pipeline-step-header">
                <span className="pipeline-step-number">04</span>
                <span className="pipeline-step-phase">APPROVAL</span>
              </div>
              <h3 className="pipeline-step-title">Approve Artwork &amp; Quote</h3>
              <p className="pipeline-step-desc">
                Review physical or high-res digital pre-production proofs, approve the official PO/PI,
                and lock in delivery dates.
              </p>
            </div>

            {/* Step 5 */}
            <div className="pipeline-step-card">
              <div className="pipeline-step-header">
                <span className="pipeline-step-number">05</span>
                <span className="pipeline-step-phase">DISPATCH</span>
              </div>
              <h3 className="pipeline-step-title">Production, QC &amp; Delivery</h3>
              <p className="pipeline-step-desc">
                Audited batch printing, thorough stitching &amp; finish inspection, and insured
                doorstep delivery straight to your campus.
              </p>
            </div>
          </div>

          {/* Honest Fulfillment & Third-Party Disclosure */}
          <div className="campus-fulfillment-notice" role="note">
            <div className="fulfillment-icon-box" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="fulfillment-notice-content">
              <strong className="fulfillment-notice-title">
                Fulfillment &amp; Partner Model Transparency
              </strong>
              <p className="fulfillment-notice-text">
                KALA acts as your single institutional account manager, coordinating design
                digitization, quality audits, and fulfillment through vetted third-party printing,
                textile fabrication, and logistics partners nationwide. We never claim to own
                in-house manufacturing plants or guarantee unverified delivery timelines — instead,
                we provide audited quality control, realistic agreed milestones, and full GST
                invoicing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. BULK QUOTE REQUEST FORM
          ==================================================================== */}
      <section
        className="campus-section quote-form-section with-border-top"
        id="quote-form"
        ref={formRef}
        aria-labelledby="quote-form-heading"
      >
        <div className="campus-container">
          <div className="quote-form-card">
            <div className="quote-form-header">
              <span className="campus-kicker">
                <span className="campus-kicker-dot" aria-hidden="true" />
                DEDICATED INSTITUTIONAL PROCUREMENT
              </span>
              <h2 id="quote-form-heading" className="quote-form-title">
                Request a Bulk Quote
              </h2>
              <p className="quote-form-subtitle">
                Receive an itemized commercial quotation, digital visual proofs, and dedicated
                coordinator support for your institution within 24 hours.
              </p>
            </div>

            {/* Error Banner */}
            {submitError && (
              <div className="quote-alert-error" role="alert" style={{ marginBottom: '1.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{submitError}</span>
              </div>
            )}

            {/* Success View */}
            {submitSuccess ? (
              <div className="quote-alert-success" role="status">
                <div className="success-check-icon" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="success-title">Quotation Request Received!</h3>
                <p className="success-message">{submitSuccess.message}</p>
                <div className="success-request-id-badge">
                  Reference ID: <strong>{submitSuccess.requestId}</strong>
                </div>
                <p className="solution-card-desc" style={{ maxWidth: '480px' }}>
                  Please save this reference ID. Our B2B coordinator will contact you via email and
                  phone with technical artwork proofs and volume-discounted options.
                </p>
                <div className="success-actions">
                  <button type="button" onClick={handleResetForm} className="success-reset-btn">
                    Submit Another Quote Request
                  </button>
                  <a
                    href="https://wa.me/919999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="campus-btn-primary"
                    style={{ padding: '0.75rem 1.4rem', fontSize: '0.85rem' }}
                  >
                    <span>Instant Connect on WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              /* Active Form */
              <form onSubmit={handleSubmit} className="campus-quote-form" noValidate>
                {/* Row 1: Org Name & Contact Person */}
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="field-org-name" className="form-label">
                      Organisation / Institution Name
                      <span className="required-star">*</span>
                    </label>
                    <input
                      id="field-org-name"
                      type="text"
                      className={`form-input ${fieldErrors.orgName ? 'error' : ''}`}
                      placeholder="e.g. Guru Ghasidas Central University, Bilaspur"
                      value={orgName}
                      onChange={(e) => {
                        setOrgName(e.target.value)
                        if (fieldErrors.orgName) {
                          setFieldErrors((prev) => ({ ...prev, orgName: '' }))
                        }
                      }}
                      required
                    />
                    {fieldErrors.orgName && (
                      <span className="field-error-text">{fieldErrors.orgName}</span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="field-contact-person" className="form-label">
                      Contact Person's Name
                      <span className="required-star">*</span>
                    </label>
                    <input
                      id="field-contact-person"
                      type="text"
                      className={`form-input ${fieldErrors.contactPerson ? 'error' : ''}`}
                      placeholder="e.g. Dr. Rajesh Sharma / Rohan Verma"
                      value={contactPerson}
                      onChange={(e) => {
                        setContactPerson(e.target.value)
                        if (fieldErrors.contactPerson) {
                          setFieldErrors((prev) => ({ ...prev, contactPerson: '' }))
                        }
                      }}
                      required
                    />
                    {fieldErrors.contactPerson && (
                      <span className="field-error-text">{fieldErrors.contactPerson}</span>
                    )}
                  </div>
                </div>

                {/* Row 2: Work Email & Phone */}
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="field-email" className="form-label">
                      Official / Work Email
                      <span className="required-star">*</span>
                    </label>
                    <input
                      id="field-email"
                      type="email"
                      className={`form-input ${fieldErrors.email ? 'error' : ''}`}
                      placeholder="e.g. events@ggv.ac.in or contact@company.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (fieldErrors.email) {
                          setFieldErrors((prev) => ({ ...prev, email: '' }))
                        }
                      }}
                      required
                    />
                    {fieldErrors.email && (
                      <span className="field-error-text">{fieldErrors.email}</span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="field-phone" className="form-label">
                      Contact Phone / WhatsApp
                      <span className="required-star">*</span>
                    </label>
                    <input
                      id="field-phone"
                      type="tel"
                      className={`form-input ${fieldErrors.phone ? 'error' : ''}`}
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value)
                        if (fieldErrors.phone) {
                          setFieldErrors((prev) => ({ ...prev, phone: '' }))
                        }
                      }}
                      required
                    />
                    {fieldErrors.phone && (
                      <span className="field-error-text">{fieldErrors.phone}</span>
                    )}
                  </div>
                </div>

                {/* Row 3: Organisation Type (5 Groups) */}
                <div className="form-field full-width">
                  <label className="form-label">
                    Organisation Type
                    <span className="required-star">*</span>
                  </label>
                  <div className="org-type-pills" role="radiogroup" aria-label="Organisation category">
                    {ORGANISATION_TYPES.map((orgType) => (
                      <button
                        key={orgType}
                        type="button"
                        role="radio"
                        aria-checked={selectedOrgType === orgType}
                        className={`org-type-pill ${selectedOrgType === orgType ? 'active' : ''}`}
                        onClick={() => setSelectedOrgType(orgType)}
                      >
                        {orgType}
                      </button>
                    ))}
                  </div>
                  {fieldErrors.orgType && (
                    <span className="field-error-text">{fieldErrors.orgType}</span>
                  )}
                </div>

                {/* Row 4: Services Required (Multi-Select) */}
                <div className="form-field full-width">
                  <label className="form-label">
                    Services Required
                    <span className="required-star">*</span>
                    <span className="field-hint">(Select all that apply)</span>
                  </label>
                  <div className="services-checkbox-grid">
                    {SERVICE_OPTIONS.map((srv) => {
                      const isChecked = selectedServices.includes(srv.label)
                      return (
                        <label
                          key={srv.id}
                          className={`service-checkbox-tile ${isChecked ? 'checked' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleService(srv.label)}
                          />
                          <span className="service-tile-label">{srv.label}</span>
                        </label>
                      )
                    })}
                  </div>
                  {fieldErrors.services && (
                    <span className="field-error-text">{fieldErrors.services}</span>
                  )}
                </div>

                {/* Row 5: Approximate Quantity & Required Date */}
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="field-quantity" className="form-label">
                      Approximate Quantity
                      <span className="required-star">*</span>
                    </label>
                    <select
                      id="field-quantity"
                      className="form-select"
                      value={approxQuantity}
                      onChange={(e) => setApproxQuantity(e.target.value)}
                    >
                      {QUANTITY_PRESETS.map((preset) => (
                        <option key={preset} value={preset}>
                          {preset}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      className="form-input"
                      style={{ marginTop: '0.45rem' }}
                      placeholder="Or specify exact number (e.g. 175 pieces)"
                      value={customQuantity}
                      onChange={(e) => setCustomQuantity(e.target.value)}
                    />
                    {fieldErrors.quantity && (
                      <span className="field-error-text">{fieldErrors.quantity}</span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="field-required-date" className="form-label">
                      Required Delivery Date
                      <span className="required-star">*</span>
                    </label>
                    <input
                      id="field-required-date"
                      type="date"
                      min={tomorrowStr}
                      className={`form-input ${fieldErrors.requiredDate ? 'error' : ''}`}
                      value={requiredDate}
                      onChange={(e) => {
                        setRequiredDate(e.target.value)
                        if (fieldErrors.requiredDate) {
                          setFieldErrors((prev) => ({ ...prev, requiredDate: '' }))
                        }
                      }}
                      required
                    />
                    {fieldErrors.requiredDate && (
                      <span className="field-error-text">{fieldErrors.requiredDate}</span>
                    )}
                  </div>
                </div>

                {/* Row 6: Delivery City */}
                <div className="form-field full-width">
                  <label htmlFor="field-delivery-city" className="form-label">
                    Delivery City &amp; State
                    <span className="required-star">*</span>
                  </label>
                  <input
                    id="field-delivery-city"
                    type="text"
                    className={`form-input ${fieldErrors.deliveryCity ? 'error' : ''}`}
                    placeholder="e.g. Bilaspur, Chhattisgarh or Bangalore, Karnataka"
                    value={deliveryCity}
                    onChange={(e) => {
                      setDeliveryCity(e.target.value)
                      if (fieldErrors.deliveryCity) {
                        setFieldErrors((prev) => ({ ...prev, deliveryCity: '' }))
                      }
                    }}
                    required
                  />
                  {fieldErrors.deliveryCity && (
                    <span className="field-error-text">{fieldErrors.deliveryCity}</span>
                  )}
                </div>

                {/* Row 7: Optional Logo / Design File Upload */}
                <div className="form-field full-width">
                  <label className="form-label">
                    Optional Logo / Artwork / Design File
                    <span className="field-hint">(Vector AI, EPS, SVG, PDF or high-res PNG/JPG, max 10MB)</span>
                  </label>
                  <div
                    className={`file-upload-box ${isDragOver ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="field-logo-file"
                      className="file-upload-input"
                      accept=".png,.jpg,.jpeg,.svg,.pdf,.ai,.eps,.zip"
                      onChange={handleFileInputChange}
                      aria-label="Upload logo or design file"
                    />
                    <div className="file-upload-content">
                      <div className="file-upload-icon" aria-hidden="true">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <span className="file-upload-title">
                        Drag and drop your logo file here, or click to browse
                      </span>
                      <span className="file-upload-hint">
                        Vector formats preferred for highest fidelity garment prints &amp; embroidery.
                      </span>
                    </div>
                  </div>

                  {logoFile && (
                    <div className="file-preview-row">
                      <div className="file-preview-info">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span>
                          {logoFile.name} ({(logoFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeLogoFile}
                        className="file-remove-btn"
                        aria-label="Remove uploaded file"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Row 8: Additional Requirements */}
                <div className="form-field full-width">
                  <label htmlFor="field-additional-notes" className="form-label">
                    Additional Requirements &amp; Project Specifications
                    <span className="field-hint">(Optional)</span>
                  </label>
                  <textarea
                    id="field-additional-notes"
                    className="form-textarea"
                    placeholder="Specify any preferences for fabric GSM, colors, size distributions, event theme, or special delivery instructions."
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                  />
                </div>

                {/* Pricing Disclosure Notice */}
                <div className="pricing-policy-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>
                    <strong>Transparent Custom Quoting:</strong> We do not advertise fixed bulk
                    prices because institutional orders vary widely by volume, fabric weight, print
                    methods (DTF, Screen, Embroidery), and timeline. Your custom quote is itemized
                    with zero hidden fees.
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="quote-submit-btn"
                  id="campus-quote-submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <span className="kala-spin" aria-hidden="true">
                        ⟳
                      </span>
                      <span>Processing Your Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Request My Custom Quote</span>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default CampusCorporateSolutions
