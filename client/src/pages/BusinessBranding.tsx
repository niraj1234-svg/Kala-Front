import React, { useEffect, useState } from 'react'
import BusinessApparelBuilder from '../components/BusinessBranding/BusinessApparelBuilder'
import '../styles/BusinessBranding.css'

export const BusinessBranding: React.FC = () => {
  const [selectedCorporateGarment, setSelectedCorporateGarment] = useState<'polo' | 'hoodie'>('polo')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.title = 'Business Branding | Corporate Apparel & Uniforms | KALA'
  }, [])

  const scrollToBuilder = () => {
    const builder = document.getElementById('kala-b2b-builder-section')
    if (builder) {
      builder.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToWorkflow = () => {
    const workflow = document.getElementById('kala-b2b-workflow-section')
    if (workflow) {
      workflow.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <main className="kala-business-branding-page" id="main-content">
      {/* ====================================================================
          PART 1: WHAT IS BUSINESS BRANDING? (Enterprise B2B Showcase)
          ==================================================================== */}
      <section className="kala-hub-part kala-biz-part-1" aria-labelledby="business-branding-what-is-it">
        <div className="kala-custom-container">
          <div className="kala-biz-showcase-grid">

            {/* Left Column: Corporate Story & Value Pillars */}
            <div className="kala-biz-content">
              <div className="kala-biz-badge">
                <span className="kala-biz-badge-dot" aria-hidden="true" />
                <span className="kala-biz-badge-text">KALA ENTERPRISE • B2B MERCHANDISE</span>
              </div>

              <h1 id="business-branding-what-is-it" className="kala-biz-main-title">
                WHAT IS <span className="biz-gradient-accent">BUSINESS BRANDING?</span>
              </h1>

              <p className="kala-biz-main-desc">
                Business Branding by KALA equips companies, startups, and institutions with retail-grade custom apparel. From corporate polo uniforms and employee onboarding hoodies to event merchandise and college fest kits — we deliver precision branding, official GST invoicing, and dedicated production support.
              </p>

              {/* 4 Interactive Enterprise Pillars */}
              <div className="kala-biz-pillars-grid" aria-label="Corporate branding highlights">
                
                <div className="kala-biz-pillar-card">
                  <div className="kala-pillar-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                    </svg>
                  </div>
                  <div className="kala-pillar-info">
                    <strong className="kala-pillar-title">Corporate Uniforms</strong>
                    <span className="kala-pillar-desc">Retail-finish polos, hoodies, jackets &amp; employee kits</span>
                  </div>
                </div>

                <div className="kala-biz-pillar-card">
                  <div className="kala-pillar-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div className="kala-pillar-info">
                    <strong className="kala-pillar-title">GST Invoicing</strong>
                    <span className="kala-pillar-desc">100% Input tax credit with itemized official quotes</span>
                  </div>
                </div>

                <div className="kala-biz-pillar-card">
                  <div className="kala-pillar-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m4.93 4.93 4.24 4.24" />
                      <path d="m14.83 9.17 4.24-4.24" />
                      <path d="m14.83 14.83 4.24 4.24" />
                      <path d="m9.17 14.83-4.24 4.24" />
                      <circle cx="12" cy="12" r="4" />
                    </svg>
                  </div>
                  <div className="kala-pillar-info">
                    <strong className="kala-pillar-title">₹0 Vector Setup Fee</strong>
                    <span className="kala-pillar-desc">Free digitization or 10% for custom KALA design team</span>
                  </div>
                </div>

                <div className="kala-biz-pillar-card">
                  <div className="kala-pillar-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <div className="kala-pillar-info">
                    <strong className="kala-pillar-title">Insured Dispatch</strong>
                    <span className="kala-pillar-desc">Audited quality packed direct to your office</span>
                  </div>
                </div>

              </div>

              {/* Enterprise Trust Metric Bar */}
              <div className="kala-biz-metrics-bar">
                <div className="biz-metric-item">
                  <span className="metric-val">120+</span>
                  <span className="metric-lbl">Corporate Clients</span>
                </div>
                <div className="metric-divider" />
                <div className="biz-metric-item">
                  <span className="metric-val">99.4%</span>
                  <span className="metric-lbl">On-Time Dispatch</span>
                </div>
                <div className="metric-divider" />
                <div className="biz-metric-item">
                  <span className="metric-val">100%</span>
                  <span className="metric-lbl">GST Input Credit</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="kala-biz-actions-row">
                <button
                  type="button"
                  onClick={scrollToBuilder}
                  className="kala-biz-cta-btn primary"
                  id="business-branding-quote-cta"
                >
                  <span>Build Corporate Quotation</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <polyline points="19 12 12 19 5 12" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={scrollToWorkflow}
                  className="kala-biz-cta-btn secondary"
                >
                  <span>Corporate Workflow</span>
                  <span className="biz-cta-arrow" aria-hidden="true">→</span>
                </button>
              </div>
            </div>

            {/* Right Column: Executive Mockup Showcase with Floating Trust Badges */}
            <div className="kala-biz-spotlight-col">
              <div className="kala-biz-stage">
                
                {/* Ambient Subtle Aura */}
                <div className="kala-biz-aura" aria-hidden="true" />

                {/* Floating Enterprise Trust Badges */}
                <div className="kala-biz-vfx-badge biz-badge-top-right">
                  <span className="biz-vfx-icon">🏛️</span>
                  <div className="biz-vfx-text">
                    <strong>Official GST Invoiced</strong>
                    <span>Input Tax Credit Verified</span>
                  </div>
                </div>

                <div className="kala-biz-vfx-badge biz-badge-bottom-left">
                  <span className="biz-pulse-dot" />
                  <div className="biz-vfx-text">
                    <strong>Pique Knit 240 GSM</strong>
                    <span>Executive Fit &amp; Finish</span>
                  </div>
                </div>

                <div className="kala-biz-vfx-badge biz-badge-bottom-right">
                  <span className="biz-vfx-icon">🛡️</span>
                  <div className="biz-vfx-text">
                    <strong>QC Inspected</strong>
                    <span>Sealed Batch Packing</span>
                  </div>
                </div>

                {/* Floating Garment Mockup */}
                <div className="kala-biz-image-wrapper">
                  <img
                    src={selectedCorporateGarment === 'polo' 
                      ? '/ai-data-science-polo-front.png' 
                      : '/mockups/hoodie-black-front.png'}
                    alt="KALA Corporate Apparel Showcase"
                    className="kala-biz-spotlight-img"
                    loading="eager"
                  />
                  <div className="kala-biz-drop-shadow" aria-hidden="true" />
                </div>

                {/* Garment Type Switcher */}
                <div className="kala-biz-controls">
                  <span className="biz-controls-label">Apparel Line:</span>
                  <div className="biz-toggle-group">
                    <button
                      type="button"
                      className={`biz-toggle-pill ${selectedCorporateGarment === 'polo' ? 'active' : ''}`}
                      onClick={() => setSelectedCorporateGarment('polo')}
                    >
                      <span>Collar Polo</span>
                    </button>
                    <button
                      type="button"
                      className={`biz-toggle-pill ${selectedCorporateGarment === 'hoodie' ? 'active' : ''}`}
                      onClick={() => setSelectedCorporateGarment('hoodie')}
                    >
                      <span>Fleece Hoodie</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ====================================================================
          PART 2: HOW TO USE THIS (Corporate 4-Stage Procurement Workflow)
          ==================================================================== */}
      <section 
        className="kala-hub-part kala-biz-part-2" 
        id="kala-b2b-workflow-section"
        aria-labelledby="how-to-use-business-title"
      >
        <div className="kala-custom-container">
          <div className="kala-part-header compact">
            <span className="kala-biz-kicker">CORPORATE PROCUREMENT PIPELINE</span>
            <h2 id="how-to-use-business-title" className="kala-biz-section-title">
              HOW TO USE THIS
            </h2>
            <p className="kala-biz-subtitle">
              Four straightforward steps to outfit your company or organization.
            </p>
          </div>

          <div className="kala-biz-steps-container">
            <div className="kala-biz-track-line" aria-hidden="true" />

            <div className="kala-biz-steps-grid">
              
              {/* Step 01 */}
              <div className="kala-biz-step-card">
                <div className="kala-biz-step-top">
                  <span className="kala-biz-step-num">01</span>
                  <span className="kala-biz-step-phase">PHASE 01 &bull; SCALE</span>
                </div>

                <div className="kala-biz-step-media">
                  <img
                    src="/business-branding/card-06-startups.jpg"
                    alt="Choose business scale and batch size"
                    className="kala-biz-media-img"
                    loading="lazy"
                  />
                </div>

                <div className="kala-biz-step-info">
                  <h3 className="kala-biz-step-title">Choose Business Scale</h3>
                  <p className="kala-biz-step-desc">
                    Select <strong>Bulk Corporate Run (25+ pcs)</strong> for volume tiered rates or <strong>Pilot Batch (1–24 pcs)</strong> for core team and founder samples.
                  </p>
                </div>

                <div className="kala-biz-step-pill">
                  <span className="biz-pill-dot" />
                  <span>Bulk (25+) or Pilot (1–24)</span>
                </div>
              </div>

              {/* Step 02 */}
              <div className="kala-biz-step-card">
                <div className="kala-biz-step-top">
                  <span className="kala-biz-step-num">02</span>
                  <span className="kala-biz-step-phase">PHASE 02 &bull; APPAREL</span>
                </div>

                <div className="kala-biz-step-media">
                  <img
                    src="/ai-data-science-polo-front.png"
                    alt="Select corporate polo, hoodies, and jerseys"
                    className="kala-biz-media-img"
                    loading="lazy"
                  />
                </div>

                <div className="kala-biz-step-info">
                  <h3 className="kala-biz-step-title">Select Corporate Apparel</h3>
                  <p className="kala-biz-step-desc">
                    Pick <strong>collar polos</strong>, heavyweight 220 GSM combed tees, fleece hoodies, or event jerseys in desired corporate colors.
                  </p>
                </div>

                <div className="kala-biz-step-pill">
                  <span className="biz-pill-dot" />
                  <span>Polos &bull; Hoodies &bull; Tees</span>
                </div>
              </div>

              {/* Step 03 */}
              <div className="kala-biz-step-card">
                <div className="kala-biz-step-top">
                  <span className="kala-biz-step-num">03</span>
                  <span className="kala-biz-step-phase">PHASE 03 &bull; BRANDING</span>
                </div>

                <div className="kala-biz-step-media">
                  <img
                    src="/how-it-works/step-2-tablet.png"
                    alt="Upload logo and preview placement"
                    className="kala-biz-media-img"
                    loading="lazy"
                  />
                </div>

                <div className="kala-biz-step-info">
                  <h3 className="kala-biz-step-title">Upload Logo &amp; Preview</h3>
                  <p className="kala-biz-step-desc">
                    Upload your vector logo. Position it on chest or back, adjust scale, and preview live on garment mockups.
                  </p>
                </div>

                <div className="kala-biz-step-pill">
                  <span className="biz-pill-dot" />
                  <span>Digital Proof Inspection</span>
                </div>
              </div>

              {/* Step 04 */}
              <div className="kala-biz-step-card">
                <div className="kala-biz-step-top">
                  <span className="kala-biz-step-num">04</span>
                  <span className="kala-biz-step-phase">PHASE 04 &bull; QUOTE</span>
                </div>

                <div className="kala-biz-step-media">
                  <img
                    src="/how-it-works/step-4-box.png"
                    alt="Get official GST quotation and doorstep dispatch"
                    className="kala-biz-media-img"
                    loading="lazy"
                  />
                </div>

                <div className="kala-biz-step-info">
                  <h3 className="kala-biz-step-title">Company Info &amp; Quote</h3>
                  <p className="kala-biz-step-desc">
                    Enter organization details to receive an <strong>official GST quotation</strong> with digital proofs and a dedicated B2B coordinator.
                  </p>
                </div>

                <div className="kala-biz-step-pill">
                  <span className="biz-pill-dot" />
                  <span>Official GST Invoicing &amp; PO</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          PART 3: THE COMPLETE INTERACTIVE BOX (Unified B2B Customizer)
          ==================================================================== */}
      <section 
        className="kala-hub-part kala-biz-part-3" 
        id="kala-b2b-builder-section"
        aria-label="Interactive Business Branding Builder Box"
      >
        <div className="kala-custom-container">
          <BusinessApparelBuilder />
        </div>
      </section>
    </main>
  )
}

export default BusinessBranding
