import React from 'react'
import '../styles/HowItWorks.css'

interface HowItWorksProps {
  onPickStyle?: () => void
  onShareIdea?: () => void
  onGetStarted?: () => void
}

export const HowItWorks: React.FC<HowItWorksProps> = ({
  onPickStyle,
  onShareIdea,
  onGetStarted,
}) => {
  const handlePickStyle = (e: React.MouseEvent) => {
    if (onPickStyle) {
      e.preventDefault()
      onPickStyle()
    }
  }

  const handleShareIdea = (e: React.MouseEvent) => {
    if (onShareIdea) {
      e.preventDefault()
      onShareIdea()
    }
  }

  const handleGetStarted = (e: React.MouseEvent) => {
    if (onGetStarted) {
      e.preventDefault()
      onGetStarted()
    }
  }

  return (
    <section className="kala-how-section" aria-labelledby="how-it-works-title">
      <div className="kala-how-container">
        {/* ====================================================================
            HEADER WITH EDITORIAL ACCENTS
            ==================================================================== */}
        <div className="kala-how-header-wrap">
          {/* Left: Taped crumpled paper "WEAR YOUR STORY" */}
          <div className="kala-how-header-accent-left" aria-hidden="true">
            <img
              src="/how-it-works/header-note-left.png"
              alt=""
              className="kala-how-note-img"
              loading="lazy"
            />
          </div>

          {/* Center: Eyebrow, Main Title, Subtitle */}
          <div className="kala-how-header-center">
            <span className="kala-how-eyebrow">THE PROCESS</span>
            <h2 id="how-it-works-title" className="kala-how-main-title">
              HOW IT <span className="kala-how-title-accent">WORKS</span>
              <svg className="kala-how-brush-underline" viewBox="0 0 140 14" fill="none" aria-hidden="true">
                <path d="M2 9C40 4 100 4 138 9" stroke="#111111" strokeWidth="3.2" strokeLinecap="round" />
                <path d="M25 11.5C60 9 110 8.5 130 11.5" stroke="#D94700" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
              </svg>
            </h2>
            <p className="kala-how-subtitle">
              A streamlined 4-step journey from your creative concept to finished luxury apparel.
            </p>
          </div>

          {/* Right: Graffiti "IDEAS INTO APPAREL" */}
          <div className="kala-how-header-accent-right" aria-hidden="true">
            <img
              src="/how-it-works/header-graffiti-right.png"
              alt=""
              className="kala-how-graffiti-img"
              loading="lazy"
            />
          </div>
        </div>

        {/* ====================================================================
            4 CONNECTED CARDS ROW
            ==================================================================== */}
        <div className="kala-how-cards-stage">
          {/* Hand-drawn curved connector arrows bridging desktop cards */}
          <div className="kala-how-connector kala-how-conn-1-2" aria-hidden="true">
            <svg width="76" height="38" viewBox="0 0 76 38" fill="none">
              <path d="M4 32C22 6 54 6 70 24" stroke="#D94700" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
              <path d="M60 25L71 25L72 14" stroke="#D94700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="kala-how-connector kala-how-conn-2-3" aria-hidden="true">
            <svg width="76" height="38" viewBox="0 0 76 38" fill="none">
              <path d="M4 32C22 6 54 6 70 24" stroke="#D94700" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
              <path d="M60 25L71 25L72 14" stroke="#D94700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="kala-how-connector kala-how-conn-3-4" aria-hidden="true">
            <svg width="76" height="38" viewBox="0 0 76 38" fill="none">
              <path d="M4 32C22 6 54 6 70 24" stroke="#D94700" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
              <path d="M60 25L71 25L72 14" stroke="#D94700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="kala-how-grid">
            {/* ----------------------------------------------------------------
                STEP 01 — CHOOSE
                ---------------------------------------------------------------- */}
            <article className="kala-how-card kala-how-card-01">
              <div className="kala-how-card-body">
                <div className="kala-how-card-text">
                  <span className="kala-how-card-num">01</span>
                  <h3 className="kala-how-card-title">CHOOSE</h3>
                  <p className="kala-how-card-desc">
                    Choose your apparel type, silhouette, and base color specification.
                  </p>
                  <div className="kala-how-card-action">
                    <a
                      href="#categories"
                      className="kala-how-btn kala-how-btn-dark"
                      onClick={handlePickStyle}
                      aria-label="Pick your apparel style"
                    >
                      <span>PICK YOUR STYLE</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </a>
                  </div>
                </div>
                <div className="kala-how-card-media" aria-hidden="true">
                  <img
                    src="/how-it-works/step-1-apparel.png"
                    alt="Apparel selection"
                    className="kala-how-media-img kala-media-apparel"
                    loading="lazy"
                  />
                </div>
              </div>
            </article>

            {/* ----------------------------------------------------------------
                STEP 02 — DESIGN
                ---------------------------------------------------------------- */}
            <article className="kala-how-card kala-how-card-02">
              <div className="kala-how-card-body">
                <div className="kala-how-card-text">
                  <span className="kala-how-card-num">02</span>
                  <h3 className="kala-how-card-title">DESIGN</h3>
                  <p className="kala-how-card-desc">
                    Share your artwork, logo or design idea with our studio design team.
                  </p>
                  <div className="kala-how-card-action">
                    <a
                      href="#custom-order-form"
                      className="kala-how-btn kala-how-btn-light"
                      onClick={handleShareIdea}
                      aria-label="Share your artwork or design idea"
                    >
                      <span>SHARE YOUR IDEA</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </a>
                  </div>
                </div>
                <div className="kala-how-card-media" aria-hidden="true">
                  <img
                    src="/custom-apparel/kala-custom-hero-floating.png"
                    alt="Custom apparel design"
                    className="kala-how-media-img kala-media-tablet"
                    loading="lazy"
                  />
                </div>
              </div>
            </article>

            {/* ----------------------------------------------------------------
                STEP 03 — PRODUCE (No button)
                ---------------------------------------------------------------- */}
            <article className="kala-how-card kala-how-card-03">
              <div className="kala-how-card-body">
                <div className="kala-how-card-text">
                  <span className="kala-how-card-num">03</span>
                  <h3 className="kala-how-card-title">PRODUCE</h3>
                  <p className="kala-how-card-desc">
                    KALA handles precision printing, embroidery, and rigorous quality inspection.
                  </p>
                </div>
                <div className="kala-how-card-media" aria-hidden="true">
                  <img
                    src="/how-it-works/step-3-press.png"
                    alt="Precision printing and embroidery press"
                    className="kala-how-media-img kala-media-press"
                    loading="lazy"
                  />
                </div>
              </div>
            </article>

            {/* ----------------------------------------------------------------
                STEP 04 — DELIVER
                ---------------------------------------------------------------- */}
            <article className="kala-how-card kala-how-card-04">
              <div className="kala-how-card-body">
                <div className="kala-how-card-text">
                  <span className="kala-how-card-num">04</span>
                  <h3 className="kala-how-card-title">DELIVER</h3>
                  <p className="kala-how-card-desc">
                    Your custom apparel is prepared, packaged and delivered to your doorstep.
                  </p>
                  <div className="kala-how-card-action">
                    <a
                      href="#custom-order-form"
                      className="kala-how-btn kala-how-btn-dark"
                      onClick={handleGetStarted}
                      aria-label="Get started with custom apparel"
                    >
                      <span>GET STARTED</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </a>
                  </div>
                </div>
                <div className="kala-how-card-media" aria-hidden="true">
                  <img
                    src="/how-it-works/step-4-box.png"
                    alt="Custom KALA delivery parcel"
                    className="kala-how-media-img kala-media-box"
                    loading="lazy"
                  />
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
