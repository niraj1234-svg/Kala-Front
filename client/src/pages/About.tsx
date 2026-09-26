import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProductImage } from '../data/products'
import '../styles/About.css'

export const About: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  return (
    <main className="kala-about-page" id="main-content">
      {/* ====================================================================
          1. HERO — WE ARE KALA (Split Editorial Composition)
          ==================================================================== */}
      <section className="kala-about-hero" aria-label="We Are KALA Introduction">
        <div className="kala-container kala-about-hero-grid">
          {/* Left Column: Story & CTAs */}
          <div className="kala-about-hero-left">
            <span className="kala-about-eyebrow" aria-label="Section label">
              OUR STORY
            </span>
            <h1 className="kala-about-hero-title">
              WE ARE KALA.
            </h1>
            <p className="kala-about-hero-desc">
              KALA is a custom apparel and brand merchandise business built to help people, teams, businesses, colleges, events and communities turn ideas into something they can wear, use and share.
            </p>
            <div className="kala-about-hero-actions">
              <Link to="/custom-apparel" className="kala-btn kala-about-btn-primary">
                <span>CREATE YOURS</span>
                <span className="kala-about-btn-arrow" aria-hidden="true">→</span>
              </Link>
              <Link to="/shop" className="kala-btn kala-about-btn-secondary">
                <span>SHOP KALA</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Editorial Visual with Floating Labels */}
          <div className="kala-about-hero-right" aria-label="Editorial visual campaign">
            <div className="kala-about-editorial-visual">
              <div className="kala-about-visual-backdrop" aria-hidden="true" />
              <div className="kala-about-image-card">
                <img
                  src="/custom-apparel/kala-editorial-tee.jpg"
                  onError={(e) => {
                    // Fallback to local streetwear asset if path fails
                    const target = e.currentTarget
                    target.onerror = null
                    target.src = getProductImage('Streetwear -02.png')
                  }}
                  alt="KALA Editorial Heavyweight Streetwear"
                  className="kala-about-hero-img"
                  loading="eager"
                />
                <div className="kala-about-image-overlay" aria-hidden="true" />
              </div>

              {/* Floating Label 1: Top Right */}
              <div className="kala-floating-pill kala-floating-est" aria-label="Established Jan 2026">
                <span className="kala-floating-dot" aria-hidden="true" />
                <span className="kala-floating-text">EST. JAN 2026</span>
              </div>

              {/* Floating Label 2: Bottom Left */}
              <div className="kala-floating-pill kala-floating-motto" aria-label="Ideas into Apparel">
                <span className="kala-floating-badge-tag" aria-hidden="true">STUDIO</span>
                <span className="kala-floating-text">IDEAS INTO APPAREL</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. BRAND STATEMENT SECTION
          ==================================================================== */}
      <section className="kala-brand-statement-section" aria-labelledby="statement-title">
        <div className="kala-container">
          <div className="kala-statement-wrapper">
            <span className="kala-statement-kicker" aria-hidden="true">
              THE KALA ETHOS
            </span>
            <h2 id="statement-title" className="kala-statement-h2">
              MORE THAN CLOTHES.
            </h2>
            <p className="kala-statement-lead">
              WE TURN <span className="kala-accent-word">IDEAS</span> INTO{' '}
              <span className="kala-accent-word">SOMETHING YOU CAN WEAR</span>.
            </p>
            <p className="kala-statement-body-copy">
              From a single custom T-shirt to apparel for teams, businesses, colleges and communities, KALA exists to make ideas{' '}
              <span className="kala-accent-word">tangible</span>.
            </p>
            <div className="kala-statement-divider" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. "WHY KALA?" SECTION
          ==================================================================== */}
      <section className="kala-why-section" aria-labelledby="why-kala-heading">
        <div className="kala-container">
          <div className="kala-section-header">
            <span className="kala-about-eyebrow">OUR PILLARS</span>
            <h2 id="why-kala-heading" className="kala-section-title">
              WHY KALA?
            </h2>
            <p className="kala-section-sub">
              Engineered with precision, built for expression, and delivered across India.
            </p>
          </div>

          <div className="kala-why-grid">
            {/* Card 01 — CUSTOM */}
            <article className="kala-why-card">
              <div className="kala-why-card-top">
                <span className="kala-why-num">01</span>
                <span className="kala-why-pill">BESPOKE</span>
              </div>
              <h3 className="kala-why-card-title">CUSTOM</h3>
              <p className="kala-why-card-tagline">
                Your idea. Your identity. Your apparel.
              </p>
              <p className="kala-why-card-desc">
                Create apparel around your own ideas, designs, teams, communities and brands. Every piece is crafted to reflect your authentic aesthetic without generic templates.
              </p>
            </article>

            {/* Card 02 — QUALITY */}
            <article className="kala-why-card">
              <div className="kala-why-card-top">
                <span className="kala-why-num">02</span>
                <span className="kala-why-pill">CRAFT</span>
              </div>
              <h3 className="kala-why-card-title">QUALITY</h3>
              <p className="kala-why-card-tagline">
                Built to be worn, not just printed.
              </p>
              <ul className="kala-why-specs-list" aria-label="Quality specifications">
                <li><span className="kala-why-bullet">✦</span> Premium 220–450 GSM fabrics</li>
                <li><span className="kala-why-bullet">✦</span> Multi-stage quality checking</li>
                <li><span className="kala-why-bullet">✦</span> Durable high-density printing</li>
                <li><span className="kala-why-bullet">✦</span> Comfortable everyday wear</li>
              </ul>
            </article>

            {/* Card 03 — FOR EVERYONE */}
            <article className="kala-why-card">
              <div className="kala-why-card-top">
                <span className="kala-why-num">03</span>
                <span className="kala-why-pill">INCLUSIVE</span>
              </div>
              <h3 className="kala-why-card-title">FOR EVERYONE</h3>
              <p className="kala-why-card-tagline">
                People. Teams. Businesses. Communities.
              </p>
              <p className="kala-why-card-desc">
                KALA serves individuals, college students, sports teams, businesses, startups, colleges, events, and culture collectives. Whether 1 piece or 500, we craft with equal dedication.
              </p>
            </article>

            {/* Card 04 — PAN-INDIA */}
            <article className="kala-why-card">
              <div className="kala-why-card-top">
                <span className="kala-why-num">04</span>
                <span className="kala-why-pill">LOGISTICS</span>
              </div>
              <h3 className="kala-why-card-title">PAN-INDIA</h3>
              <p className="kala-why-card-tagline">
                Ideas can travel anywhere.
              </p>
              <p className="kala-why-card-desc">
                Reliable Pan-India delivery with live tracking right to your doorstep. We coordinate with trusted partners to ensure safe, timely arrival in every state and pin code.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. THE KALA JOURNEY (Timeline)
          ==================================================================== */}
      <section className="kala-journey-section" aria-labelledby="journey-heading">
        <div className="kala-container">
          <div className="kala-section-header">
            <span className="kala-about-eyebrow">CHRONOLOGY</span>
            <h2 id="journey-heading" className="kala-section-title">
              FROM AN IDEA TO KALA.
            </h2>
            <p className="kala-section-sub">
              How a simple vision evolved into a modern apparel and brand merchandise studio.
            </p>
          </div>

          <div className="kala-timeline">
            <div className="kala-timeline-track" aria-hidden="true" />

            {/* Step 1 */}
            <div className="kala-timeline-item">
              <div className="kala-timeline-marker">
                <span className="kala-timeline-dot" aria-hidden="true" />
                <span className="kala-timeline-badge">01</span>
              </div>
              <div className="kala-timeline-card">
                <span className="kala-timeline-date">JAN 2026</span>
                <h3 className="kala-timeline-title">KALA begins.</h3>
                <p className="kala-timeline-text">
                  Founded with a clear purpose: eliminate the friction in creating custom streetwear and premium brand merchandise across India.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="kala-timeline-item">
              <div className="kala-timeline-marker">
                <span className="kala-timeline-dot" aria-hidden="true" />
                <span className="kala-timeline-badge">02</span>
              </div>
              <div className="kala-timeline-card">
                <span className="kala-timeline-date">PHASE ONE</span>
                <h3 className="kala-timeline-title">THE IDEA</h3>
                <p className="kala-timeline-text">
                  Turn everyday ideas and identities into apparel. Moving beyond commoditized fast fashion to wearable personal statements that last.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="kala-timeline-item">
              <div className="kala-timeline-marker">
                <span className="kala-timeline-dot" aria-hidden="true" />
                <span className="kala-timeline-badge">03</span>
              </div>
              <div className="kala-timeline-card">
                <span className="kala-timeline-date">PHASE TWO</span>
                <h3 className="kala-timeline-title">THE BUILD</h3>
                <p className="kala-timeline-text">
                  Create products, experiment with designs and build the KALA experience. Establishing strict vetting standards, custom back-text personalization, and curated streetwear silhouettes.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="kala-timeline-item">
              <div className="kala-timeline-marker">
                <span className="kala-timeline-dot" aria-hidden="true" />
                <span className="kala-timeline-badge">04</span>
              </div>
              <div className="kala-timeline-card">
                <span className="kala-timeline-date">PHASE THREE</span>
                <h3 className="kala-timeline-title">THE COMMUNITY</h3>
                <p className="kala-timeline-text">
                  Serve people, teams, businesses, colleges and communities. Becoming the go-to apparel partner for student collectives, esports squads, gyms, and innovative startups.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="kala-timeline-item">
              <div className="kala-timeline-marker">
                <span className="kala-timeline-dot" aria-hidden="true" />
                <span className="kala-timeline-badge">05</span>
              </div>
              <div className="kala-timeline-card kala-timeline-card-future">
                <span className="kala-timeline-date">ONWARD</span>
                <h3 className="kala-timeline-title">WHAT'S NEXT</h3>
                <p className="kala-timeline-text">
                  Keep creating. Keep experimenting. Keep turning ideas into apparel. Continuously expanding categories, fabric innovations, and creator collaborations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. "BUILT FOR PEOPLE WITH STORIES" (Immersive Editorial Canvas)
          ==================================================================== */}
      <section className="kala-stories-immersive-section" aria-labelledby="stories-heading">
        <div className="kala-stories-bg-wrap">
          <img
            src="/home/statement-banner.jpg"
            onError={(e) => {
              const target = e.currentTarget
              target.onerror = null
              target.src = getProductImage('hero-rooted-in-bihar.png')
            }}
            alt="KALA Apparel Culture"
            className="kala-stories-bg-img"
          />
          <div className="kala-stories-dark-scrim" aria-hidden="true" />
        </div>

        <div className="kala-container kala-stories-content-container">
          <div className="kala-stories-text-center">
            <span className="kala-stories-pill-label" aria-hidden="true">
              CULTURE &amp; IDENTITY
            </span>
            <h2 id="stories-heading" className="kala-stories-main-title">
              EVERYONE HAS A STORY.
            </h2>
            <p className="kala-stories-second-line">
              WE JUST HELP YOU WEAR IT.
            </p>
            <p className="kala-stories-body">
              Apparel is the canvas of our generation. It tells people who you represent, where you’re from, and what you stand for.
            </p>
          </div>

          {/* Editorial / Campaign Annotations (Pins) */}
          <div className="kala-annotations-grid" aria-label="Stories annotations">
            <div className="kala-annotation-tag tag-pos-1">
              <span className="kala-annotation-hash">#01</span>
              <span className="kala-annotation-label">YOUR TEAM</span>
            </div>
            <div className="kala-annotation-tag tag-pos-2">
              <span className="kala-annotation-hash">#02</span>
              <span className="kala-annotation-label">YOUR COLLEGE</span>
            </div>
            <div className="kala-annotation-tag tag-pos-3">
              <span className="kala-annotation-hash">#03</span>
              <span className="kala-annotation-label">YOUR BRAND</span>
            </div>
            <div className="kala-annotation-tag tag-pos-4">
              <span className="kala-annotation-hash">#04</span>
              <span className="kala-annotation-label">YOUR CITY</span>
            </div>
            <div className="kala-annotation-tag tag-pos-5">
              <span className="kala-annotation-hash">#05</span>
              <span className="kala-annotation-label">YOUR PEOPLE</span>
            </div>
            <div className="kala-annotation-tag tag-pos-6 highlight-orange">
              <span className="kala-annotation-hash">#06</span>
              <span className="kala-annotation-label">YOUR STORY</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. WHAT WE CREATE (8 Rich Product / Category Cards)
          ==================================================================== */}
      <section className="kala-create-categories-section" aria-labelledby="create-heading">
        <div className="kala-container">
          <div className="kala-section-header">
            <span className="kala-about-eyebrow">THE APPAREL CATALOG</span>
            <h2 id="create-heading" className="kala-section-title">
              WHAT WE CREATE
            </h2>
            <p className="kala-section-sub">
              From signature streetwear drops to customized brand merchandise built for scale.
            </p>
          </div>

          <div className="kala-categories-grid">
            {/* 1. T-SHIRTS */}
            <article className="kala-cat-card">
              <div className="kala-cat-img-box">
                <img
                  src={getProductImage('Streetwear 04.png')}
                  alt="KALA T-Shirts"
                  className="kala-cat-img"
                  loading="lazy"
                />
                <span className="kala-cat-badge">ESSENTIAL</span>
              </div>
              <div className="kala-cat-info">
                <h3 className="kala-cat-title">T-SHIRTS</h3>
                <p className="kala-cat-desc">
                  Everyday premium statement tees crafted with 220 GSM combed ringspun cotton.
                </p>
                <Link to="/shop" className="kala-cat-link">
                  <span>Explore T-Shirts</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>

            {/* 2. OVERSIZED T-SHIRTS */}
            <article className="kala-cat-card">
              <div className="kala-cat-img-box">
                <img
                  src={getProductImage('Streetwear 01.png')}
                  alt="KALA Oversized T-Shirts"
                  className="kala-cat-img"
                  loading="lazy"
                />
                <span className="kala-cat-badge">STREETWEAR</span>
              </div>
              <div className="kala-cat-info">
                <h3 className="kala-cat-title">OVERSIZED T-SHIRTS</h3>
                <p className="kala-cat-desc">
                  Drop-shoulder 280 GSM heavyweight streetwear silhouette engineered for an effortless drape.
                </p>
                <Link to="/shop" className="kala-cat-link">
                  <span>Explore Oversized</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>

            {/* 3. GYMWEAR */}
            <article className="kala-cat-card">
              <div className="kala-cat-img-box">
                <img
                  src={getProductImage('Gymwear-05.png')}
                  alt="KALA Gymwear"
                  className="kala-cat-img"
                  loading="lazy"
                />
                <span className="kala-cat-badge">PERFORMANCE</span>
              </div>
              <div className="kala-cat-info">
                <h3 className="kala-cat-title">GYMWEAR</h3>
                <p className="kala-cat-desc">
                  High-density pump covers, moisture-wicking athletic tanks, and powerlifting training gear.
                </p>
                <Link to="/shop" className="kala-cat-link">
                  <span>Explore Gymwear</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>

            {/* 4. HOODIES */}
            <article className="kala-cat-card">
              <div className="kala-cat-img-box">
                <img
                  src={getProductImage('Streetwear -02.png')}
                  alt="KALA Hoodies"
                  className="kala-cat-img"
                  loading="lazy"
                />
                <span className="kala-cat-badge">HEAVYWEIGHT</span>
              </div>
              <div className="kala-cat-info">
                <h3 className="kala-cat-title">HOODIES</h3>
                <p className="kala-cat-desc">
                  Heavyweight 450 GSM French Terry boxy hoodies built for warmth, durability and shape retention.
                </p>
                <Link to="/shop" className="kala-cat-link">
                  <span>Explore Hoodies</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>

            {/* 5. JERSEYS */}
            <article className="kala-cat-card">
              <div className="kala-cat-img-box">
                <img
                  src="/business-branding/card-03-team-apparel.jpg"
                  onError={(e) => {
                    const target = e.currentTarget
                    target.onerror = null
                    target.src = getProductImage('gaming 01.png')
                  }}
                  alt="KALA Team Jerseys"
                  className="kala-cat-img"
                  loading="lazy"
                />
                <span className="kala-cat-badge">ATHLETIC</span>
              </div>
              <div className="kala-cat-info">
                <h3 className="kala-cat-title">JERSEYS</h3>
                <p className="kala-cat-desc">
                  Team jerseys, esports kits, squad athletic kits and custom tournament uniforms.
                </p>
                <Link to="/shop" className="kala-cat-link">
                  <span>Explore Jerseys</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>

            {/* 6. CUSTOM APPAREL */}
            <article className="kala-cat-card kala-cat-card-featured">
              <div className="kala-cat-img-box">
                <img
                  src="/custom-apparel/kala-editorial-tee.jpg"
                  onError={(e) => {
                    const target = e.currentTarget
                    target.onerror = null
                    target.src = getProductImage('Streetwear 06.png')
                  }}
                  alt="KALA Custom Apparel"
                  className="kala-cat-img"
                  loading="lazy"
                />
                <span className="kala-cat-badge highlight-orange">CUSTOM</span>
              </div>
              <div className="kala-cat-info">
                <h3 className="kala-cat-title">CUSTOM APPAREL</h3>
                <p className="kala-cat-desc">
                  Made around your idea. From custom back text to personalized graphics and bespoke batches.
                </p>
                <Link to="/custom-apparel" className="kala-cat-link">
                  <span>Design Yours</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>

            {/* 7. BRAND MERCHANDISE */}
            <article className="kala-cat-card">
              <div className="kala-cat-img-box">
                <img
                  src="/business-branding/card-04-brand-merchandise.jpg"
                  onError={(e) => {
                    const target = e.currentTarget
                    target.onerror = null
                    target.src = getProductImage('hero-3-wear-create-express.png')
                  }}
                  alt="KALA Brand Merchandise"
                  className="kala-cat-img"
                  loading="lazy"
                />
                <span className="kala-cat-badge">BUSINESS</span>
              </div>
              <div className="kala-cat-info">
                <h3 className="kala-cat-title">BRAND MERCHANDISE</h3>
                <p className="kala-cat-desc">
                  Turn your brand into something people can wear. Carry bags, packaging, cards and staff wear.
                </p>
                <Link to="/business-branding" className="kala-cat-link">
                  <span>Brand Merch</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>

            {/* 8. EVENT APPAREL */}
            <article className="kala-cat-card">
              <div className="kala-cat-img-box">
                <img
                  src="/business-branding/card-02-event-merch.jpg"
                  onError={(e) => {
                    const target = e.currentTarget
                    target.onerror = null
                    target.src = getProductImage('Streetwear 03.png')
                  }}
                  alt="KALA Event Apparel"
                  className="kala-cat-img"
                  loading="lazy"
                />
                <span className="kala-cat-badge">COMMUNITY</span>
              </div>
              <div className="kala-cat-info">
                <h3 className="kala-cat-title">EVENT APPAREL</h3>
                <p className="kala-cat-desc">
                  Built for teams, groups and communities. Fest tees, batch hoodies and crew uniforms.
                </p>
                <Link to="/business-branding" className="kala-cat-link">
                  <span>Event Apparel</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. KALA FOR BUSINESS
          ==================================================================== */}
      <section className="kala-business-section" aria-labelledby="business-heading">
        <div className="kala-container">
          <div className="kala-business-card-wrap">
            <div className="kala-business-content">
              <span className="kala-business-eyebrow">ENTERPRISE &amp; BRANDING</span>
              <h2 id="business-heading" className="kala-business-title">
                YOUR BRAND. YOUR IDENTITY. YOUR APPAREL.
              </h2>
              <p className="kala-business-copy">
                From employee merchandise to event apparel and branded products, KALA helps businesses turn their identity into something tangible.
              </p>
              <div className="kala-business-features">
                <div className="kala-biz-feature-item">
                  <span className="kala-biz-check" aria-hidden="true">✓</span>
                  <span>Corporate bulk discounts with tiered pricing calculator</span>
                </div>
                <div className="kala-biz-feature-item">
                  <span className="kala-biz-check" aria-hidden="true">✓</span>
                  <span>Custom packaging, tags, stickers &amp; carry bags</span>
                </div>
                <div className="kala-biz-feature-item">
                  <span className="kala-biz-check" aria-hidden="true">✓</span>
                  <span>Dedicated B2B coordination &amp; pre-dispatch quality checks</span>
                </div>
              </div>
              <div className="kala-business-cta-box">
                <Link to="/business-branding" className="kala-btn kala-business-btn">
                  <span>TALK TO KALA</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            <div className="kala-business-visual" aria-hidden="true">
              <img
                src="/business-branding/kala-corporate-tee.jpg"
                onError={(e) => {
                  const target = e.currentTarget
                  target.onerror = null
                  target.src = getProductImage('hero-1-more-than-a-tshirt.png')
                }}
                alt="KALA Corporate Apparel & Merch"
                className="kala-business-img"
              />
              <div className="kala-business-tag">
                <span>BUSINESS SOLUTION</span>
                <strong>PAN-INDIA FULFILLMENT</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. CUSTOM APPAREL CTA — HAVE AN IDEA?
          ==================================================================== */}
      <section className="kala-custom-cta-section" aria-labelledby="custom-cta-heading">
        <div className="kala-container">
          <div className="kala-custom-cta-box">
            <span className="kala-custom-cta-kicker">START CREATING</span>
            <h2 id="custom-cta-heading" className="kala-custom-cta-h2">
              HAVE AN IDEA?
            </h2>
            <p className="kala-custom-cta-subhead">
              LET'S TURN IT INTO APPAREL.
            </p>
            <p className="kala-custom-cta-text">
              Tell us what you're imagining and let's create something around it.
            </p>
            <div className="kala-custom-cta-buttons">
              <Link to="/custom-apparel" className="kala-btn kala-custom-btn-orange">
                <span>CREATE YOURS</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link to="/shop" className="kala-btn kala-custom-btn-outline">
                <span>EXPLORE KALA</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          9. FINAL BRAND STATEMENT (Minimal, Premium, Whitespace)
          ==================================================================== */}
      <section className="kala-final-statement-section" aria-label="Brand Signature">
        <div className="kala-container">
          <div className="kala-final-statement-box">
            <div className="kala-final-lines" aria-label="People. Places. Stories. You Wear.">
              <span className="kala-final-line">PEOPLE.</span>
              <span className="kala-final-line">PLACES.</span>
              <span className="kala-final-line">STORIES.</span>
              <span className="kala-final-line kala-final-line-accent">YOU WEAR.</span>
            </div>

            <div className="kala-final-brand-block">
              <span className="kala-final-brand-name">KALA</span>
              <span className="kala-final-brand-underline" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default About
