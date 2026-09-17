import React from 'react'
import { Link } from 'react-router-dom'
import { getProductImage } from '../data/products'
import '../styles/About.css'

export const About: React.FC = () => {
  return (
    <main className="kala-about-page" id="main-content">
      {/* ====================================================================
          SECTION 1 — ABOUT HERO
          ==================================================================== */}
      <section className="kala-about-hero" aria-label="About KALA Introduction">
        <div className="kala-container kala-about-hero-grid">
          <div className="kala-about-hero-content">
            <p className="kala-about-eyebrow">OUR STORY</p>
            <h1 className="kala-about-hero-title">WE ARE KALA.</h1>
            <p className="kala-about-hero-desc">
              KALA is a custom apparel and brand merchandise business built to help people, teams, businesses, colleges, events and communities turn ideas into something they can wear, use and share.
            </p>
            <div className="kala-about-hero-actions">
              <Link to="/custom-apparel" className="kala-btn kala-about-hero-btn-primary">
                CREATE YOURS
              </Link>
              <Link to="/shop" className="kala-btn kala-about-hero-btn-secondary">
                SHOP KALA
              </Link>
            </div>
            <div className="kala-about-hero-meta">
              <span className="kala-about-hero-meta-item">
                <span className="kala-about-hero-meta-dot" aria-hidden="true" />
                Custom Apparel &amp; Merch
              </span>
              <span className="kala-about-hero-meta-item">
                <span className="kala-about-hero-meta-dot" aria-hidden="true" />
                Pan-India Delivery
              </span>
              <span className="kala-about-hero-meta-item">
                <span className="kala-about-hero-meta-dot" aria-hidden="true" />
                Quality Checked
              </span>
            </div>
          </div>

          <div className="kala-about-hero-visual" aria-hidden="true">
            <div className="kala-about-hero-card">
              <div className="kala-about-hero-image-wrap">
                <img
                  src={getProductImage('Streetwear -02.png')}
                  alt="KALA Minimalist Heavyweight Apparel"
                  className="kala-about-hero-image"
                />
                <span className="kala-about-hero-tag">EST. JAN 2026</span>
              </div>
              <div className="kala-about-hero-footer">
                <div>
                  <h3 className="kala-about-hero-footer-title">Crafted Around Ideas</h3>
                  <p className="kala-about-hero-footer-sub">Apparel &amp; Brand Merchandise</p>
                </div>
                <span className="kala-about-hero-badge">PAN-INDIA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 2 — OUR STORY
          ==================================================================== */}
      <section className="kala-story-section" aria-labelledby="story-heading">
        <div className="kala-container">
          <div className="kala-story-intro">
            <p className="kala-label" style={{ color: 'var(--kala-orange)', marginBottom: '0.5rem' }}>
              HOW IT STARTED
            </p>
            <h2 id="story-heading" className="kala-h1" style={{ marginBottom: '1.25rem', textTransform: 'uppercase' }}>
              BUILT AROUND YOUR IDEA
            </h2>
            <p className="kala-story-narrative">
              KALA started in January 2026 with a simple idea — make custom apparel and branded merchandise easier for people to create and order.
            </p>
            <p className="kala-story-subnarrative">
              Rather than owning or operating a single rigid production facility, KALA coordinates directly with carefully vetted third-party printing and manufacturing partners across India to produce products matching each customer’s exact cut, material, and graphic specifications. KALA manages the entire workflow — from initial order intake and proof verification through to meticulous pre-dispatch quality checks and nationwide delivery.
            </p>
          </div>

          {/* Process Flow Diagram */}
          <div className="kala-flow-box">
            <h3 className="kala-flow-box-title">THE KALA COORDINATION MODEL</h3>
            <div className="kala-flow-diagram">
              <div className="kala-flow-node">
                <p className="kala-flow-node-step">STEP 01</p>
                <p className="kala-flow-node-label">CUSTOMER</p>
                <p className="kala-flow-node-role">Shares design &amp; requirement</p>
              </div>

              <div className="kala-flow-arrow" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>

              <div className="kala-flow-node kala-flow-node-accent">
                <p className="kala-flow-node-step">STEP 02</p>
                <p className="kala-flow-node-label">KALA</p>
                <p className="kala-flow-node-role">Coordinates design &amp; order specs</p>
              </div>

              <div className="kala-flow-arrow" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>

              <div className="kala-flow-node">
                <p className="kala-flow-node-step">STEP 03</p>
                <p className="kala-flow-node-label">PARTNER</p>
                <p className="kala-flow-node-role">Printing / manufacturing</p>
              </div>

              <div className="kala-flow-arrow" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>

              <div className="kala-flow-node kala-flow-node-accent">
                <p className="kala-flow-node-step">STEP 04</p>
                <p className="kala-flow-node-label">KALA CHECK</p>
                <p className="kala-flow-node-role">Detailed quality check</p>
              </div>

              <div className="kala-flow-arrow" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>

              <div className="kala-flow-node">
                <p className="kala-flow-node-step">STEP 05</p>
                <p className="kala-flow-node-label">CUSTOMER</p>
                <p className="kala-flow-node-role">Pan-India doorstep delivery</p>
              </div>
            </div>

            {/* 5-Step Narrative Breakdown */}
            <div className="kala-story-steps-grid">
              <div className="kala-story-step-item">
                <span className="kala-story-step-num">1</span>
                <p className="kala-story-step-text">Customer shares their requirement.</p>
              </div>
              <div className="kala-story-step-item">
                <span className="kala-story-step-num">2</span>
                <p className="kala-story-step-text">KALA coordinates the design/order requirements.</p>
              </div>
              <div className="kala-story-step-item">
                <span className="kala-story-step-num">3</span>
                <p className="kala-story-step-text">A suitable printing/manufacturing partner produces the order.</p>
              </div>
              <div className="kala-story-step-item">
                <span className="kala-story-step-num">4</span>
                <p className="kala-story-step-text">KALA performs a quality check on the finished products.</p>
              </div>
              <div className="kala-story-step-item">
                <span className="kala-story-step-num">5</span>
                <p className="kala-story-step-text">The completed order is delivered to the customer.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 3 — WHAT WE DO
          ==================================================================== */}
      <section className="kala-what-section" aria-labelledby="what-heading">
        <div className="kala-container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3rem' }}>
            <p className="kala-label" style={{ color: 'var(--kala-orange)', marginBottom: '0.5rem' }}>
              CAPABILITIES
            </p>
            <h2 id="what-heading" className="kala-h1" style={{ marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              MORE THAN JUST T-SHIRTS
            </h2>
            <p style={{ color: 'var(--kala-text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
              From everyday apparel to complete brand merchandise, KALA helps turn ideas into physical products.
            </p>
          </div>

          <div className="kala-what-grid">
            {/* Group 1: Apparel */}
            <div className="kala-what-card">
              <div className="kala-what-card-header">
                <p className="kala-what-badge">GROUP 01</p>
                <h3 className="kala-what-title">APPAREL</h3>
              </div>
              <ul className="kala-what-list">
                <li className="kala-what-list-item">
                  <span className="kala-what-item-bullet" aria-hidden="true" />
                  T-Shirts
                </li>
                <li className="kala-what-list-item">
                  <span className="kala-what-item-bullet" aria-hidden="true" />
                  Oversized T-Shirts
                </li>
                <li className="kala-what-list-item">
                  <span className="kala-what-item-bullet" aria-hidden="true" />
                  Hoodies
                </li>
                <li className="kala-what-list-item">
                  <span className="kala-what-item-bullet" aria-hidden="true" />
                  Jerseys
                </li>
                <li className="kala-what-list-item">
                  <span className="kala-what-item-bullet" aria-hidden="true" />
                  Tracksuits / Track Pants
                </li>
                <li className="kala-what-list-item">
                  <span className="kala-what-item-bullet" aria-hidden="true" />
                  Custom Apparel
                </li>
              </ul>
            </div>

            {/* Group 2: Business & Brand Merchandise */}
            <div className="kala-what-card kala-what-card-accent">
              <div className="kala-what-card-header">
                <p className="kala-what-badge">GROUP 02</p>
                <h3 className="kala-what-title">BUSINESS &amp; BRAND MERCHANDISE</h3>
              </div>
              <ul className="kala-what-list">
                <li className="kala-what-list-item">
                  <span className="kala-what-item-bullet" aria-hidden="true" />
                  Printed Carry Bags
                </li>
                <li className="kala-what-list-item">
                  <span className="kala-what-item-bullet" aria-hidden="true" />
                  Stickers
                </li>
                <li className="kala-what-list-item">
                  <span className="kala-what-item-bullet" aria-hidden="true" />
                  Packaging
                </li>
                <li className="kala-what-list-item">
                  <span className="kala-what-item-bullet" aria-hidden="true" />
                  Thank-You Cards
                </li>
                <li className="kala-what-list-item">
                  <span className="kala-what-item-bullet" aria-hidden="true" />
                  Bottle Labels
                </li>
                <li className="kala-what-list-item">
                  <span className="kala-what-item-bullet" aria-hidden="true" />
                  Boxes
                </li>
                <li className="kala-what-list-item">
                  <span className="kala-what-item-bullet" aria-hidden="true" />
                  Staff T-Shirts / Uniforms
                </li>
                <li className="kala-what-list-item">
                  <span className="kala-what-item-bullet" aria-hidden="true" />
                  Caps
                </li>
                <li className="kala-what-list-item">
                  <span className="kala-what-item-bullet" aria-hidden="true" />
                  Posters
                </li>
                <li className="kala-what-list-item">
                  <span className="kala-what-item-bullet" aria-hidden="true" />
                  Custom Brand Merchandise
                </li>
              </ul>
            </div>
          </div>

          {/* Availability Note */}
          <div className="kala-what-note">
            <p style={{ margin: 0 }}>
              Availability and production options may vary depending on the requirement and final quotation.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 4 — WHO WE CREATE FOR
          ==================================================================== */}
      <section className="kala-who-section" aria-labelledby="who-heading">
        <div className="kala-container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3rem' }}>
            <p className="kala-label" style={{ color: 'var(--kala-orange)', marginBottom: '0.5rem' }}>
              OUR CLIENTELE
            </p>
            <h2 id="who-heading" className="kala-h1" style={{ marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              MADE FOR YOUR WORLD
            </h2>
            <p style={{ color: 'var(--kala-text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
              Engineered for individuals, student collectives, competitive teams, and growing brands across India.
            </p>
          </div>

          <div className="kala-who-grid">
            <div className="kala-who-card">
              <span className="kala-who-num">01</span>
              <h3 className="kala-who-title">COLLEGE STUDENTS</h3>
              <p className="kala-who-desc">Custom fest tees, batch merchandise, and casual streetwear.</p>
            </div>

            <div className="kala-who-card">
              <span className="kala-who-num">02</span>
              <h3 className="kala-who-title">SPORTS TEAMS</h3>
              <p className="kala-who-desc">Tournament jerseys, squad athletic kits, and training tracksuits.</p>
            </div>

            <div className="kala-who-card">
              <span className="kala-who-num">03</span>
              <h3 className="kala-who-title">SCHOOLS &amp; COLLEGES</h3>
              <p className="kala-who-desc">Departmental apparel, commemorative hoodies, and institutional uniforms.</p>
            </div>

            <div className="kala-who-card">
              <span className="kala-who-num">04</span>
              <h3 className="kala-who-title">STARTUPS &amp; BUSINESSES</h3>
              <p className="kala-who-desc">Company merchandise, team apparel, client thank-you cards, and branded packaging.</p>
            </div>

            <div className="kala-who-card">
              <span className="kala-who-num">05</span>
              <h3 className="kala-who-title">EVENTS &amp; FESTS</h3>
              <p className="kala-who-desc">Event crew uniforms, organizer hoodies, and attendee takeaway merchandise.</p>
            </div>

            <div className="kala-who-card">
              <span className="kala-who-num">06</span>
              <h3 className="kala-who-title">GYMS</h3>
              <p className="kala-who-desc">High-density workout tanks, trainer tees, and custom fitness merch.</p>
            </div>

            <div className="kala-who-card">
              <span className="kala-who-num">07</span>
              <h3 className="kala-who-title">CORPORATE TEAMS</h3>
              <p className="kala-who-desc">Offsite apparel, milestone celebration kits, and professional workwear.</p>
            </div>

            <div className="kala-who-card">
              <span className="kala-who-num">08</span>
              <h3 className="kala-who-title">INDIVIDUALS</h3>
              <p className="kala-who-desc">Personalized statement wear, bespoke graphic apparel, and single-piece creations.</p>
            </div>
          </div>

          <p className="kala-who-summary">
            Whether it is a team order, college event, business merchandise, or something personal, KALA helps turn the requirement into a finished product.
          </p>
        </div>
      </section>

      {/* ====================================================================
          SECTION 5 — HOW KALA WORKS
          ==================================================================== */}
      <section className="kala-how-section" aria-labelledby="how-heading">
        <div className="kala-container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3rem' }}>
            <p className="kala-label" style={{ color: 'var(--kala-orange)', marginBottom: '0.5rem' }}>
              OUR PROCESS
            </p>
            <h2 id="how-heading" className="kala-h1" style={{ marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              FROM IDEA TO DELIVERY
            </h2>
            <p style={{ color: 'var(--kala-text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
              A clean 4-step workflow ensuring clarity, production control, and reliable delivery.
            </p>
          </div>

          <div className="kala-how-grid">
            <div className="kala-how-card">
              <span className="kala-how-num">01</span>
              <h3 className="kala-how-card-title">SHARE YOUR IDEA</h3>
              <p className="kala-how-card-desc">
                Tell us what you want to create, how many you need, and what your requirements are.
              </p>
            </div>

            <div className="kala-how-card">
              <span className="kala-how-num">02</span>
              <h3 className="kala-how-card-title">WE PLAN &amp; PRODUCE</h3>
              <p className="kala-how-card-desc">
                KALA coordinates the requirements with the appropriate printing or manufacturing partner.
              </p>
            </div>

            <div className="kala-how-card">
              <span className="kala-how-num">03</span>
              <h3 className="kala-how-card-title">QUALITY CHECK</h3>
              <p className="kala-how-card-desc">
                The finished products go through KALA's quality-check process before dispatch.
              </p>
            </div>

            <div className="kala-how-card">
              <span className="kala-how-num">04</span>
              <h3 className="kala-how-card-title">DELIVERED TO YOU</h3>
              <p className="kala-how-card-desc">
                Your completed order is delivered across India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 6 — KALA BY THE NUMBERS
          ==================================================================== */}
      <section className="kala-numbers-about-section" aria-labelledby="numbers-heading">
        <div className="kala-container">
          <h2 id="numbers-heading" className="kala-numbers-about-title">
            KALA TODAY
          </h2>
          <div className="kala-numbers-about-grid">
            <div className="kala-numbers-about-item">
              <span className="kala-numbers-about-val">500+</span>
              <span className="kala-numbers-about-label">ORDERS</span>
            </div>

            <div className="kala-numbers-about-item">
              <span className="kala-numbers-about-val">500+</span>
              <span className="kala-numbers-about-label">CUSTOMERS</span>
            </div>

            <div className="kala-numbers-about-item">
              <span className="kala-numbers-about-val">ALL INDIA</span>
              <span className="kala-numbers-about-label">DELIVERY</span>
            </div>

            <div className="kala-numbers-about-item">
              <span className="kala-numbers-about-val">JAN 2026</span>
              <span className="kala-numbers-about-label">SINCE JAN 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 7 — OUR APPROACH
          ==================================================================== */}
      <section className="kala-approach-section" aria-labelledby="approach-heading">
        <div className="kala-container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3rem' }}>
            <p className="kala-label" style={{ color: 'var(--kala-orange)', marginBottom: '0.5rem' }}>
              PRINCIPLES
            </p>
            <h2 id="approach-heading" className="kala-h1" style={{ marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              WHAT MATTERS TO US
            </h2>
            <p style={{ color: 'var(--kala-text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
              Core values that guide our customer communication, partner coordination, and quality standards.
            </p>
          </div>

          <div className="kala-approach-grid">
            <div className="kala-approach-card">
              <span className="kala-approach-num">01</span>
              <h3 className="kala-approach-title">YOUR IDEA FIRST</h3>
              <p className="kala-approach-desc">We start with what you want to create.</p>
            </div>

            <div className="kala-approach-card">
              <span className="kala-approach-num">02</span>
              <h3 className="kala-approach-title">CUSTOM, NOT GENERIC</h3>
              <p className="kala-approach-desc">Your apparel and merchandise should represent your identity.</p>
            </div>

            <div className="kala-approach-card">
              <span className="kala-approach-num">03</span>
              <h3 className="kala-approach-title">QUALITY CHECKED</h3>
              <p className="kala-approach-desc">Finished orders go through KALA's quality-check process before reaching the customer.</p>
            </div>

            <div className="kala-approach-card">
              <span className="kala-approach-num">04</span>
              <h3 className="kala-approach-title">BUILT TO SCALE</h3>
              <p className="kala-approach-desc">From individual requirements to larger team, event and business orders.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 8 — BRAND STATEMENT
          ==================================================================== */}
      <section className="kala-statement-section" aria-label="Brand Philosophy">
        <div className="kala-container">
          <div className="kala-statement-inner">
            <p className="kala-statement-eyebrow">THE KALA PHILOSOPHY</p>
            <h2 className="kala-statement-headline">
              YOUR IDEA.
              <br />
              YOUR BRAND.
              <br />
              YOUR IDENTITY.
            </h2>
            <p className="kala-statement-tagline">
              DESIGNED. PRINTED. MADE FOR YOU.
            </p>
            <p className="kala-statement-body">
              KALA brings apparel, printing and brand merchandise together in one simple process — helping turn an idea into something tangible.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 9 — FINAL CTA
          ==================================================================== */}
      <section className="kala-about-cta-section" aria-labelledby="final-cta-heading">
        <div className="kala-container">
          <div className="kala-about-cta-inner">
            <p className="kala-label kala-about-cta-badge">GET STARTED</p>
            <h2 id="final-cta-heading" className="kala-about-cta-title">
              LET'S MAKE SOMETHING THAT FEELS LIKE YOU.
            </h2>
            <p className="kala-about-cta-desc">
              Have an apparel idea, team order, event requirement or business branding project?
            </p>
            <div className="kala-about-cta-actions">
              <Link to="/custom-apparel" className="kala-btn kala-hero-btn-primary kala-about-cta-btn">
                CREATE YOURS
              </Link>
              <Link to="/business-branding" className="kala-btn kala-hero-btn-secondary kala-about-cta-btn">
                BUSINESS BRANDING
              </Link>
              <Link to="/shop" className="kala-btn kala-hero-btn-secondary kala-about-cta-btn">
                SHOP KALA
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default About
