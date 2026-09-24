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

  const heroRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const categoriesRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (typeof window === 'undefined' || window.innerWidth <= 1024) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    e.currentTarget.style.setProperty('--mouse-x', x.toFixed(3))
    e.currentTarget.style.setProperty('--mouse-y', y.toFixed(3))
  }

  const handleHeroMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty('--mouse-x', '0')
    e.currentTarget.style.setProperty('--mouse-y', '0')
  }

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
      buttonText: 'CREATE T-SHIRT',
      image: '/custom-apparel/kala-custom-hero-floating.png',
    },
    {
      id: 'oversized-t-shirts',
      name: 'OVERSIZED T-SHIRTS',
      typeValue: 'Oversized T-Shirt',
      buttonText: 'CREATE OVERSIZED TEE',
      image: PRODUCTS.find((p) => p.id === 'streetwear-oversized-acid-tee')?.image || PRODUCTS[0]?.image,
    },
    {
      id: 'hoodies',
      name: 'HOODIES',
      typeValue: 'Hoodie',
      buttonText: 'CREATE HOODIE',
      image: PRODUCTS.find((p) => p.id === 'streetwear-heavyweight-hoodie-onyx')?.image || PRODUCTS[1]?.image,
    },
    {
      id: 'jerseys',
      name: 'JERSEYS',
      typeValue: 'Jersey',
      buttonText: 'CREATE JERSEY',
      image: PRODUCTS.find((p) => p.id === 'gaming-cyber-pro-jersey-01')?.image || PRODUCTS[6]?.image,
    },
    {
      id: 'tracksuits',
      name: 'TRACKSUITS',
      typeValue: 'Tracksuit',
      buttonText: 'CREATE TRACKSUIT',
      image: PRODUCTS.find((p) => p.id === 'gymwear-elite-recovery-pants-09')?.image || PRODUCTS[19]?.image,
    },
    {
      id: 'sportswear',
      name: 'SPORTSWEAR',
      typeValue: 'Other',
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

  const renderCategoryIcon = (id: string) => {
    switch (id) {
      case 'custom-t-shirts':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 3L2 8L6 10L6 21H18L18 10L22 8L18 3C18 3 15 5 12 5C9 5 6 3 6 3Z" />
          </svg>
        )
      case 'oversized-t-shirts':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 4L1 10L5 12L5 22H19L19 12L23 10L19 4C19 4 16 6 12 6C8 6 5 4 5 4Z" />
            <path d="M9 4C9 5.6 10.3 7 12 7C13.7 7 15 5.6 15 4" />
          </svg>
        )
      case 'hoodies':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 6C7 3.5 9.2 2 12 2C14.8 2 17 3.5 17 6L21 9L18 12L18 22H6L6 12L3 9L7 6Z" />
            <path d="M9 16H15V19H9V16Z" />
          </svg>
        )
      case 'jerseys':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 4L3 8L6 10L6 21H18L18 10L21 8L17 4L12 7L7 4Z" />
            <path d="M10 4L12 7L14 4" />
          </svg>
        )
      case 'tracksuits':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6L1 9L3 11V20H10V11L12 9L10 6C10 6 8.5 7 6.5 7C4.5 7 3 6 3 6Z" />
            <line x1="6.5" y1="7" x2="6.5" y2="20" />
            <path d="M14 6H21L22 20H19L17.5 12L16 20H13L14 6Z" />
          </svg>
        )
      case 'sportswear':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 3C8 6 9 7 9 10L5 11V21H19V11L15 10C15 7 16 6 17 3H14C13 5.5 11 5.5 10 3H7Z" />
          </svg>
        )
      default:
        return null
    }
  }

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
      {/* 1. HERO SECTION (Approved KALA Streetwear Custom Studio) */}
      <section
        ref={heroRef}
        className="kala-hero-editorial-section"
        aria-labelledby="custom-hero-title"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        <div className="kala-hero-editorial-container">
          <div className="kala-hero-editorial-grid">
            {/* Left Column: Typography, Supporting Text, CTAs */}
            <div className="kala-hero-left-content">
              {/* Small Orange Eyebrow */}
              <div className="kala-hero-eyebrow-row">
                <span className="kala-hero-eyebrow-badge">CUSTOM STUDIO</span>
                <span className="kala-hero-eyebrow-rule" aria-hidden="true" />
              </div>

              {/* Main Heading */}
              <h1 id="custom-hero-title" className="kala-hero-display-title">
                MAKE IT<br />
                <span className="kala-hero-yours-word">YOURS.</span>
              </h1>

              {/* Supporting Text */}
              <p className="kala-hero-desc-text">
                Custom apparel for your team, event or brand.
              </p>

              {/* CTA 1 & CTA 2 */}
              <div className="kala-hero-buttons-row">
                <button
                  type="button"
                  className="kala-hero-cta-btn kala-hero-cta-primary"
                  onClick={() => scrollToForm()}
                >
                  <span className="kala-hero-btn-inner">
                    <span className="kala-hero-btn-symbol" aria-hidden="true">✎</span>
                    <span>START YOUR DESIGN</span>
                  </span>
                  <span className="kala-hero-btn-arrow" aria-hidden="true">→</span>
                </button>

                <button
                  type="button"
                  className="kala-hero-cta-btn kala-hero-cta-secondary"
                  onClick={scrollToCategories}
                >
                  <span className="kala-hero-btn-inner">
                    <span className="kala-hero-btn-symbol" aria-hidden="true">♧</span>
                    <span>VIEW APPAREL</span>
                  </span>
                  <span className="kala-hero-btn-arrow" aria-hidden="true">→</span>
                </button>
              </div>
            </div>

            {/* Right Column: Floating 3D T-Shirt Scene with Orbit & Annotation */}
            <div className="kala-hero-right-stage" aria-label="KALA Custom Studio Streetwear Showcase">
              <div className="kala-hero-floating-scene">
                {/* 1. Subtle Cream / Orange Circular Halo Glow */}
                <div className="kala-hero-halo" aria-hidden="true" />

                {/* 2. Orange Orbit Ring - Back Arc (behind shirt) */}
                <div className="kala-hero-orbit-wrap kala-hero-orbit-back" aria-hidden="true">
                  <svg
                    className="kala-hero-orbit-svg"
                    viewBox="0 0 640 320"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M 40,160 C 40,75 600,75 600,160"
                      stroke="#E94B00"
                      strokeWidth="1.8"
                      strokeDasharray="6 6"
                      className="kala-hero-orbit-path-back"
                    />
                  </svg>
                </div>

                {/* 3. Floating & Tilting T-shirt Wrapper */}
                <div className="kala-hero-shirt-floater">
                  <div className="kala-hero-shirt-tilter">
                    <div className="kala-hero-shirt-scaler">
                      <img
                        src="/custom-apparel/kala-custom-hero-floating.png"
                        alt="KALA Custom Studio Oversized Cotton T-Shirt"
                        className="kala-hero-floating-shirt-img"
                        loading="eager"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Orange Orbit Ring - Front Arc (in front of shirt) */}
                <div className="kala-hero-orbit-wrap kala-hero-orbit-front" aria-hidden="true">
                  <svg
                    className="kala-hero-orbit-svg"
                    viewBox="0 0 640 320"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M 600,160 C 600,245 40,245 40,160"
                      stroke="#E94B00"
                      strokeWidth="2.2"
                      strokeDasharray="8 6"
                      className="kala-hero-orbit-path-front"
                    />
                  </svg>
                </div>

                {/* 5. Orbit 360° Rotating System with 360° VIEW Badge */}
                <div className="kala-hero-orbit-carrier" aria-hidden="true">
                  <div className="kala-hero-360-badge">
                    <span className="kala-hero-360-dot" />
                    <div className="kala-hero-360-text-col">
                      <span className="kala-hero-360-degree">360°</span>
                      <span className="kala-hero-360-sub">VIEW</span>
                    </div>
                  </div>
                </div>

                {/* 6. "YOUR DESIGN HERE" Handwritten Annotation */}
                <div className="kala-hero-callout-wrap" aria-hidden="true">
                  <div className="kala-hero-callout-text">
                    <span>YOUR</span>
                    <span>DESIGN</span>
                    <span>HERE</span>
                  </div>
                  <svg
                    className="kala-hero-callout-arrow"
                    width="54"
                    height="54"
                    viewBox="0 0 60 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M 48,10 C 38,26 24,38 12,46"
                      stroke="#E94B00"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 10,34 L 11,48 L 24,47"
                      stroke="#E94B00"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* 7. Dynamic Floor Shadow */}
                <div className="kala-hero-floor-shadow" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION ("WHAT CAN YOU CREATE?") */}
      <section ref={categoriesRef} id="categories" className="kala-custom-selection-section">
        {/* Subtle Background Watermarks */}
        <div className="kala-categories-watermark" aria-hidden="true">KALA</div>
        <div className="kala-categories-watermark-left" aria-hidden="true">KALA</div>

        <div className="kala-container kala-selection-container">
          {/* Section Header with Eyebrow, Main Title, Subtitle & Handwritten Annotation */}
          <div className="kala-selection-header-wrap">
            <div className="kala-selection-header-left">
              {/* Eyebrow: — APPAREL SELECTION — */}
              <div className="kala-selection-eyebrow-row">
                <span className="kala-selection-eyebrow-dash" aria-hidden="true">—</span>
                <span className="kala-selection-eyebrow-text">APPAREL SELECTION</span>
                <span className="kala-selection-eyebrow-dash" aria-hidden="true">—</span>
              </div>

              {/* Title: WHAT CAN YOU CREATE? with orange brush stroke */}
              <h2 className="kala-selection-title">
                WHAT CAN YOU{' '}
                <span className="kala-selection-orange-word">
                  CREATE?
                  <svg
                    className="kala-selection-title-brush"
                    viewBox="0 0 170 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 8C38 3 115 4 166 10"
                      stroke="#E94B00"
                      strokeWidth="3.6"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                  </svg>
                </span>
              </h2>

              {/* Supporting short line */}
              <p className="kala-selection-subtitle">
                Choose your canvas. Turn your ideas into apparel.
              </p>
            </div>

            {/* Top-Right Handwritten Annotation: .DIFFERENT APPAREL. SAME CREATIVITY. */}
            <div className="kala-selection-header-annotation" aria-hidden="true">
              <div className="kala-annotation-text">
                <span>.DIFFERENT</span>
                <span>APPAREL.</span>
                <span>SAME CREATIVITY.</span>
              </div>
              <svg
                className="kala-annotation-arrow"
                width="42"
                height="42"
                viewBox="0 0 50 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M42 6C34 18 20 28 8 36" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M7 23L7 38L22 38" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Category Cards Grid (Row 1: 4 standard cards | Row 2: 2 wide cards) */}
          <div className="kala-selection-grid">
            {categories.map((cat, index) => {
              const isWide = index >= 4

              return (
                <article
                  key={cat.id}
                  className={`kala-selection-card ${isWide ? 'kala-card-wide' : 'kala-card-standard'}`}
                >
                  {/* Card Visual Stage */}
                  <div className="kala-card-stage">
                    {/* Creative Background Brush / Hand-drawn Accents matching reference mockup */}
                    {cat.id === 'custom-t-shirts' && (
                      <>
                        <div className="kala-card-aura kala-aura-splash" aria-hidden="true" />
                        <svg className="kala-card-crown-top-left" viewBox="0 0 40 30" fill="none" aria-hidden="true">
                          <path d="M4 22L10 8L20 18L30 8L36 22H4Z" stroke="#E94B00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="kala-card-note kala-note-tee" aria-hidden="true">
                          <span>YOUR</span>
                          <span>DESIGN</span>
                          <span>HERE</span>
                          <svg width="22" height="26" viewBox="0 0 24 30" fill="none">
                            <path d="M18 4C14 12 8 18 4 24M4 24L4 16M4 24L12 24" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </>
                    )}

                    {cat.id === 'oversized-t-shirts' && (
                      <>
                        <div className="kala-card-aura kala-aura-glow" aria-hidden="true" />
                        <div className="kala-card-note kala-note-oversized" aria-hidden="true">
                          <span>BIGGER</span>
                          <span>IDEAS</span>
                          <svg width="20" height="26" viewBox="0 0 24 30" fill="none">
                            <path d="M18 4C14 12 8 18 4 24M4 24L4 16M4 24L12 24" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </>
                    )}

                    {cat.id === 'hoodies' && (
                      <>
                        <div className="kala-card-aura kala-aura-sun" aria-hidden="true" />
                        <svg className="kala-card-crown-top-right" viewBox="0 0 40 30" fill="none" aria-hidden="true">
                          <path d="M4 22L10 8L20 18L30 8L36 22H4Z" stroke="#E94B00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </>
                    )}

                    {cat.id === 'jerseys' && (
                      <>
                        <div className="kala-card-aura kala-aura-slash" aria-hidden="true" />
                        <div className="kala-card-note kala-note-jersey" aria-hidden="true">
                          <span>FOR</span>
                          <span>TEAMS</span>
                          <span>&amp; EVENTS</span>
                          <svg width="24" height="22" viewBox="0 0 28 24" fill="none">
                            <path d="M24 16C16 14 10 10 4 6M4 6L11 6M4 6L6 13" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </>
                    )}

                    {cat.id === 'tracksuits' && (
                      <>
                        <div className="kala-card-aura kala-aura-brush-wide" aria-hidden="true" />
                        <div className="kala-card-note kala-note-tracksuit" aria-hidden="true">
                          <span>TRAIN</span>
                          <span>TOGETHER</span>
                          <svg width="24" height="26" viewBox="0 0 28 30" fill="none">
                            <path d="M6 6C12 12 18 18 22 24M22 24L15 24M22 24L22 17" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </>
                    )}

                    {cat.id === 'sportswear' && (
                      <>
                        <div className="kala-card-aura kala-aura-brush-wide" aria-hidden="true" />
                        <div className="kala-card-sticky-card" aria-hidden="true">
                          <span>MOVE</span>
                          <span>CREATE</span>
                          <span>REPEAT</span>
                        </div>
                      </>
                    )}

                    {/* Product Image */}
                    <div className="kala-card-img-wrap">
                      <img
                        src={cat.image}
                        alt={`KALA ${cat.name}`}
                        loading="lazy"
                        className="kala-card-img"
                      />
                    </div>
                  </div>

                  {/* Card Bottom Action Shelf */}
                  <div className="kala-card-shelf">
                    <button
                      type="button"
                      className="kala-card-label-btn"
                      onClick={() => scrollToForm(cat.typeValue)}
                    >
                      <span className="kala-card-icon-wrap" aria-hidden="true">
                        {renderCategoryIcon(cat.id)}
                      </span>
                      <span className="kala-card-label-title">{cat.name}</span>
                      <span className="kala-card-label-arrow" aria-hidden="true">→</span>
                    </button>

                    <button
                      type="button"
                      className="kala-card-action-btn"
                      onClick={() => scrollToForm(cat.typeValue)}
                    >
                      <span>{cat.buttonText}</span>
                      <span className="kala-card-btn-arrow" aria-hidden="true">→</span>
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
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

      {/* 5. CUSTOM ORDER FORM / DESIGN BRIEF */}
      <section ref={formRef} id="custom-form" className="kala-brief-section">
        <div className="kala-brief-container">
          {/* LEFT SIDE — INTRODUCTION */}
          <div className="kala-brief-intro">
            <span className="kala-brief-eyebrow">CUSTOM STUDIO FORM</span>
            <h2 className="kala-brief-heading">
              <span className="kala-brief-heading-dark">SUBMIT YOUR</span>
              <span className="kala-brief-heading-orange">DESIGN BRIEF</span>
            </h2>
            <p className="kala-brief-desc">
              Tell us about your apparel requirements and our production team will get in touch.
            </p>
          </div>

          {/* RIGHT SIDE — FORM CARD */}
          <div className="kala-brief-card-wrap">
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
              <div className="kala-brief-card">
                <form onSubmit={handleSubmit} noValidate>
                  {/* SECTION 1 — CONTACT DETAILS */}
                  <div className="kala-brief-form-section">
                    <div className="kala-brief-section-header">
                      <span className="kala-brief-section-badge">1</span>
                      <h3 className="kala-brief-section-title">Contact Details</h3>
                      <div className="kala-brief-section-divider" aria-hidden="true" />
                    </div>

                    <div className="kala-brief-grid two-col">
                      <div className="kala-brief-field">
                        <label className="kala-brief-label" htmlFor="custom-name">
                          Full Name <span className="kala-brief-req">*</span>
                        </label>
                        <div className="kala-brief-input-wrap">
                          <span className="kala-brief-input-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </span>
                          <input
                            id="custom-name"
                            type="text"
                            className={`kala-brief-input ${errors.name ? 'error' : ''}`}
                            placeholder="e.g. Arjun Mehta"
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

                      <div className="kala-brief-field">
                        <label className="kala-brief-label" htmlFor="custom-email">
                          Email Address <span className="kala-brief-req">*</span>
                        </label>
                        <div className="kala-brief-input-wrap">
                          <span className="kala-brief-input-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                          </span>
                          <input
                            id="custom-email"
                            type="email"
                            className={`kala-brief-input ${errors.email ? 'error' : ''}`}
                            placeholder="e.g. arjun@kala.com"
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
                    </div>

                    <div className="kala-brief-field full-width">
                      <label className="kala-brief-label" htmlFor="custom-phone">
                        Phone Number <span className="kala-brief-req">*</span>
                      </label>
                      <div className="kala-brief-input-wrap">
                        <span className="kala-brief-input-icon" aria-hidden="true">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        </span>
                        <input
                          id="custom-phone"
                          type="tel"
                          className={`kala-brief-input ${errors.phone ? 'error' : ''}`}
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

                  {/* SECTION 2 — APPAREL DETAILS */}
                  <div className="kala-brief-form-section">
                    <div className="kala-brief-section-header">
                      <span className="kala-brief-section-badge">2</span>
                      <h3 className="kala-brief-section-title">Apparel Details</h3>
                      <div className="kala-brief-section-divider" aria-hidden="true" />
                    </div>

                    <div className="kala-brief-grid four-col">
                      <div className="kala-brief-field">
                        <label className="kala-brief-label" htmlFor="custom-apparel-type">
                          Apparel Type <span className="kala-brief-req">*</span>
                        </label>
                        <div className="kala-brief-input-wrap select-wrap">
                          <span className="kala-brief-input-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                            </svg>
                          </span>
                          <select
                            id="custom-apparel-type"
                            className="kala-brief-select"
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
                          <span className="kala-brief-chevron" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </span>
                        </div>
                      </div>

                      <div className="kala-brief-field">
                        <label className="kala-brief-label" htmlFor="custom-quantity">
                          Quantity <span className="kala-brief-req">*</span>
                        </label>
                        <div className="kala-brief-input-wrap">
                          <span className="kala-brief-input-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                              <line x1="12" y1="22.08" x2="12" y2="12" />
                            </svg>
                          </span>
                          <input
                            id="custom-quantity"
                            type="number"
                            min="1"
                            className={`kala-brief-input ${errors.quantity ? 'error' : ''}`}
                            placeholder="e.g. 25"
                            value={quantity}
                            onChange={(e) => {
                              const val = e.target.value === '' ? '' : Number(e.target.value)
                              setQuantity(val)
                              if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: '' }))
                              if (submitError) setSubmitError(null)
                            }}
                          />
                        </div>
                        {errors.quantity && <p className="kala-form-error">{errors.quantity}</p>}
                      </div>

                      <div className="kala-brief-field">
                        <label className="kala-brief-label" htmlFor="custom-size-range">
                          Size Range
                        </label>
                        <div className="kala-brief-input-wrap select-wrap">
                          <span className="kala-brief-input-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                              <line x1="7" y1="7" x2="7.01" y2="7" />
                            </svg>
                          </span>
                          <select
                            id="custom-size-range"
                            className="kala-brief-select"
                            value={sizeRange}
                            onChange={(e) => setSizeRange(e.target.value)}
                          >
                            <option value="Mixed Sizes (S–XXL)">Mixed Sizes (S–XXL)</option>
                            <option value="Standard (M, L, XL)">Standard (M, L, XL)</option>
                            <option value="Only S and M">Only S and M</option>
                            <option value="Only L and XL">Only L and XL</option>
                            <option value="Custom Size Distribution">Custom Size Distribution</option>
                          </select>
                          <span className="kala-brief-chevron" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </span>
                        </div>
                      </div>

                      <div className="kala-brief-field">
                        <label className="kala-brief-label" htmlFor="custom-printing-type">
                          Printing Type
                        </label>
                        <div className="kala-brief-input-wrap select-wrap">
                          <span className="kala-brief-input-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 6 2 18 2 18 9" />
                              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                              <rect x="6" y="14" width="12" height="8" />
                            </svg>
                          </span>
                          <select
                            id="custom-printing-type"
                            className="kala-brief-select"
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
                          <span className="kala-brief-chevron" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3 — DESIGN DETAILS */}
                  <div className="kala-brief-form-section">
                    <div className="kala-brief-section-header">
                      <span className="kala-brief-section-badge">3</span>
                      <h3 className="kala-brief-section-title">Design Details</h3>
                      <div className="kala-brief-section-divider" aria-hidden="true" />
                    </div>

                    <div className="kala-brief-grid two-col">
                      <div className="kala-brief-field">
                        <label className="kala-brief-label" htmlFor="custom-description">
                          Design Description <span className="kala-brief-req">*</span>
                        </label>
                        <textarea
                          id="custom-description"
                          className={`kala-brief-textarea ${errors.description ? 'error' : ''}`}
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

                      <div className="kala-brief-field">
                        <label className="kala-brief-label" htmlFor="custom-additional">
                          Additional Requirements (Optional)
                        </label>
                        <textarea
                          id="custom-additional"
                          className="kala-brief-textarea"
                          placeholder="Any special timeline, packaging, custom neck labels, fabric GSM preferences, or delivery instructions..."
                          value={additionalRequirements}
                          onChange={(e) => setAdditionalRequirements(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4 — ATTACH ARTWORK */}
                  <div className="kala-brief-form-section">
                    <div className="kala-brief-section-header">
                      <span className="kala-brief-section-badge">4</span>
                      <h3 className="kala-brief-section-title">Attach Artwork / Logo / Reference (Optional)</h3>
                      <div className="kala-brief-section-divider" aria-hidden="true" />
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.ai,.psd,.eps,.svg"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    <div
                      className="kala-brief-upload-box"
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          fileInputRef.current?.click()
                        }
                      }}
                    >
                      <div className="kala-brief-upload-icon-wrap" aria-hidden="true">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E85A2A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="16 16 12 12 8 16" />
                          <line x1="12" y1="12" x2="12" y2="21" />
                          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                        </svg>
                      </div>
                      <p className="kala-brief-upload-title">
                        Click to upload artwork or reference file
                      </p>
                      <p className="kala-brief-upload-subtitle">
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
                    <div className="kala-form-error-banner" role="alert" style={{ marginBottom: '1.25rem' }}>
                      {submitError}
                    </div>
                  )}

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    className="kala-brief-submit-btn"
                    disabled={isSubmitting}
                  >
                    <span className="kala-brief-submit-content">
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
                      <span>{isSubmitting ? 'SUBMITTING REQUEST...' : 'SUBMIT CUSTOM REQUEST'}</span>
                      {!isSubmitting && <span className="kala-brief-arrow">&rarr;</span>}
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

export default CustomApparel
