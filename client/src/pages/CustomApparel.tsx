import React, { useState, useEffect, useRef } from 'react'
import { PRODUCTS } from '../data/products'
import { saveCustomRequest } from '../types/requests'
import { createCustomRequest } from '../services/customRequestApi'
import type { CustomRequestInput } from '../services/customRequestApi'
import '../styles/CustomApparel.css'

interface SubmittedDisplay {
  id: string
  name: string
  apparelType: string
  quantity: number
  printingType: string
  status: string
}

export const CustomApparel: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [apparelType, setApparelType] = useState('T-Shirt')
  const [quantity, setQuantity] = useState<number | ''>(25)
  const [sizeRange, setSizeRange] = useState('Mixed Sizes (S–XXL)')
  const [printingType, setPrintingType] = useState('Screen Printing')
  const [description, setDescription] = useState('')
  const [additionalRequirements, setAdditionalRequirements] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)

  // Validation & Submission State
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submittedRequest, setSubmittedRequest] = useState<SubmittedDisplay | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const formRef = useRef<HTMLDivElement>(null)
  const categoriesRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToForm = (preselectType?: string) => {
    if (preselectType) {
      setApparelType(preselectType)
    }
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToCategories = () => {
    categoriesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFileName(file.name)
    }
  }

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Please enter your full name.'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.'
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address.'
    }

    const phoneRegex = /^[0-9+\s-]{7,15}$/
    if (!phone.trim()) {
      newErrors.phone = 'Please enter your contact phone number.'
    } else if (!phoneRegex.test(phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number (7-15 digits).'
    }

    if (quantity === '' || Number(quantity) < 1) {
      newErrors.quantity = 'Please enter a valid quantity (at least 1).'
    }

    if (!description.trim()) {
      newErrors.description = 'Please describe your design idea, logo, or theme.'
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

    const payload: CustomRequestInput = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      apparelType,
      quantity: Number(quantity),
      sizeRange,
      printingType,
      description: description.trim(),
      additionalRequirements: additionalRequirements.trim() || undefined,
      fileName: uploadedFileName || undefined,
    }

    try {
      // 1. Submit to backend Express API (persisting directly in MongoDB Atlas)
      const response = await createCustomRequest(payload)

      if (response && response.success && response.requestId) {
        setSubmittedRequest({
          id: response.requestId,
          name: response.request.name,
          apparelType: response.request.apparelType,
          quantity: response.request.quantity,
          printingType: response.request.printingType,
          status: response.request.status || 'pending',
        })

        // 2. Compatibility cache in localStorage
        try {
          saveCustomRequest({
            id: response.requestId,
            createdAt: response.request.createdAt,
            name: response.request.name,
            email: response.request.email,
            phone: response.request.phone,
            apparelType: response.request.apparelType,
            quantity: response.request.quantity,
            sizeRange: response.request.sizeRange,
            printingType: response.request.printingType,
            description: response.request.description,
            additionalRequirements: response.request.additionalRequirements,
            fileName: response.request.fileName,
            status: 'Request Submitted',
          })
        } catch {
          // Ignore localStorage errors
        }

        setIsSubmitting(false)

        // Scroll to confirmation card
        setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 50)
      } else {
        throw new Error('Unable to submit your custom request right now. Please try again.')
      }
    } catch (err: any) {
      console.error('[CustomApparel] Submission error:', err)
      setSubmitError(err.message || 'Unable to submit your custom request right now. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleResetForm = () => {
    setName('')
    setEmail('')
    setPhone('')
    setApparelType('T-Shirt')
    setQuantity(25)
    setSizeRange('Mixed Sizes (S–XXL)')
    setPrintingType('Screen Printing')
    setDescription('')
    setAdditionalRequirements('')
    setUploadedFileName(null)
    setErrors({})
    setSubmitError(null)
    setSubmittedRequest(null)
  }

  // Visual Assets from PRODUCTS
  const heroImage = PRODUCTS.find((p) => p.id === 'gaming-pro-arena-warmup-04')?.image || PRODUCTS[0]?.image

  const categories = [
    {
      id: 'custom-t-shirts',
      name: 'CUSTOM T-SHIRTS',
      typeValue: 'T-Shirt',
      description: 'Premium custom printed T-shirts for teams, events, communities and everyday wear.',
      buttonText: 'CREATE T-SHIRT',
      image: PRODUCTS.find((p) => p.id === 'streetwear-vintage-wash-tee')?.image || PRODUCTS[3]?.image,
    },
    {
      id: 'oversized-t-shirts',
      name: 'OVERSIZED T-SHIRTS',
      typeValue: 'Oversized T-Shirt',
      description: 'Heavyweight drop-shoulder streetwear silhouettes engineered for modern street culture.',
      buttonText: 'CREATE OVERSIZED TEE',
      image: PRODUCTS.find((p) => p.id === 'streetwear-oversized-acid-tee')?.image || PRODUCTS[0]?.image,
    },
    {
      id: 'hoodies',
      name: 'HOODIES',
      typeValue: 'Hoodie',
      description: 'Luxury heavyweight French Terry and fleece hoodies with custom tonal and graphic branding.',
      buttonText: 'CREATE HOODIE',
      image: PRODUCTS.find((p) => p.id === 'streetwear-heavyweight-hoodie-onyx')?.image || PRODUCTS[1]?.image,
    },
    {
      id: 'jerseys',
      name: 'JERSEYS',
      typeValue: 'Jersey',
      description: 'High-performance moisture-wicking jerseys engineered for athletic squads and esports rosters.',
      buttonText: 'CREATE JERSEY',
      image: PRODUCTS.find((p) => p.id === 'gaming-cyber-pro-jersey-01')?.image || PRODUCTS[6]?.image,
    },
    {
      id: 'tracksuits',
      name: 'TRACKSUITS',
      typeValue: 'Tracksuit',
      description: 'Cohesive tailored athletic tracksuits and warmups crafted for teams, clubs and squads.',
      buttonText: 'CREATE TRACKSUIT',
      image: PRODUCTS.find((p) => p.id === 'gymwear-elite-recovery-pants-09')?.image || PRODUCTS[19]?.image,
    },
    {
      id: 'sportswear',
      name: 'SPORTSWEAR',
      typeValue: 'Other',
      description: 'Compression gear, performance tanks and technical training apparel engineered to move.',
      buttonText: 'CREATE SPORTSWEAR',
      image: PRODUCTS.find((p) => p.id === 'gymwear-performance-compression-tee-01')?.image || PRODUCTS[11]?.image,
    },
  ]

  const howItWorksSteps = [
    {
      num: '01',
      title: 'CHOOSE',
      desc: 'Choose your apparel type, silhouette, and base color specification.',
    },
    {
      num: '02',
      title: 'DESIGN',
      desc: 'Share your artwork, logo or design idea with our studio design team.',
    },
    {
      num: '03',
      title: 'PRODUCE',
      desc: 'KALA handles precision printing, embroidery, and rigorous quality inspection.',
    },
    {
      num: '04',
      title: 'DELIVER',
      desc: 'Your custom apparel is prepared, packaged and delivered to your doorstep.',
    },
  ]

  const customerInputs = [
    'Existing Design',
    'Official Logo',
    'Original Artwork',
    'Reference Image',
    'Team / Squad Name',
    'College / Campus Name',
    'Brand Identity',
    'Custom Typography',
  ]

  return (
    <main className="kala-custom-page">
      {/* 1. HERO SECTION */}
      <section className="kala-container">
        <div className="kala-custom-hero">
          <div className="kala-custom-hero-content">
            <p className="kala-label kala-custom-hero-badge">CUSTOM STUDIO</p>
            <h1 className="kala-custom-hero-title">MAKE IT YOURS.</h1>
            <p className="kala-custom-hero-desc">
              Create custom apparel designed around your team, community, event, brand, or personal style.
              Engineered with KALA luxury fabrics, heavyweight cotton, and precision garment finishes.
            </p>
            <div className="kala-custom-hero-ctas">
              <button
                type="button"
                className="kala-custom-cta-btn kala-custom-cta-primary"
                onClick={() => scrollToForm()}
              >
                <span className="kala-custom-cta-content">
                  <svg
                    className="kala-custom-cta-icon"
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
                  <span>START YOUR DESIGN</span>
                </span>
                <svg
                  className="kala-custom-cta-arrow"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
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
                className="kala-custom-cta-btn kala-custom-cta-secondary"
                onClick={scrollToCategories}
              >
                <span className="kala-custom-cta-content">
                  <svg
                    className="kala-custom-cta-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                  </svg>
                  <span>VIEW APPAREL</span>
                </span>
                <svg
                  className="kala-custom-cta-arrow"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
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

          <div className="kala-custom-hero-visual">
            <img
              src={heroImage}
              alt="KALA Custom Studio apparel showcase"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION ("WHAT CAN YOU CREATE?") */}
      <section ref={categoriesRef} id="categories" className="kala-container kala-custom-section">
        <div className="kala-section-header">
          <p className="kala-label" style={{ color: 'var(--kala-orange)', marginBottom: '0.5rem' }}>
            APPAREL SELECTION
          </p>
          <h2 className="kala-section-title">WHAT CAN YOU CREATE?</h2>
          <p className="kala-section-subtitle">
            From heavy street silhouettes to tournament esports jerseys — select your base canvas to get started.
          </p>
        </div>

        <div className="kala-categories-grid">
          {categories.map((cat) => (
            <article key={cat.id} className="kala-category-card">
              <div className="kala-category-card-img-wrap">
                <img src={cat.image} alt={cat.name} loading="lazy" />
              </div>
              <div className="kala-category-card-body">
                <h3 className="kala-category-card-title">{cat.name}</h3>
                <p className="kala-category-card-desc">{cat.description}</p>
                <button
                  type="button"
                  className="kala-btn-primary kala-category-card-btn"
                  onClick={() => scrollToForm(cat.typeValue)}
                >
                  {cat.buttonText}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="kala-container kala-custom-section">
        <div className="kala-section-header center">
          <p className="kala-label" style={{ color: 'var(--kala-orange)', marginBottom: '0.5rem' }}>
            THE PROCESS
          </p>
          <h2 className="kala-section-title">HOW IT WORKS</h2>
          <p className="kala-section-subtitle" style={{ margin: '0 auto' }}>
            A streamlined 4-step journey from your creative concept to finished luxury apparel.
          </p>
        </div>

        <div className="kala-steps-grid">
          {howItWorksSteps.map((step) => (
            <div key={step.num} className="kala-step-card">
              <div className="kala-step-num">{step.num}</div>
              <h3 className="kala-step-title">{step.title}</h3>
              <p className="kala-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DESIGN WITH KALA */}
      <section className="kala-container kala-custom-section">
        <div className="kala-section-header">
          <p className="kala-label" style={{ color: 'var(--kala-orange)', marginBottom: '0.5rem' }}>
            YOUR CREATIVE ASSETS
          </p>
          <h2 className="kala-section-title">DESIGN WITH KALA</h2>
          <p className="kala-section-subtitle">
            Whether you have finalized vector files or just a rough sketch, our studio works with whatever you have.
          </p>
        </div>

        <div className="kala-design-features-grid">
          {customerInputs.map((item) => (
            <div key={item} className="kala-design-feature-pill">
              {item}
            </div>
          ))}
        </div>

        <div className="kala-custom-order-cta-wrap">
          <button
            type="button"
            className="kala-custom-cta-btn kala-custom-cta-primary"
            onClick={() => scrollToForm()}
          >
            <span className="kala-custom-cta-content">
              <svg
                className="kala-custom-cta-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
              </svg>
              <span>START A CUSTOM ORDER</span>
            </span>
            <svg
              className="kala-custom-cta-arrow"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </section>

      {/* 5. CUSTOM ORDER FORM */}
      <section ref={formRef} id="custom-form" className="kala-container kala-custom-section" style={{ borderBottom: 'none' }}>
        <div className="kala-section-header center">
          <p className="kala-label" style={{ color: 'var(--kala-orange)', marginBottom: '0.5rem' }}>
            CUSTOM STUDIO FORM
          </p>
          <h2 className="kala-section-title">SUBMIT YOUR DESIGN BRIEF</h2>
          <p className="kala-section-subtitle" style={{ margin: '0 auto' }}>
            Tell us about your apparel requirements and our production team will get in touch.
          </p>
        </div>

        {submittedRequest ? (
          <div className="kala-request-success-card">
            <div className="kala-request-success-check">✓</div>
            <h3 className="kala-h2" style={{ marginBottom: '0.75rem' }}>
              REQUEST RECEIVED
            </h3>
            <p className="kala-body" style={{ color: 'var(--kala-text-secondary)', marginBottom: '1.5rem' }}>
              Your custom apparel request has been received. Our studio team will review your specifications and contact you shortly.
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
                <span className="kala-label">REQUEST ID:</span>
                <span style={{ fontWeight: 700, color: 'var(--kala-orange)' }}>{submittedRequest.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--kala-text-secondary)' }}>Customer:</span>
                <span style={{ fontWeight: 600 }}>{submittedRequest.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--kala-text-secondary)' }}>Apparel Type:</span>
                <span style={{ fontWeight: 600 }}>{submittedRequest.apparelType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--kala-text-secondary)' }}>Quantity:</span>
                <span style={{ fontWeight: 600 }}>{submittedRequest.quantity} Units</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--kala-text-secondary)' }}>Printing Method:</span>
                <span style={{ fontWeight: 600 }}>{submittedRequest.printingType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--kala-text-secondary)' }}>Status:</span>
                <span style={{ fontWeight: 700, color: 'var(--kala-black)', textTransform: 'capitalize' }}>
                  {submittedRequest.status}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="kala-btn-primary"
              onClick={handleResetForm}
            >
              SUBMIT ANOTHER REQUEST
            </button>
          </div>
        ) : (
          <div className="kala-custom-form-container">
            <form onSubmit={handleSubmit} noValidate>
              {/* Row 1: Name & Email */}
              <div className="kala-form-row two-col">
                <div className="kala-form-group">
                  <label className="kala-form-label" htmlFor="custom-name">
                    FULL NAME *
                  </label>
                  <input
                    id="custom-name"
                    type="text"
                    className={`kala-form-input ${errors.name ? 'error' : ''}`}
                    placeholder="e.g. Arjun Mehta"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
                      if (submitError) setSubmitError(null)
                    }}
                  />
                  {errors.name && <p className="kala-form-error">{errors.name}</p>}
                </div>

                <div className="kala-form-group">
                  <label className="kala-form-label" htmlFor="custom-email">
                    EMAIL ADDRESS *
                  </label>
                  <input
                    id="custom-email"
                    type="email"
                    className={`kala-form-input ${errors.email ? 'error' : ''}`}
                    placeholder="e.g. arjun@kala.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
                      if (submitError) setSubmitError(null)
                    }}
                  />
                  {errors.email && <p className="kala-form-error">{errors.email}</p>}
                </div>
              </div>

              {/* Row 2: Phone & Apparel Type */}
              <div className="kala-form-row two-col">
                <div className="kala-form-group">
                  <label className="kala-form-label" htmlFor="custom-phone">
                    PHONE NUMBER *
                  </label>
                  <input
                    id="custom-phone"
                    type="tel"
                    className={`kala-form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }))
                      if (submitError) setSubmitError(null)
                    }}
                  />
                  {errors.phone && <p className="kala-form-error">{errors.phone}</p>}
                </div>

                <div className="kala-form-group">
                  <label className="kala-form-label" htmlFor="custom-apparel-type">
                    APPAREL TYPE *
                  </label>
                  <select
                    id="custom-apparel-type"
                    className="kala-form-select"
                    value={apparelType}
                    onChange={(e) => setApparelType(e.target.value)}
                  >
                    <option value="T-Shirt">T-Shirt</option>
                    <option value="Oversized T-Shirt">Oversized T-Shirt</option>
                    <option value="Hoodie">Hoodie</option>
                    <option value="Jersey">Jersey</option>
                    <option value="Tracksuit">Tracksuit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Quantity, Size Range, Printing Type */}
              <div className="kala-form-row three-col">
                <div className="kala-form-group">
                  <label className="kala-form-label" htmlFor="custom-quantity">
                    QUANTITY *
                  </label>
                  <input
                    id="custom-quantity"
                    type="number"
                    min="1"
                    className={`kala-form-input ${errors.quantity ? 'error' : ''}`}
                    value={quantity}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Number(e.target.value)
                      setQuantity(val)
                      if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: '' }))
                      if (submitError) setSubmitError(null)
                    }}
                  />
                  {errors.quantity && <p className="kala-form-error">{errors.quantity}</p>}
                </div>

                <div className="kala-form-group">
                  <label className="kala-form-label" htmlFor="custom-size-range">
                    SIZE RANGE
                  </label>
                  <select
                    id="custom-size-range"
                    className="kala-form-select"
                    value={sizeRange}
                    onChange={(e) => setSizeRange(e.target.value)}
                  >
                    <option value="Mixed Sizes (S–XXL)">Mixed Sizes (S–XXL)</option>
                    <option value="Standard (M, L, XL)">Standard (M, L, XL)</option>
                    <option value="Only S and M">Only S and M</option>
                    <option value="Only L and XL">Only L and XL</option>
                    <option value="Custom Size Distribution">Custom Size Distribution</option>
                  </select>
                </div>

                <div className="kala-form-group">
                  <label className="kala-form-label" htmlFor="custom-printing-type">
                    PRINTING TYPE
                  </label>
                  <select
                    id="custom-printing-type"
                    className="kala-form-select"
                    value={printingType}
                    onChange={(e) => setPrintingType(e.target.value)}
                  >
                    <option value="Screen Printing">Screen Printing</option>
                    <option value="DTF">DTF (Direct to Film)</option>
                    <option value="DTG">DTG (Direct to Garment)</option>
                    <option value="Sublimation">Sublimation</option>
                    <option value="Embroidery">Embroidery</option>
                    <option value="Not Sure">Not Sure / Advise Me</option>
                  </select>
                </div>
              </div>

              {/* Design Description */}
              <div className="kala-form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="kala-form-label" htmlFor="custom-description">
                  DESIGN DESCRIPTION *
                </label>
                <textarea
                  id="custom-description"
                  className={`kala-form-textarea ${errors.description ? 'error' : ''}`}
                  placeholder="Describe your design, theme, logo placement (front chest, back print, sleeve), colors, or typography requirements..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    if (errors.description) setErrors((prev) => ({ ...prev, description: '' }))
                    if (submitError) setSubmitError(null)
                  }}
                />
                {errors.description && <p className="kala-form-error">{errors.description}</p>}
              </div>

              {/* Additional Requirements */}
              <div className="kala-form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="kala-form-label" htmlFor="custom-additional">
                  ADDITIONAL REQUIREMENTS (OPTIONAL)
                </label>
                <textarea
                  id="custom-additional"
                  className="kala-form-textarea"
                  style={{ minHeight: '80px' }}
                  placeholder="Any special timeline, packaging, custom neck labels, fabric GSM preferences, or delivery instructions..."
                  value={additionalRequirements}
                  onChange={(e) => setAdditionalRequirements(e.target.value)}
                />
              </div>

              {/* File Upload UI (Frontend state only) */}
              <div className="kala-form-group" style={{ marginBottom: '2rem' }}>
                <label className="kala-form-label">
                  ATTACH ARTWORK / LOGO / REFERENCE (OPTIONAL)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.ai,.psd,.eps"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <div
                  className="kala-file-upload-box"
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      fileInputRef.current?.click()
                    }
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ margin: '0 auto 0.5rem', display: 'block', color: 'var(--kala-text-secondary)' }}
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--kala-black)' }}>
                    Click to select artwork or reference file
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--kala-text-secondary)', marginTop: '0.25rem' }}>
                    PNG, JPG, PDF, AI, PSD or SVG (Stored locally during design review)
                  </p>
                </div>
                {uploadedFileName && (
                  <p className="kala-file-name-preview">
                    Selected file: {uploadedFileName}
                  </p>
                )}
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
                    lineHeight: 1.4,
                  }}
                >
                  {submitError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="kala-btn-primary"
                style={{ width: '100%', padding: '1rem' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'SUBMITTING REQUEST...' : 'SUBMIT CUSTOM REQUEST'}
              </button>
            </form>
          </div>
        )}
      </section>
    </main>
  )
}

export default CustomApparel
