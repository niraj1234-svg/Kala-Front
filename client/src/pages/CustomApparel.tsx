import React, { useState, useEffect, useRef } from 'react'
import { PRODUCTS } from '../data/products'
import { saveCustomRequest } from '../types/requests'
import { createCustomRequest } from '../services/customRequestApi'
import type { CustomRequestInput } from '../services/customRequestApi'
import HowItWorks from '../components/HowItWorks'
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

  const designOptions = [
    {
      id: 'existing-design',
      title: 'EXISTING DESIGN',
      desc: 'Use your ready design files.',
      type: 'image',
      image: '/custom-apparel/kala-card-black-tee.jpg',
    },
    {
      id: 'official-logo',
      title: 'OFFICIAL LOGO',
      desc: 'Use your official logo/brand assets.',
      type: 'logo',
    },
    {
      id: 'original-artwork',
      title: 'ORIGINAL ARTWORK',
      desc: 'Share your hand-drawn ideas or concepts.',
      type: 'artwork',
    },
    {
      id: 'reference-image',
      title: 'REFERENCE IMAGE',
      desc: 'Share reference images you like.',
      type: 'reference',
    },
    {
      id: 'team-squad-name',
      title: 'TEAM / SQUAD NAME',
      desc: 'Add your team or squad name.',
      type: 'team',
    },
    {
      id: 'college-campus-name',
      title: 'COLLEGE / CAMPUS NAME',
      desc: 'Add your college or campus name.',
      type: 'campus',
    },
    {
      id: 'brand-identity',
      title: 'BRAND IDENTITY',
      desc: 'Share your brand style and preferences.',
      type: 'brand',
    },
    {
      id: 'custom-typography',
      title: 'CUSTOM TYPOGRAPHY',
      desc: 'Use custom fonts or text styles.',
      type: 'typography',
    },
  ]

  const renderDesignOptionIcon = (type: string, image?: string) => {
    switch (type) {
      case 'image':
        return (
          <div className="kala-studio-card-icon-wrap is-image">
            <svg className="kala-studio-card-spark-tl" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 11L6 8M5 4L8 6" stroke="#E05305" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
            <img src={image} alt="T-Shirt design" className="kala-studio-card-img" loading="lazy" />
          </div>
        )
      case 'logo':
        return (
          <div className="kala-studio-card-icon-wrap is-logo">
            <svg width="46" height="40" viewBox="0 0 54 44" fill="none" aria-hidden="true">
              <path d="M10 24L7 11L19 17L27 6L35 17L47 11L44 24Z" stroke="#111111" strokeWidth="2.4" strokeLinejoin="round" fill="none" />
              <circle cx="7" cy="11" r="1.8" fill="#111111" />
              <circle cx="27" cy="6" r="1.8" fill="#111111" />
              <circle cx="47" cy="11" r="1.8" fill="#111111" />
              <ellipse cx="27" cy="24" rx="17" ry="2.8" stroke="#111111" strokeWidth="2" />
              <text x="27" y="39" textAnchor="middle" fontFamily="'Caveat', cursive, sans-serif" fontSize="16" fontWeight="700" fill="#111111" letterSpacing="0.05em">KALA</text>
            </svg>
          </div>
        )
      case 'artwork':
        return (
          <div className="kala-studio-card-icon-wrap is-artwork">
            <svg width="44" height="40" viewBox="0 0 46 44" fill="none" aria-hidden="true">
              <path d="M5 12L9 15M2 23L7 23M5 34L9 31M41 12L37 15M44 23L39 23M41 34L37 31M23 4L23 9" stroke="#E05305" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M16 22C14 19 13.5 16 16 12C18.5 8 27.5 8 30 12C32.5 16 32 19 30 22C28.5 24.5 28 27 28 29H18C18 27 17.5 24.5 16 22Z" stroke="#111111" strokeWidth="2.4" strokeLinejoin="round" fill="none" />
              <path d="M19 32H27M21 35H25" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        )
      case 'reference':
        return (
          <div className="kala-studio-card-icon-wrap is-reference">
            <svg width="46" height="42" viewBox="0 0 52 46" fill="none" aria-hidden="true">
              <rect x="4" y="6" width="30" height="34" rx="2" transform="rotate(-7 4 6)" stroke="#111111" strokeWidth="2.2" fill="#FFFFFF" />
              <rect x="18" y="4" width="30" height="36" rx="2" transform="rotate(6 18 4)" stroke="#111111" strokeWidth="2.2" fill="#FFFFFF" />
              <path d="M22 26L28 17L33 23L37 19L44 28" stroke="#111111" strokeWidth="2" strokeLinejoin="round" fill="none" />
              <circle cx="39" cy="13" r="2" fill="#E05305" />
              <rect x="25" y="1" width="14" height="5.5" rx="1" fill="#E05305" opacity="0.85" transform="rotate(6 25 1)" />
            </svg>
          </div>
        )
      case 'team':
        return (
          <div className="kala-studio-card-icon-wrap is-team">
            <svg width="46" height="40" viewBox="0 0 50 44" fill="none" aria-hidden="true">
              <path d="M22 5L24 1M28 5L30 1" stroke="#E05305" strokeWidth="2" strokeLinecap="round" />
              <circle cx="25" cy="13" r="4.5" stroke="#111111" strokeWidth="2.2" fill="none" />
              <path d="M17 26C17 21.5 19.5 19.5 25 19.5C30.5 19.5 33 21.5 33 26" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <circle cx="12" cy="18" r="3.5" stroke="#111111" strokeWidth="2" fill="none" />
              <path d="M5 30C5 26.5 8 24.5 13 24.5" stroke="#111111" strokeWidth="2" strokeLinecap="round" fill="none" />
              <circle cx="38" cy="18" r="3.5" stroke="#111111" strokeWidth="2" fill="none" />
              <path d="M45 30C45 26.5 42 24.5 37 24.5" stroke="#111111" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        )
      case 'campus':
        return (
          <div className="kala-studio-card-icon-wrap is-campus">
            <svg width="46" height="40" viewBox="0 0 50 44" fill="none" aria-hidden="true">
              <path d="M25 2V10M25 2L31 5L25 7" stroke="#E05305" strokeWidth="2" strokeLinejoin="round" fill="#E05305" />
              <path d="M20 10H30V15H20V10Z" stroke="#111111" strokeWidth="1.9" fill="none" />
              <path d="M12 20L25 13L38 20H12Z" stroke="#111111" strokeWidth="2.2" strokeLinejoin="round" fill="none" />
              <path d="M15 20V32M21 20V32M29 20V32M35 20V32" stroke="#111111" strokeWidth="2" />
              <path d="M9 32H41V36H9V32Z" stroke="#111111" strokeWidth="2.2" fill="none" />
            </svg>
          </div>
        )
      case 'brand':
        return (
          <div className="kala-studio-card-icon-wrap is-brand">
            <svg width="44" height="40" viewBox="0 0 48 44" fill="none" aria-hidden="true">
              <path d="M5 9L10 7M8 14L13 13" stroke="#E05305" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M23 7L37 21C38 22 38 24 37 25L28 34C27 35 25 35 24 34L10 20V7H23Z" stroke="#111111" strokeWidth="2.2" strokeLinejoin="round" fill="none" />
              <circle cx="15" cy="12" r="2.2" stroke="#111111" strokeWidth="1.9" fill="none" />
              <path d="M13 10C11 6 8 6 6 8" stroke="#E05305" strokeWidth="1.9" strokeLinecap="round" />
            </svg>
          </div>
        )
      case 'typography':
        return (
          <div className="kala-studio-card-icon-wrap is-typography">
            <svg width="46" height="40" viewBox="0 0 50 44" fill="none" aria-hidden="true">
              <text x="6" y="30" fontFamily="'Inter', Georgia, serif" fontSize="28" fontWeight="900" fill="#111111">A</text>
              <text x="29" y="30" fontFamily="'Inter', sans-serif" fontSize="22" fontWeight="800" fill="#111111">a</text>
              <path d="M5 36C17 34 32 34 44 36" stroke="#E05305" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <main className="kala-custom-page">
      {/* 1. HERO SECTION (Latest Approved KALA Concept) */}
      <section className="kala-hero-editorial-section" aria-labelledby="custom-hero-title">
        <div className="kala-hero-editorial-container">
          <div className="kala-hero-editorial-grid">
            {/* Left Column: Typography, Supporting Text, CTAs */}
            <div className="kala-hero-left-content">
              {/* Eyebrow with horizontal line */}
              <div className="kala-hero-eyebrow-row">
                <span className="kala-hero-eyebrow-badge">CUSTOM STUDIO</span>
                <span className="kala-hero-eyebrow-rule" aria-hidden="true" />
              </div>

              {/* Main Heading */}
              <h1 id="custom-hero-title" className="kala-hero-display-title">
                MAKE IT<br />
                <span className="kala-hero-yours-word">YOURS.</span>
              </h1>

              {/* Short Supporting Text */}
              <p className="kala-hero-desc-text">
                Custom apparel for your team, event or brand.
              </p>

              {/* CTAs */}
              <div className="kala-hero-buttons-row">
                <button
                  type="button"
                  className="kala-hero-cta-btn kala-hero-cta-primary"
                  onClick={() => scrollToForm()}
                >
                  <span className="kala-hero-btn-inner">
                    <svg
                      className="kala-hero-btn-icon"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
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
                    className="kala-hero-btn-arrow"
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
                  className="kala-hero-cta-btn kala-hero-cta-secondary"
                  onClick={scrollToCategories}
                >
                  <span className="kala-hero-btn-inner">
                    <svg
                      className="kala-hero-btn-icon"
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
                      <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                    </svg>
                    <span>VIEW APPAREL</span>
                  </span>
                  <svg
                    className="kala-hero-btn-arrow"
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

            {/* Right Column: Floating 3D T-Shirt Scene */}
            <div className="kala-hero-right-stage" aria-hidden="true">
              <div className="kala-hero-floating-scene">
                {/* Floating T-shirt with Halo, Orbit Ring & Callouts */}
                <div className="kala-hero-shirt-floater">
                  <div className="kala-hero-shirt-scaler">
                    <img
                      src="/custom-apparel/kala-custom-hero-floating.png"
                      alt="KALA Custom Studio Floating Streetwear T-Shirt"
                      className="kala-hero-floating-shirt-img"
                      loading="eager"
                    />
                  </div>
                </div>

                {/* Soft Contact Floor Shadow */}
                <div className="kala-hero-floor-shadow" />
              </div>
            </div>
          </div>

          {/* Bottom Pagination Dots */}
          <div className="kala-hero-dots-row" aria-hidden="true">
            <span className="kala-hero-dot active" />
            <span className="kala-hero-dot" />
            <span className="kala-hero-dot" />
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
                  className="kala-btn kala-btn-primary kala-category-card-btn"
                  onClick={() => scrollToForm(cat.typeValue)}
                >
                  {cat.buttonText}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. HOW IT WORKS / THE PROCESS (Redesigned Editorial Streetwear Flow) */}
      <HowItWorks
        onPickStyle={scrollToCategories}
        onShareIdea={() => scrollToForm()}
        onGetStarted={() => scrollToForm()}
      />

      {/* 4. DESIGN WITH KALA (Editorial Streetwear Studio) */}
      <section className="kala-studio-section" aria-labelledby="design-with-kala-title">
        <div className="kala-studio-container">
          {/* Header Block & Upper Right Visual */}
          <div className="kala-studio-header-wrap">
            <div className="kala-studio-header-left">
              <div className="kala-studio-eyebrow-row">
                <span className="kala-studio-eyebrow">BRING YOUR IDEAS TO LIFE</span>
                <span className="kala-studio-eyebrow-dash" aria-hidden="true" />
              </div>
              <h2 id="design-with-kala-title" className="kala-studio-title">
                DESIGN WITH{' '}
                <span className="kala-studio-kala-highlight">
                  KALA
                  <svg className="kala-studio-title-underline" viewBox="0 0 160 16" fill="none" aria-hidden="true">
                    <path d="M3 11C45 5 115 5 157 11" stroke="#111111" strokeWidth="3.4" strokeLinecap="round" />
                  </svg>
                </span>
              </h2>
              <p className="kala-studio-desc">
                Whether you have finalized vector files or just a rough sketch, our studio works with whatever you have.
              </p>
            </div>

            {/* Desktop Upper Badge: YOUR VISION OUR CRAFT */}
            <div className="kala-studio-badge kala-badge-vision" aria-hidden="true">
              <div className="kala-badge-spark-top">
                <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
                  <path d="M3 10L1 2M11 10L11 1M18 10L21 3" stroke="#E05305" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="kala-badge-text">YOUR</span>
              <span className="kala-badge-text">VISION</span>
              <span className="kala-badge-text">OUR CRAFT</span>
              <svg className="kala-badge-brush-curve" viewBox="0 0 120 14" fill="none">
                <path d="M2 9C40 4 85 5 118 8" stroke="#E05305" strokeWidth="3.4" strokeLinecap="round" />
              </svg>
            </div>

            {/* Upper Right Apparel Visual */}
            <div className="kala-studio-apparel-stage" aria-hidden="true">
              <img
                src="/custom-apparel/kala-editorial-tee.jpg"
                alt="KALA Custom Studio Heavyweight Apparel"
                className="kala-studio-apparel-img"
                loading="lazy"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="kala-studio-cards-row">
            {designOptions.map((item) => (
              <div
                key={item.id}
                className="kala-studio-card"
                onClick={() => scrollToForm()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    scrollToForm()
                  }
                }}
                aria-label={`${item.title}: ${item.desc}. Click to start custom order.`}
              >
                <div className="kala-studio-card-icon-slot">
                  {renderDesignOptionIcon(item.type, item.image)}
                </div>
                <div className="kala-studio-card-content">
                  <h3 className="kala-studio-card-heading">{item.title}</h3>
                  <p className="kala-studio-card-text">{item.desc}</p>
                </div>
                <div className="kala-studio-card-foot">
                  <span className="kala-studio-card-circle-arrow" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Area: CTA, Trust Badges, and Lower Right Badge */}
          <div className="kala-studio-bottom-wrap">
            <div className="kala-studio-cta-group">
              <button
                type="button"
                className="kala-studio-primary-cta"
                onClick={() => scrollToForm()}
              >
                <span className="kala-studio-cta-inner">
                  <svg
                    className="kala-studio-cta-shirt"
                    width="19"
                    height="19"
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
                  className="kala-studio-cta-chevron"
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

              <div className="kala-studio-trust-row">
                <span className="kala-trust-item">
                  <svg className="kala-trust-shield-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E05305" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  Fast Response
                </span>
                <span className="kala-trust-pipe" aria-hidden="true">|</span>
                <span className="kala-trust-item">Expert Design Support</span>
                <span className="kala-trust-pipe" aria-hidden="true">|</span>
                <span className="kala-trust-item">High Quality Output</span>
              </div>
            </div>

            {/* Desktop Lower Right Badge: FROM CONCEPT TO CULTURE */}
            <div className="kala-studio-badge kala-badge-concept" aria-hidden="true">
              <div className="kala-badge-spark-tr">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 16L15 4M16 12L18 8M9 18L13 16" stroke="#E05305" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="kala-badge-text">FROM</span>
              <span className="kala-badge-text">CONCEPT</span>
              <span className="kala-badge-text">TO CULTURE</span>
              <svg className="kala-badge-brush-curve stroke-wide" viewBox="0 0 140 14" fill="none">
                <path d="M2 9C40 4 100 5 137 9" stroke="#E05305" strokeWidth="3.6" strokeLinecap="round" />
              </svg>
            </div>
          </div>
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
              className="kala-cta-btn kala-cta-primary"
              onClick={handleResetForm}
              style={{ minWidth: '240px', justifyContent: 'center' }}
            >
              <span className="kala-cta-content">
                <span>SUBMIT ANOTHER REQUEST</span>
              </span>
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
                className="kala-cta-btn kala-cta-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={isSubmitting}
              >
                <span className="kala-cta-content">
                  <span className="kala-cta-icon" aria-hidden="true">
                    {isSubmitting ? (
                      <svg
                        className="kala-spin"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    )}
                  </span>
                  <span>{isSubmitting ? 'SUBMITTING REQUEST...' : 'SUBMIT CUSTOM REQUEST'}</span>
                </span>
                {!isSubmitting && (
                  <span className="kala-cta-arrow" aria-hidden="true">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                )}
              </button>
            </form>
          </div>
        )}
      </section>
    </main>
  )
}

export default CustomApparel
