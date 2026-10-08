import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/About.css'

export const About: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.title = 'About KALA | Who We Are & Our Vision'
  }, [])

  return (
    <main className="kala-about-page" id="main-content">
      {/* ====================================================================
          1. HERO SECTION
          ==================================================================== */}
      <section className="kala-about-hero" aria-labelledby="about-hero-title">
        <div className="kala-about-container">

          <div className="kala-about-hero-content">
            <div className="kala-about-badge">
              <span className="about-badge-dot" aria-hidden="true" />
              <span className="about-badge-text">ABOUT KALA</span>
            </div>

            <h1 id="about-hero-title" className="kala-about-hero-title">
              WEAR YOUR IDENTITY.
            </h1>

            <p className="kala-about-hero-subtitle">
              KALA is a custom apparel and merchandise brand built to turn ideas, identities and communities into something people can wear.
            </p>

            <div className="kala-about-hero-actions">
              <Link to="/custom-apparel" className="kala-about-btn primary">
                <span>Start Creating</span>
                <span className="btn-arrow" aria-hidden="true">&rarr;</span>
              </Link>
              <Link to="/shop" className="kala-about-btn secondary">
                <span>Explore Shop</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. ABOUT KALA (The Story)
          ==================================================================== */}
      <section className="kala-about-story-section" aria-labelledby="story-title">
        <div className="kala-about-container">
          <div className="kala-story-card">
            <span className="kala-about-kicker">OUR STORY</span>
            <h2 id="story-title" className="kala-story-heading">
              APPAREL SHOULD FEEL PERSONAL.
            </h2>
            <div className="kala-story-paragraphs">
              <p>
                KALA is built around a simple idea — apparel should feel personal.
              </p>
              <p>
                We create custom apparel and merchandise for individuals, teams, colleges, startups, businesses and communities. From a single personal design to large-scale custom orders, KALA brings ideas to life through apparel.
              </p>
              <p>
                We combine design, technology and a direct-to-customer experience to make custom apparel simpler, more accessible and more personal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. WHAT KALA DOES
          ==================================================================== */}
      <section className="kala-about-what-we-do-section" aria-labelledby="what-we-do-title">
        <div className="kala-about-container">
          <div className="kala-about-section-header">
            <span className="kala-about-kicker">CATEGORIES</span>
            <h2 id="what-we-do-title" className="kala-about-section-h2">
              WHAT WE DO
            </h2>
            <p className="kala-about-section-sub">
              From one-of-a-kind personal pieces to scalable organization merchandise.
            </p>
          </div>

          <div className="kala-what-we-do-grid">
            {/* 1. Custom Apparel */}
            <article className="kala-capability-card">
              <div className="card-top-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                </svg>
              </div>
              <h3 className="card-title">CUSTOM APPAREL</h3>
              <p className="card-desc">
                Personal designs, team apparel and custom merchandise made around your idea.
              </p>
              <Link to="/custom-apparel" className="card-link">
                <span>Custom Studio</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </article>

            {/* 2. Business Branding */}
            <article className="kala-capability-card">
              <div className="card-top-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <h3 className="card-title">BUSINESS BRANDING</h3>
              <p className="card-desc">
                Branded apparel and merchandise for businesses, startups and organizations.
              </p>
              <Link to="/business-branding" className="card-link">
                <span>Business Solutions</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </article>

            {/* 3. Bulk Orders */}
            <article className="kala-capability-card">
              <div className="card-top-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <h3 className="card-title">BULK ORDERS</h3>
              <p className="card-desc">
                Scalable apparel solutions for teams, college events and large volume requirements.
              </p>
              <Link to="/custom-apparel" className="card-link">
                <span>Bulk Pricing</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </article>

            {/* 4. Design Support */}
            <article className="kala-capability-card">
              <div className="card-top-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <h3 className="card-title">DESIGN SUPPORT</h3>
              <p className="card-desc">
                Helping turn ideas, references and brand assets into wearable designs.
              </p>
              <Link to="/business-branding" className="card-link">
                <span>Design Services</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. WHY KALA (The Philosophy)
          ==================================================================== */}
      <section className="kala-about-why-section" aria-labelledby="why-kala-title">
        <div className="kala-about-container">
          <div className="kala-about-section-header">
            <span className="kala-about-kicker">OUR PRINCIPLES</span>
            <h2 id="why-kala-title" className="kala-about-section-h2">
              WHY KALA
            </h2>
            <p className="kala-about-section-sub">
              Four principles that shape how we create, manufacture and deliver apparel.
            </p>
          </div>

          <div className="kala-why-grid">
            <div className="kala-why-item">
              <span className="why-num">01</span>
              <h3 className="why-title">DESIGN FIRST</h3>
              <p className="why-desc">Every piece starts with an idea and thoughtful creative intention.</p>
            </div>

            <div className="kala-why-item">
              <span className="why-num">02</span>
              <h3 className="why-title">BUILT FOR EVERY SCALE</h3>
              <p className="why-desc">From one custom piece for an individual to large runs for an entire community.</p>
            </div>

            <div className="kala-why-item">
              <span className="why-num">03</span>
              <h3 className="why-title">SIMPLE EXPERIENCE</h3>
              <p className="why-desc">A straightforward, transparent process from upload and mockup to doorstep delivery.</p>
            </div>

            <div className="kala-why-item">
              <span className="why-num">04</span>
              <h3 className="why-title">MADE FOR COMMUNITIES</h3>
              <p className="why-desc">Built for creators, friends, sports squads, college fests, startups and businesses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. THE PEOPLE BEHIND KALA (Founders Section)
          ==================================================================== */}
      <section className="kala-founders-section" aria-labelledby="founders-heading">
        <div className="kala-about-container">
          <div className="kala-about-section-header">
            <span className="kala-about-kicker">LEADERSHIP</span>
            <h2 id="founders-heading" className="kala-about-section-h2">
              THE PEOPLE BEHIND KALA
            </h2>
            <p className="kala-about-section-sub">
              The team building KALA's technology, product and operations.
            </p>
          </div>

          <div className="kala-founders-grid">
            {/* Founder 1: Niraj Dhore */}
            <article className="kala-founder-card">
              <div className="founder-photo-wrapper">
                <img
                  src="/founders/niraj-dhore.jpg"
                  onError={(e) => {
                    const target = e.currentTarget
                    target.onerror = null
                    target.src = '/founders/niraj-dhore.png'
                  }}
                  alt="Niraj Dhore — Founder of KALA"
                  className="founder-photo"
                  loading="lazy"
                />
                <span className="founder-role-badge founder">FOUNDER</span>
              </div>
              <div className="founder-info">
                <h3 className="founder-name">Niraj Dhore</h3>
                <p className="founder-title">Founder</p>
                <p className="founder-dept">Technology, Product &amp; Growth</p>
                <div className="founder-divider" aria-hidden="true" />
                <p className="founder-bio">
                  Niraj leads technology, product architecture and digital growth at KALA. He designs and builds the digital platform, product customization workflows, and customer experience, combining engineering with brand growth to make custom apparel effortless.
                </p>
              </div>
            </article>

            {/* Founder 2: Sudhanshu */}
            <article className="kala-founder-card">
              <div className="founder-photo-wrapper">
                <img
                  src="/founders/sudhanshu-kumar.png"
                  alt="Sudhanshu — Co-Founder of KALA"
                  className="founder-photo"
                  loading="lazy"
                />
                <span className="founder-role-badge cofounder">CO-FOUNDER</span>
              </div>
              <div className="founder-info">
                <h3 className="founder-name">Sudhanshu</h3>
                <p className="founder-title">Co-Founder</p>
                <p className="founder-dept">Business, Operations &amp; Growth</p>
                <div className="founder-divider" aria-hidden="true" />
                <p className="founder-bio">
                  Sudhanshu drives business development, vendor operations and fulfillment at KALA. He oversees production quality, supply chain partnerships, and client relationships, ensuring every order meets KALA's craftsmanship standards.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. KALA'S VISION
          ==================================================================== */}
      <section className="kala-about-vision-section" aria-labelledby="vision-heading">
        <div className="kala-about-container">
          <div className="kala-vision-card">
            <span className="vision-kicker">OUR VISION</span>
            <blockquote id="vision-heading" className="vision-quote">
              &ldquo;To make custom apparel more personal, accessible and effortless — whether you're creating one piece for yourself or apparel for an entire community.&rdquo;
            </blockquote>
            <div className="vision-brand-signature">
              <span className="sig-name">KALA</span>
              <span className="sig-sub">EST. 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. FINAL CTA
          ==================================================================== */}
      <section className="kala-about-final-cta-section" aria-labelledby="about-cta-title">
        <div className="kala-about-container">
          <div className="kala-about-cta-card">
            <span className="cta-kicker">START YOUR JOURNEY</span>
            <h2 id="about-cta-title" className="cta-title">
              HAVE AN IDEA WORTH WEARING?
            </h2>
            <p className="cta-subtitle">
              Create something personal with KALA.
            </p>

            <div className="cta-actions">
              <Link to="/custom-apparel" className="kala-about-btn primary">
                <span>Start Creating</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link to="/shop" className="kala-about-btn secondary light">
                <span>Explore KALA</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default About
