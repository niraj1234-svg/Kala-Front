import React, { useState, useEffect } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { checkRazorpayConfig, type RazorpayConfigCheckResult } from '../../services/paymentApi'
import '../../styles/Admin.css'

export const AdminSettings: React.FC = () => {
  const { adminUser, adminLogout } = useAdmin()
  const [rzpStatus, setRzpStatus] = useState<RazorpayConfigCheckResult | null>(null)
  const [isTestingRzp, setIsTestingRzp] = useState(false)

  const runRazorpayCheck = async () => {
    setIsTestingRzp(true)
    try {
      const res = await checkRazorpayConfig()
      setRzpStatus(res)
    } catch (err: any) {
      setRzpStatus({
        success: false,
        configured: false,
        authenticated: false,
        message: 'Could not contact server check-config endpoint.',
        error: err.message || 'Network request failed',
      })
    } finally {
      setIsTestingRzp(false)
    }
  }

  // Auto-run connection check on initial view
  useEffect(() => {
    runRazorpayCheck()
  }, [])

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

        {/* Razorpay Payment Gateway Diagnostics Card */}
        <section
          style={{
            backgroundColor: 'var(--admin-card-bg, #1a1a1a)',
            border: '1px solid var(--admin-border, #2a2a2a)',
            borderRadius: '12px',
            padding: '2rem',
          }}
          aria-labelledby="payment-gateway-heading"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <h2
                  id="payment-gateway-heading"
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    margin: 0,
                  }}
                >
                  Payment Gateway Live Diagnostics
                </h2>
                {rzpStatus && (
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: rzpStatus.authenticated ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: rzpStatus.authenticated ? '#10b981' : '#ef4444',
                      border: `1px solid ${rzpStatus.authenticated ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {rzpStatus.authenticated ? `ONLINE (${rzpStatus.mode?.toUpperCase() || 'ACTIVE'})` : 'AUTHENTICATION FAILED'}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>
                Test your backend server's direct connection to Razorpay API without making test payments.
              </p>
            </div>

            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={runRazorpayCheck}
              disabled={isTestingRzp}
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
            >
              {isTestingRzp ? 'Testing Connection...' : 'Verify Razorpay Keys'}
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              padding: '1.25rem',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '8px',
              border: '1px solid var(--admin-border, #2a2a2a)',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <span style={{ display: 'block', fontSize: '0.78rem', color: '#888', marginBottom: '0.25rem' }}>
                Active Server Key ID
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f0f0f0', fontFamily: 'monospace' }}>
                {rzpStatus?.key_id_masked || (isTestingRzp ? 'Querying...' : 'Click Verify')}
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.78rem', color: '#888', marginBottom: '0.25rem' }}>
                Gateway Mode
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: rzpStatus?.mode === 'live' ? '#10b981' : '#f59e0b', textTransform: 'uppercase' }}>
                {rzpStatus?.mode || '—'}
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.78rem', color: '#888', marginBottom: '0.25rem' }}>
                Authentication State
              </span>
              <span
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: rzpStatus?.authenticated ? '#10b981' : rzpStatus ? '#ef4444' : '#888',
                }}
              >
                {rzpStatus?.authenticated ? 'Authenticated & Ready' : rzpStatus ? 'Rejected by Razorpay' : 'Unchecked'}
              </span>
            </div>
          </div>

          {rzpStatus && (
            <div
              style={{
                padding: '1rem 1.25rem',
                borderRadius: '8px',
                backgroundColor: rzpStatus.authenticated ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${rzpStatus.authenticated ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                fontSize: '0.88rem',
                lineHeight: 1.5,
                color: rzpStatus.authenticated ? '#34d399' : '#fca5a5',
              }}
            >
              <strong>{rzpStatus.authenticated ? 'Success: ' : 'Notice: '}</strong>
              {rzpStatus.message}
              {rzpStatus.error && (
                <div style={{ marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '0.8rem', color: '#f87171' }}>
                  Details: {rzpStatus.error}
                </div>
              )}
            </div>
          )}

          {rzpStatus && !rzpStatus.authenticated && (
            <div
              style={{
                marginTop: '1.25rem',
                padding: '1.25rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(217, 71, 0, 0.08)',
                border: '1px solid rgba(217, 71, 0, 0.25)',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: '#e5e7eb',
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#ff6b2b', fontSize: '0.92rem', fontWeight: 700 }}>
                How to Fix in Your Live Cloud Hosting (Render / Railway / Vercel):
              </h4>
              <ol style={{ margin: '0', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>Log in to your backend host dashboard (e.g. <strong>dashboard.render.com</strong> or <strong>railway.app</strong>).</li>
                <li>Go to your backend service &rarr; <strong>Environment</strong> or <strong>Variables</strong> tab.</li>
                <li>
                  Verify <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> match the pair generated together in Razorpay Dashboard.
                </li>
                <li>
                  Ensure there are <strong>NO quotes</strong> (do not put <code>"</code> or <code>'</code> around the keys) and no leading/trailing spaces.
                </li>
                <li>Trigger a <strong>Manual Deploy &rarr; Clear build cache & deploy</strong> to ensure the new environment variables take effect.</li>
              </ol>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminSettings
