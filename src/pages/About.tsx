import React from 'react'

export const About: React.FC = () => {
  return (
    <main className="kala-container" style={{ padding: '4rem 1.5rem', minHeight: '60vh' }}>
      <p className="kala-label" style={{ color: 'var(--kala-orange)', marginBottom: '0.75rem' }}>
        OUR STORY
      </p>
      <h1 className="kala-h1" style={{ marginBottom: '1rem' }}>
        ABOUT
      </h1>
      <p className="kala-body" style={{ color: 'var(--kala-text-secondary)' }}>
        This is the KALA About page.
      </p>
    </main>
  )
}

export default About
