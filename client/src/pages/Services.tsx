import React, { useState, useEffect, useRef } from 'react'
import { DIGITAL_SERVICES, type DigitalService } from '../data/servicesData'
import { createBusinessRequest } from '../services/businessRequestApi'
import '../styles/Services.css'

export const Services: React.FC = () => {
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Web Development',
    'WhatsApp Auto Reply Bot',
  ])
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [projectDetails, setProjectDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const quoteFormRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  const toggleServiceSelection = (serviceTitle: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceTitle)
        ? prev.filter((s) => s !== serviceTitle)
        : [...prev, serviceTitle]
    )
  }

  const handleInquireClick = (serviceTitle: string) => {
    if (!selectedServices.includes(serviceTitle)) {
      setSelectedServices([serviceTitle])
    }
    quoteFormRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!name.trim() || !phone.trim()) {
      setErrorMessage('Please provide your name and phone number.')
      return
    }

    if (selectedServices.length === 0) {
      setErrorMessage('Please select at least one service.')
      return
    }

    setIsSubmitting(true)

    try {
      await createBusinessRequest({
        name,
        organization: organization || 'Individual / Startup',
        phone,
        email: email || `${phone}@client.kala`,
        organizationType: 'Digital & Tech Services',
        discussionTopics: selectedServices,
        projectDetails: `Services Requested: ${selectedServices.join(', ')}\nDetails: ${projectDetails}`,
        brandingRequirements: `Digital Solutions: ${selectedServices.join(', ')}`,
      })

      setSubmitSuccess(true)
    } catch (err: any) {
      console.error('[Services] Quote submission error:', err)
      // Even if backend fails, redirect to WhatsApp with prefilled requirement
      const waText = encodeURIComponent(
        `Hi KALA, I would like to request a quote for:\nServices: ${selectedServices.join(
          ', '
        )}\nName: ${name}\nOrg: ${organization || 'N/A'}\nPhone: ${phone}\nRequirements: ${projectDetails}`
      )
      window.open(`https://wa.me/919406030116?text=${waText}`, '_blank')
      setSubmitSuccess(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'globe':
        return (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        )
      case 'smartphone':
        return (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        )
      case 'message-circle':
        return (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <main className="kala-services-page" id="main-content">
      {/* ====================================================================
          1. HERO SECTION
          ==================================================================== */}
      <section className="kala-services-hero" aria-label="Digital Services Introduction">
        <div className="kala-services-hero-container">
          <div className="kala-services-pill-tag">
            <span className="kala-services-pill-dot" aria-hidden="true" />
            <span>TECH &amp; DIGITAL EXCELLENCE</span>
          </div>

          <h1 className="kala-services-hero-title">
            WEB DEV, APP DEV &amp; <span className="highlight">WHATSAPP AUTOMATION</span>
          </h1>

          <p className="kala-services-hero-desc">
            We provide full-stack digital engineering services to scale your business. From lightning-fast modern websites and native mobile apps to intelligent 24/7 WhatsApp auto-reply bots.
          </p>

          <div className="kala-services-hero-actions">
            <button
              type="button"
              className="kala-services-btn-primary"
              onClick={() => quoteFormRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span>REQUEST PROJECT QUOTE</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <a
              href="https://wa.me/919406030116?text=Hi%20KALA,%20I'd%20like%20to%20inquire%20about%20your%20Web%20Dev,%20App%20Dev%20and%20WhatsApp%20Bot%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="kala-services-btn-whatsapp"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 2C6.516 2 2.031 6.484 2.031 12c0 1.984.582 3.832 1.586 5.402L2 22l4.754-1.57A9.972 9.972 0 0012.031 22C17.547 22 22.031 17.516 22.031 12c0-5.516-4.484-10-10-10zm0 18.281c-1.742 0-3.375-.5-4.781-1.371l-.344-.215-2.828.934.95-2.754-.234-.375a8.23 8.23 0 01-1.344-4.496c0-4.57 3.711-8.281 8.281-8.281 4.57 0 8.281 3.711 8.281 8.281 0 4.57-3.711 8.281-8.281 8.281zm4.539-6.203c-.25-.125-1.477-.73-1.707-.812-.23-.086-.398-.125-.566.125-.168.25-.656.812-.805.98-.148.168-.297.188-.547.063-.25-.125-1.055-.39-2.012-1.242-.746-.664-1.25-1.484-1.398-1.734-.148-.25-.016-.387.109-.512.113-.113.25-.297.375-.445.125-.148.168-.25.25-.418.082-.168.043-.316-.02-.441-.063-.125-.566-1.363-.777-1.867-.203-.492-.414-.426-.566-.434l-.484-.008c-.168 0-.441.063-.672.316-.23.25-.883.863-.883 2.105 0 1.242.906 2.441 1.031 2.61.125.168 1.777 2.715 4.309 3.805.602.262 1.07.418 1.437.535.605.191 1.156.164 1.59.1.484-.07 1.477-.605 1.684-1.191.207-.586.207-1.086.145-1.191-.063-.106-.23-.168-.48-.293z" />
              </svg>
              <span>CHAT ON WHATSAPP</span>
            </a>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. CORE SERVICES SHOWCASE (3 Grid Cards)
          ==================================================================== */}
      <section className="kala-services-section" id="services-grid" aria-labelledby="services-list-heading">
        <div className="kala-services-container">
          <div className="kala-services-header-block">
            <span className="kala-services-eyebrow">WHAT WE BUILD</span>
            <h2 id="services-list-heading" className="kala-services-section-title">
              OUR CORE DIGITAL SERVICES
            </h2>
            <p className="kala-services-section-subtitle">
              Engineered with modern architecture, premium design, and scalable infrastructure.
            </p>
          </div>

          <div className="kala-services-grid">
            {DIGITAL_SERVICES.map((service: DigitalService) => {
              const waUrl = `https://wa.me/919406030116?text=${encodeURIComponent(service.whatsappMessage)}`

              return (
                <article
                  key={service.id}
                  id={service.id}
                  className={`kala-service-card ${service.id === 'web-dev' ? 'highlighted' : ''}`}
                >
                  <span className="kala-service-badge">{service.badge}</span>

                  <div className="kala-service-icon-wrap" aria-hidden="true">
                    {renderServiceIcon(service.iconName)}
                  </div>

                  <h3 className="kala-service-title">{service.title}</h3>
                  <div className="kala-service-subtitle">{service.subtitle}</div>
                  <p className="kala-service-desc">{service.description}</p>

                  <ul className="kala-service-features-list">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="kala-service-feature-item">
                        <svg
                          className="kala-feature-check"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="kala-service-tech-tags">
                    {service.technologies.map((tech, idx) => (
                      <span key={idx} className="kala-tech-tag">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="kala-service-card-actions">
                    <button
                      type="button"
                      className="kala-service-inquire-btn"
                      onClick={() => handleInquireClick(service.title)}
                    >
                      <span>GET QUOTE &amp; CONSULTATION</span>
                    </button>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="kala-service-wa-btn"
                    >
                      <span>INQUIRE VIA WHATSAPP</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. DELIVERY PROCESS (4 Steps)
          ==================================================================== */}
      <section className="kala-services-process" aria-label="Development Process">
        <div className="kala-services-container">
          <div className="kala-services-header-block">
            <span className="kala-services-eyebrow">OUR METHODOLOGY</span>
            <h2 className="kala-services-section-title">HOW WE DELIVER EXCELLENCE</h2>
            <p className="kala-services-section-subtitle">
              From requirement gathering to final deployment and support.
            </p>
          </div>

          <div className="kala-process-steps-grid">
            <div className="kala-process-step-card">
              <div className="kala-process-step-num">01</div>
              <h3 className="kala-process-step-title">Discovery &amp; Scope</h3>
              <p className="kala-process-step-desc">
                We understand your brand goals, target users, features, and key business logic.
              </p>
            </div>

            <div className="kala-process-step-card">
              <div className="kala-process-step-num">02</div>
              <h3 className="kala-process-step-title">UI/UX &amp; Architecture</h3>
              <p className="kala-process-step-desc">
                We craft clean layouts, interactive conversational flows, and robust database schemas.
              </p>
            </div>

            <div className="kala-process-step-card">
              <div className="kala-process-step-num">03</div>
              <h3 className="kala-process-step-title">Agile Development</h3>
              <p className="kala-process-step-desc">
                Rapid full-stack development with rigorous unit testing, API integrations, and security.
              </p>
            </div>

            <div className="kala-process-step-card">
              <div className="kala-process-step-num">04</div>
              <h3 className="kala-process-step-title">Launch &amp; Automation</h3>
              <p className="kala-process-step-desc">
                Seamless live production deployment, webhook verification, analytics, and handover.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. INQUIRY / REQUEST QUOTE SECTION
          ==================================================================== */}
      <section className="kala-service-quote-section" ref={quoteFormRef} aria-labelledby="quote-heading">
        <div className="kala-services-container">
          <div className="kala-service-quote-box">
            {/* Left Box */}
            <div className="kala-service-quote-left">
              <span className="tag">START YOUR PROJECT</span>
              <h2 id="quote-heading">LET'S BUILD SOMETHING EXTRAORDINARY.</h2>
              <p>
                Have a web project, mobile app, or WhatsApp automation bot in mind? Fill in your details or reach out directly on WhatsApp for an immediate consultation.
              </p>

              <div className="kala-service-contact-pills">
                <a
                  href="https://wa.me/919406030116?text=Hi%20KALA,%20I'd%20like%20to%20discuss%20a%20project%20inquiry."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kala-service-contact-pill"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 2C6.516 2 2.031 6.484 2.031 12c0 1.984.582 3.832 1.586 5.402L2 22l4.754-1.57A9.972 9.972 0 0012.031 22C17.547 22 22.031 17.516 22.031 12c0-5.516-4.484-10-10-10zm0 18.281c-1.742 0-3.375-.5-4.781-1.371l-.344-.215-2.828.934.95-2.754-.234-.375a8.23 8.23 0 01-1.344-4.496c0-4.57 3.711-8.281 8.281-8.281 4.57 0 8.281 3.711 8.281 8.281 0 4.57-3.711 8.281-8.281 8.281zm4.539-6.203c-.25-.125-1.477-.73-1.707-.812-.23-.086-.398-.125-.566.125-.168.25-.656.812-.805.98-.148.168-.297.188-.547.063-.25-.125-1.055-.39-2.012-1.242-.746-.664-1.25-1.484-1.398-1.734-.148-.25-.016-.387.109-.512.113-.113.25-.297.375-.445.125-.148.168-.25.25-.418.082-.168.043-.316-.02-.441-.063-.125-.566-1.363-.777-1.867-.203-.492-.414-.426-.566-.434l-.484-.008c-.168 0-.441.063-.672.316-.23.25-.883.863-.883 2.105 0 1.242.906 2.441 1.031 2.61.125.168 1.777 2.715 4.309 3.805.602.262 1.07.418 1.437.535.605.191 1.156.164 1.59.1.484-.07 1.477-.605 1.684-1.191.207-.586.207-1.086.145-1.191-.063-.106-.23-.168-.48-.293z" />
                  </svg>
                  <span>WhatsApp: +91 9406030116</span>
                </a>

                <a href="tel:+919406030116" className="kala-service-contact-pill">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>Phone: +91 9406030116</span>
                </a>

                <a href="mailto:KalaOriginals@gmail.com" className="kala-service-contact-pill">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span>Email: KalaOriginals@gmail.com</span>
                </a>
              </div>
            </div>

            {/* Right Form */}
            <div className="kala-service-form-wrap">
              {submitSuccess ? (
                <div className="kala-service-success-alert" role="alert">
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 800 }}>
                    Request Received!
                  </h3>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                    Thank you! Our technical team will reach out to you within 24 hours to discuss your project requirements.
                  </p>
                </div>
              ) : (
                <form className="kala-service-form" onSubmit={handleFormSubmit}>
                  <div className="kala-form-group">
                    <label className="kala-form-label">Select Services Required</label>
                    <div className="kala-service-checkboxes">
                      {['Web Development', 'App Development', 'WhatsApp Auto Reply Bot'].map((srv) => {
                        const isChecked = selectedServices.includes(srv)
                        return (
                          <label
                            key={srv}
                            className={`kala-service-checkbox-label ${isChecked ? 'selected' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleServiceSelection(srv)}
                            />
                            <span>{srv}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div className="kala-form-group">
                    <label className="kala-form-label" htmlFor="client-name">
                      Full Name *
                    </label>
                    <input
                      id="client-name"
                      type="text"
                      className="kala-form-input"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="kala-form-group">
                    <label className="kala-form-label" htmlFor="client-phone">
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      id="client-phone"
                      type="tel"
                      className="kala-form-input"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="kala-form-group">
                    <label className="kala-form-label" htmlFor="client-email">
                      Email Address (Optional)
                    </label>
                    <input
                      id="client-email"
                      type="email"
                      className="kala-form-input"
                      placeholder="e.g. john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="kala-form-group">
                    <label className="kala-form-label" htmlFor="client-org">
                      Company / Organization Name (Optional)
                    </label>
                    <input
                      id="client-org"
                      type="text"
                      className="kala-form-input"
                      placeholder="e.g. Acme Innovations"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                    />
                  </div>

                  <div className="kala-form-group">
                    <label className="kala-form-label" htmlFor="client-details">
                      Project Requirements / Features
                    </label>
                    <textarea
                      id="client-details"
                      className="kala-form-textarea"
                      rows={3}
                      placeholder="Briefly describe what you'd like to build..."
                      value={projectDetails}
                      onChange={(e) => setProjectDetails(e.target.value)}
                    />
                  </div>

                  {errorMessage && (
                    <div style={{ color: '#D94700', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="kala-service-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span>SUBMITTING INQUIRY...</span>
                    ) : (
                      <>
                        <span>SUBMIT PROJECT INQUIRY</span>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
        </div>
      </section>
    </main>
  )
}

export default Services
