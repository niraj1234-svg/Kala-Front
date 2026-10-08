import React, { useEffect, useState } from 'react'
import BulkApparelBuilder from '../components/BulkApparelBuilder/BulkApparelBuilder'
import '../styles/CustomApparel.css'

export const CustomApparel: React.FC = () => {
  const [selectedPreviewColor, setSelectedPreviewColor] = useState<'black' | 'white'>('black')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.title = 'Custom Apparel | Bulk & Personal Custom Clothing | KALA'
  }, [])

  const scrollToBuilder = () => {
    const builder = document.getElementById('kala-builder-section')
    if (builder) {
      builder.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToWorkflow = () => {
    const workflow = document.getElementById('kala-workflow-section')
    if (workflow) {
      workflow.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <main className="kala-custom-apparel-hub" id="main-content">
      {/* ====================================================================
          PART 1: WHAT IS CUSTOM APPAREL? (Interactive Visual Showcase)
          ==================================================================== */}
      <section className="kala-hub-part kala-hub-part-1" aria-labelledby="custom-apparel-what-is-it">
        <div className="kala-custom-container">
          <div className="kala-hero-showcase-grid">
            
            {/* Left Column: Information, Badges & Interactive Features */}
            <div className="kala-hero-content">
              <div className="kala-part-badge">
                <span className="kala-badge-dot" aria-hidden="true" />
                <span className="kala-badge-text">KALA • MADE TO ORDER</span>
              </div>

              <h1 id="custom-apparel-what-is-it" className="kala-part-main-title">
                WHAT IS <span className="title-gradient-accent">CUSTOM APPAREL?</span>
              </h1>

              <p className="kala-part-main-desc">
                Custom Apparel lets you print your identity on premium clothing. Whether you need a batch of 50 pieces for your college team, company, or event, or a single custom piece with your own original artwork — we craft each garment with high-definition printing, combed cotton fabrics, and zero design setup fees.
              </p>

              {/* Enhanced 4-Feature Interactive Cards Grid */}
              <div className="kala-features-interactive-grid" aria-label="Key custom apparel guarantees">
                <div className="kala-feat-card">
                  <div className="kala-feat-card-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div className="kala-feat-card-body">
                    <strong className="kala-feat-title">₹0 Design Fee</strong>
                    <span className="kala-feat-desc">You bring artwork, we optimize it for print free</span>
                  </div>
                </div>

                <div className="kala-feat-card">
                  <div className="kala-feat-card-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                  </div>
                  <div className="kala-feat-card-body">
                    <strong className="kala-feat-title">Bulk &amp; Single</strong>
                    <span className="kala-feat-desc">Flexible runs: 1 custom piece or 500+ wholesale</span>
                  </div>
                </div>

                <div className="kala-feat-card">
                  <div className="kala-feat-card-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    </svg>
                  </div>
                  <div className="kala-feat-card-body">
                    <strong className="kala-feat-title">High-Def Prints</strong>
                    <span className="kala-feat-desc">Washproof DTF &amp; screen with 50+ wash durability</span>
                  </div>
                </div>

                <div className="kala-feat-card">
                  <div className="kala-feat-card-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                  </div>
                  <div className="kala-feat-card-body">
                    <strong className="kala-feat-title">Pan-India Delivery</strong>
                    <span className="kala-feat-desc">Direct tracked express doorstep dispatch</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="kala-hero-action-row">
                <button
                  type="button"
                  onClick={scrollToBuilder}
                  className="kala-hero-cta-btn primary"
                  id="custom-apparel-start-cta"
                >
                  <span>Start Designing Your Apparel</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <polyline points="19 12 12 19 5 12" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={scrollToWorkflow}
                  className="kala-hero-cta-btn secondary"
                >
                  <span>See How It Works</span>
                  <span className="cta-arrow" aria-hidden="true">→</span>
                </button>
              </div>
            </div>

            {/* Right Column: Visual Apparel Spotlight with Floating VFX Badges */}
            <div className="kala-hero-spotlight-col">
              <div className="kala-spotlight-stage">
                
                {/* Ambient Glow Aura */}
                <div className="kala-stage-aura" aria-hidden="true" />

                {/* Floating VFX Badges */}
                <div className="kala-vfx-badge vfx-badge-top-right">
                  <span className="vfx-icon">✨</span>
                  <div className="vfx-text">
                    <strong>100% Combed Cotton</strong>
                    <span>220 GSM Heavyweight</span>
                  </div>
                </div>

                <div className="kala-vfx-badge vfx-badge-bottom-left">
                  <span className="vfx-pulse-dot" />
                  <div className="vfx-text">
                    <strong>High-Definition DTF</strong>
                    <span>Washproof &bull; 50+ Washes</span>
                  </div>
                </div>

                <div className="kala-vfx-badge vfx-badge-bottom-right">
                  <span className="vfx-icon">⚡</span>
                  <div className="vfx-text">
                    <strong>Zero Setup Fee</strong>
                    <span>Instant Live Preview</span>
                  </div>
                </div>

                {/* Floating Garment Mockup */}
                <div className="kala-spotlight-image-wrapper">
                  <img
                    src={selectedPreviewColor === 'black' 
                      ? '/custom-apparel/kala-floating-tee.png' 
                      : '/mockups/tshirt-white-front.png'}
                    alt="KALA Custom Apparel preview"
                    className="kala-spotlight-garment-img"
                    loading="eager"
                  />
                  {/* Subtle garment shadow */}
                  <div className="kala-garment-drop-shadow" aria-hidden="true" />
                </div>

                {/* Interactive Color Switcher */}
                <div className="kala-spotlight-controls">
                  <span className="controls-label">Garment Shade:</span>
                  <div className="color-toggle-group">
                    <button
                      type="button"
                      className={`color-toggle-pill ${selectedPreviewColor === 'black' ? 'active' : ''}`}
                      onClick={() => setSelectedPreviewColor('black')}
                      aria-label="Preview Black T-shirt"
                    >
                      <span className="swatch-dot dot-black" />
                      <span>Onyx Black</span>
                    </button>
                    <button
                      type="button"
                      className={`color-toggle-pill ${selectedPreviewColor === 'white' ? 'active' : ''}`}
                      onClick={() => setSelectedPreviewColor('white')}
                      aria-label="Preview White T-shirt"
                    >
                      <span className="swatch-dot dot-white" />
                      <span>Pure White</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ====================================================================
          PART 2: HOW TO USE THIS (Interactive Connected 4-Step Journey)
          ==================================================================== */}
      <section 
        className="kala-hub-part kala-hub-part-2" 
        id="kala-workflow-section"
        aria-labelledby="how-to-use-title"
      >
        <div className="kala-custom-container">
          <div className="kala-part-header compact">
            <span className="kala-part-kicker">STEP BY STEP WORKFLOW</span>
            <h2 id="how-to-use-title" className="kala-part-section-title">
              HOW TO USE THIS
            </h2>
            <p className="kala-part-subtitle">
              Four effortless steps to bring your custom vision to life.
            </p>
          </div>

          {/* Workflow Cards Grid with Visual Connectors */}
          <div className="kala-workflow-steps-container">
            <div className="kala-workflow-track-line" aria-hidden="true" />

            <div className="kala-how-steps-grid">
              
              {/* Step 01 */}
              <div className="kala-step-card kala-step-card-01">
                <div className="kala-step-top-bar">
                  <span className="kala-step-number">01</span>
                  <span className="kala-step-tag">SCALE</span>
                </div>
                
                <div className="kala-step-media-container">
                  <img
                    src="/how-it-works/step-1-apparel.png"
                    alt="Choose bulk order or single piece"
                    className="kala-step-media-img"
                    loading="lazy"
                  />
                </div>

                <div className="kala-step-content">
                  <h3 className="kala-step-card-title">Choose Order Type</h3>
                  <p className="kala-step-card-desc">
                    Select <strong>Bulk Order (25+ pcs)</strong> for team wholesale factory rates or <strong>Personal Piece (1+ pcs)</strong> for bespoke single garments.
                  </p>
                </div>

                <div className="kala-step-footer-pill">
                  <span className="pill-dot" />
                  <span>Bulk (25+) or Single (1+)</span>
                </div>
              </div>

              {/* Step 02 */}
              <div className="kala-step-card kala-step-card-02">
                <div className="kala-step-top-bar">
                  <span className="kala-step-number">02</span>
                  <span className="kala-step-tag">APPAREL</span>
                </div>

                <div className="kala-step-media-container">
                  <img
                    src="/how-it-works/step-2-tablet.png"
                    alt="Select garment, fabric GSM, and color"
                    className="kala-step-media-img"
                    loading="lazy"
                  />
                </div>

                <div className="kala-step-content">
                  <h3 className="kala-step-card-title">Select Garment &amp; Color</h3>
                  <p className="kala-step-card-desc">
                    Pick <strong>T-Shirts, Hoodies, Polos, or Jerseys</strong> in Black or White, and select your preferred fabric GSM model.
                  </p>
                </div>

                <div className="kala-step-footer-pill">
                  <span className="pill-dot" />
                  <span>Tees &bull; Hoodies &bull; Polos</span>
                </div>
              </div>

              {/* Step 03 */}
              <div className="kala-step-card kala-step-card-03">
                <div className="kala-step-top-bar">
                  <span className="kala-step-number">03</span>
                  <span className="kala-step-tag">CANVAS</span>
                </div>

                <div className="kala-step-media-container">
                  <img
                    src="/how-it-works/step-3-press.png"
                    alt="Upload design and inspect in real-time"
                    className="kala-step-media-img"
                    loading="lazy"
                  />
                </div>

                <div className="kala-step-content">
                  <h3 className="kala-step-card-title">Upload &amp; Live Preview</h3>
                  <p className="kala-step-card-desc">
                    Upload your design. Drag, resize, and rotate your artwork in real-time on our interactive garment mockup.
                  </p>
                </div>

                <div className="kala-step-footer-pill">
                  <span className="pill-dot" />
                  <span>Interactive Real-time Canvas</span>
                </div>
              </div>

              {/* Step 04 */}
              <div className="kala-step-card kala-step-card-04">
                <div className="kala-step-top-bar">
                  <span className="kala-step-number">04</span>
                  <span className="kala-step-tag">ORDER</span>
                </div>

                <div className="kala-step-media-container">
                  <img
                    src="/how-it-works/step-4-box.png"
                    alt="Fill details and receive order"
                    className="kala-step-media-img"
                    loading="lazy"
                  />
                </div>

                <div className="kala-step-content">
                  <h3 className="kala-step-card-title">Fill Details &amp; Order</h3>
                  <p className="kala-step-card-desc">
                    Set size quantities, get an <strong>instant official quotation</strong> for bulk orders, or check out directly for personal pieces.
                  </p>
                </div>

                <div className="kala-step-footer-pill">
                  <span className="pill-dot" />
                  <span>Pan-India Doorstep Dispatch</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          PART 3: THE COMPLETE INTERACTIVE BOX (Single Unified Customizer)
          ==================================================================== */}
      <section 
        className="kala-hub-part kala-hub-part-3" 
        id="kala-builder-section"
        aria-label="Interactive Custom Apparel Builder Box"
      >
        <div className="kala-custom-container">
          <BulkApparelBuilder />
        </div>
      </section>
    </main>
  )
}

export default CustomApparel
