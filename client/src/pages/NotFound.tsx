import React from 'react'
import { Link } from 'react-router-dom'

export const NotFound: React.FC = () => {
  return (
    <main
      className="kala-container"
      style={{
        padding: '5rem 1.5rem',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <p className="kala-display" style={{ color: 'var(--kala-orange)', marginBottom: '0.5rem' }}>
        404
      </p>
      <h1 className="kala-h2" style={{ marginBottom: '1rem' }}>
        Page not found.
      </h1>
      <p className="kala-body" style={{ color: 'var(--kala-text-secondary)', marginBottom: '2rem' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="kala-btn kala-btn-primary">
        Return Home
      </Link>
    </main>
  )
}

export default NotFound
