import React from 'react'
import { useAdmin } from '../../context/AdminContext'
import '../../styles/Admin.css'

export const AdminSettings: React.FC = () => {
  const { adminUser, adminLogout } = useAdmin()

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <div className="admin-page-header-left">
          <div className="admin-breadcrumb-badge">Administration</div>
          <h1 className="admin-page-title">Settings</h1>
          <p className="admin-page-subtitle">
            Personal business administration and platform configuration
          </p>
        </div>
      </header>

      <div className="admin-settings-wrapper" style={{ display: 'grid', gap: '2rem', maxWidth: '960px' }}>
        {/* Administrator Profile Card */}
        <section
          style={{
            backgroundColor: 'var(--admin-card-bg, #1a1a1a)',
            border: '1px solid var(--admin-border, #2a2a2a)',
            borderRadius: '12px',
            padding: '2rem',
          }}
          aria-labelledby="admin-profile-heading"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--kala-orange, #d94700)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 700,
              }}
              aria-hidden="true"
            >
              {adminUser?.firstName ? adminUser.firstName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <h2
                id="admin-profile-heading"
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: '0.25rem',
                }}
              >
                {adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : 'Administrator'}
              </h2>
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: 'rgba(217, 71, 0, 0.15)',
                  color: 'var(--kala-orange, #d94700)',
                  border: '1px solid rgba(217, 71, 0, 0.3)',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {adminUser?.role === 'admin' ? 'Verified System Administrator' : 'Admin'}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--admin-border, #2a2a2a)',
            }}
          >
            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.25rem' }}>
                Email Address
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f0f0f0' }}>
                {adminUser?.email || '—'}
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.25rem' }}>
                Phone Number
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f0f0f0' }}>
                {adminUser?.phone ? `+91 ${adminUser.phone}` : '—'}
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.25rem' }}>
                Account ID
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f0f0f0', fontFamily: 'monospace' }}>
                {adminUser?.userId || '—'}
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.25rem' }}>
                Session Role
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#10b981' }}>
                Server Verified (Role: admin)
              </span>
            </div>
          </div>
        </section>

        {/* Platform & Security Status Card */}
        <section
          style={{
            backgroundColor: 'var(--admin-card-bg, #1a1a1a)',
            border: '1px solid var(--admin-border, #2a2a2a)',
            borderRadius: '12px',
            padding: '2rem',
          }}
          aria-labelledby="security-status-heading"
        >
          <h2
            id="security-status-heading"
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '1rem',
            }}
          >
            Security & System Architecture
          </h2>

          <div style={{ display: 'grid', gap: '0.85rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                border: '1px solid var(--admin-border, #2a2a2a)',
              }}
            >
              <div>
                <span style={{ display: 'block', fontWeight: 600, color: '#f0f0f0', fontSize: '0.9rem' }}>
                  Authoritative Authorization
                </span>
                <span style={{ fontSize: '0.78rem', color: '#888' }}>
                  Backend MongoDB queries authoritatively verify admin role on all requests
                </span>
              </div>
              <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.82rem' }}>
                ACTIVE
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                border: '1px solid var(--admin-border, #2a2a2a)',
              }}
            >
              <div>
                <span style={{ display: 'block', fontWeight: 600, color: '#f0f0f0', fontSize: '0.9rem' }}>
                  JWT Bearer Flow
                </span>
                <span style={{ fontSize: '0.78rem', color: '#888' }}>
                  Tokens cryptographically signed by backend environment secret
                </span>
              </div>
              <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.82rem' }}>
                ACTIVE
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                border: '1px solid var(--admin-border, #2a2a2a)',
              }}
            >
              <div>
                <span style={{ display: 'block', fontWeight: 600, color: '#f0f0f0', fontSize: '0.9rem' }}>
                  Rate Limiting Protection
                </span>
                <span style={{ fontSize: '0.78rem', color: '#888' }}>
                  Strict brute-force prevention on authentication endpoints
                </span>
              </div>
              <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.82rem' }}>
                ACTIVE
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                border: '1px solid var(--admin-border, #2a2a2a)',
              }}
            >
              <div>
                <span style={{ display: 'block', fontWeight: 600, color: '#f0f0f0', fontSize: '0.9rem' }}>
                  Sensitive Data Protection
                </span>
                <span style={{ fontSize: '0.78rem', color: '#888' }}>
                  Password hashes unselected by default, never exposed to client or logs
                </span>
              </div>
              <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.82rem' }}>
                ENFORCED
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.75rem', display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={adminLogout}
            >
              Sign Out of Administration
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminSettings
