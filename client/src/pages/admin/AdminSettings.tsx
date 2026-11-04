import React, { useState, useEffect } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { checkRazorpayConfig, type RazorpayConfigCheckResult } from '../../services/paymentApi'
import {
  fetchPlatformSettings,
  updatePlatformCommission,
  fetchAllPayouts,
  updatePayoutStatusApi,
} from '../../services/adminVendorApi'
import '../../styles/Admin.css'

export const AdminSettings: React.FC = () => {
  const { adminUser, adminLogout } = useAdmin()
  const [rzpStatus, setRzpStatus] = useState<RazorpayConfigCheckResult | null>(null)
  const [isTestingRzp, setIsTestingRzp] = useState(false)

  // Platform Commission
  const [commissionRate, setCommissionRate] = useState<number>(5)
  const [isUpdatingCommission, setIsUpdatingCommission] = useState<boolean>(false)
  const [commissionSuccess, setCommissionSuccess] = useState<string | null>(null)

  // Vendor Payouts Moderation
  const [allPayouts, setAllPayouts] = useState<any[]>([])
  const [isLoadingPayouts, setIsLoadingPayouts] = useState<boolean>(false)
  const [payoutFeedback, setPayoutFeedback] = useState<string | null>(null)

  const loadPlatformSettings = async () => {
    try {
      const res = await fetchPlatformSettings()
      if (res.settings?.commissionRate !== undefined) {
        setCommissionRate(res.settings.commissionRate)
      }
    } catch (err) {
      console.warn('Failed to load platform settings:', err)
    }
  }

  const loadPayouts = async () => {
    setIsLoadingPayouts(true)
    try {
      const res = await fetchAllPayouts()
      setAllPayouts(res.payouts || [])
    } catch (err) {
      console.warn('Failed to load payouts:', err)
    } finally {
      setIsLoadingPayouts(false)
    }
  }

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingCommission(true)
    setCommissionSuccess(null)
    try {
      const res = await updatePlatformCommission(commissionRate)
      setCommissionSuccess(res.message || 'Marketplace commission rate updated successfully.')
    } catch (err: any) {
      alert(err.message || 'Failed to update commission rate.')
    } finally {
      setIsUpdatingCommission(false)
    }
  }

  const handleUpdatePayoutStatus = async (id: string, status: 'PAID' | 'REJECTED') => {
    let referenceNumber: string | undefined
    let notes: string | undefined

    if (status === 'PAID') {
      const promptRef = window.prompt('Enter Bank UTR / Transaction Reference Number:', `UTR-${Date.now().toString().slice(-6)}`)
      if (!promptRef) return
      referenceNumber = promptRef
    } else {
      const promptNotes = window.prompt('Enter reason for rejecting this payout request:')
      if (!promptNotes) return
      notes = promptNotes
    }

    try {
      const res = await updatePayoutStatusApi(id, { status, referenceNumber, notes })
      setPayoutFeedback(res.message || `Payout marked as ${status}.`)
      loadPayouts()
    } catch (err: any) {
      alert(err.message || 'Failed to update payout status.')
    }
  }

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

  // Auto-run connection check & load platform settings on initial view
  useEffect(() => {
    runRazorpayCheck()
    loadPlatformSettings()
    loadPayouts()
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

        {/* 4. Platform Marketplace Commission Configuration Card */}
        <section
          style={{
            backgroundColor: 'var(--admin-card-bg, #1a1a1a)',
            border: '1px solid var(--admin-border, #2a2a2a)',
            borderRadius: '12px',
            padding: '2rem',
          }}
          aria-labelledby="commission-settings-heading"
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <h2
              id="commission-settings-heading"
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '0.25rem',
              }}
            >
              Marketplace Commission & Fees
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>
              Set the global percentage fee automatically deducted from vendor product orders upon checkout.
            </p>
          </div>

          {commissionSuccess && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.88rem',
                fontWeight: 600,
              }}
            >
              ✓ {commissionSuccess}
            </div>
          )}

          <form onSubmit={handleSaveCommission} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '220px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#AAA', marginBottom: '0.4rem', fontWeight: 600 }}>
                Platform Commission Rate (%)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  className="admin-search-input"
                  style={{ width: '100%', paddingRight: '2rem', fontSize: '1.1rem', fontWeight: 700 }}
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  required
                />
                <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#888', fontWeight: 700 }}>
                  %
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={isUpdatingCommission}
              style={{ height: '42px', padding: '0 1.5rem' }}
            >
              {isUpdatingCommission ? 'Saving...' : 'Update Commission Rate'}
            </button>
          </form>

          <p style={{ fontSize: '0.78rem', color: '#777', marginTop: '0.75rem' }}>
            Example: On a ₹1,000 product sale at {commissionRate}%, the platform fee is ₹{(1000 * commissionRate) / 100} and the vendor net earnings are ₹{1000 - (1000 * commissionRate) / 100}.
          </p>
        </section>

        {/* 5. Vendor Settlement Payout Moderation Card */}
        <section
          style={{
            backgroundColor: 'var(--admin-card-bg, #1a1a1a)',
            border: '1px solid var(--admin-border, #2a2a2a)',
            borderRadius: '12px',
            padding: '2rem',
          }}
          aria-labelledby="payout-moderation-heading"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h2
                id="payout-moderation-heading"
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: '0.25rem',
                }}
              >
                Vendor Payout Moderation
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>
                Review and approve vendor earnings settlements across India
              </p>
            </div>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={loadPayouts}
              disabled={isLoadingPayouts}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
            >
              {isLoadingPayouts ? 'Refreshing...' : '↻ Refresh'}
            </button>
          </div>

          {payoutFeedback && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.88rem',
              }}
            >
              {payoutFeedback}
            </div>
          )}

          {allPayouts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#888' }}>
              <p>No vendor payout requests submitted yet.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper" style={{ margin: 0 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Vendor / Shop</th>
                    <th>Requested At</th>
                    <th>Amount</th>
                    <th>Bank / UPI Account</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allPayouts.map((pay) => (
                    <tr key={pay.id || pay._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#FFF' }}>
                          {pay.vendorProfile?.businessName || pay.shop?.shopName || 'Vendor'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>
                          ID: {pay.vendorId}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>
                        {new Date(pay.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td style={{ fontWeight: 800, color: '#10b981', fontSize: '1rem' }}>
                        ₹{pay.amount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>
                        {pay.bankDetails?.accountHolderName && (
                          <div style={{ color: '#EEE' }}>{pay.bankDetails.accountHolderName}</div>
                        )}
                        {pay.bankDetails?.accountNumber && (
                          <div style={{ color: '#AAA', fontFamily: 'monospace' }}>
                            A/C: {pay.bankDetails.accountNumber} ({pay.bankDetails.ifscCode})
                          </div>
                        )}
                        {pay.bankDetails?.upiId && (
                          <div style={{ color: '#D94700' }}>UPI: {pay.bankDetails.upiId}</div>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge-status ${
                            pay.status === 'PAID'
                              ? 'badge-status-approved'
                              : pay.status === 'PROCESSING' || pay.status === 'PENDING'
                              ? 'badge-status-pending'
                              : 'badge-status-rejected'
                          }`}
                        >
                          {pay.status}
                        </span>
                        {pay.referenceNumber && (
                          <div style={{ fontSize: '0.72rem', color: '#888', marginTop: '0.2rem' }}>
                            Ref: {pay.referenceNumber}
                          </div>
                        )}
                      </td>
                      <td className="text-right">
                        {pay.status === 'PENDING' || pay.status === 'PROCESSING' ? (
                          <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="admin-btn admin-btn-primary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                              onClick={() => handleUpdatePayoutStatus(pay.id || pay._id, 'PAID')}
                            >
                              ✓ Mark Paid
                            </button>
                            <button
                              type="button"
                              className="admin-btn admin-btn-danger"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                              onClick={() => handleUpdatePayoutStatus(pay.id || pay._id, 'REJECTED')}
                            >
                              ✕ Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#777' }}>Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminSettings
