import React, { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchMyOrders } from '../services/orderApi'
import type { BackendOrder } from '../services/orderApi'
import '../styles/Account.css'
import '../styles/OrderTracking.css'

export const Account: React.FC = () => {
  const { currentUser, isAuthenticated, isLoading, login, register, logout } = useAuth()
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(() => {
    return tabParam === 'register' ? 'register' : 'login'
  })

  useEffect(() => {
    if (tabParam === 'register' || tabParam === 'login') {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Register form state
  const [regFirstName, setRegFirstName] = useState('')
  const [regLastName, setRegLastName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false)
  const [regErrors, setRegErrors] = useState<Record<string, string>>({})
  const [isRegistering, setIsRegistering] = useState(false)

  // Live password criteria evaluation
  const passwordCriteria = {
    hasMinLength: regPassword.length >= 8,
    hasUpper: /[A-Z]/.test(regPassword),
    hasLower: /[a-z]/.test(regPassword),
    hasNumber: /[0-9]/.test(regPassword),
    hasSpecial: /[^a-zA-Z0-9]/.test(regPassword),
  }

  const criteriaMetCount = Object.values(passwordCriteria).filter(Boolean).length

  const getPasswordStrength = (): { label: string; score: number; className: string } => {
    if (!regPassword) return { label: 'Empty', score: 0, className: '' }
    if (criteriaMetCount <= 2) return { label: 'Weak', score: 25, className: 'weak' }
    if (criteriaMetCount <= 3) return { label: 'Fair', score: 50, className: 'fair' }
    if (criteriaMetCount <= 4) return { label: 'Good', score: 75, className: 'good' }
    return { label: 'Strong', score: 100, className: 'strong' }
  }

  const passwordStrength = getPasswordStrength()

  // Orders state
  const [orders, setOrders] = useState<BackendOrder[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  const loadOrders = useCallback(async () => {
    if (!isAuthenticated || !currentUser) return
    setIsLoadingOrders(true)
    setOrdersError(null)
    try {
      const data = await fetchMyOrders()
      setOrders(data)
    } catch (err: any) {
      setOrdersError(err.message || 'Unable to retrieve your orders. Please try again.')
    } finally {
      setIsLoadingOrders(false)
    }
  }, [isAuthenticated, currentUser])

  useEffect(() => {
    if (!isLoading && isAuthenticated && currentUser) {
      loadOrders()
    } else if (!isAuthenticated) {
      setOrders([])
    }
  }, [isLoading, isAuthenticated, currentUser, loadOrders])

  // Safe error mapping helper
  const mapErrorMessage = (rawError?: string, defaultMsg = 'An error occurred.'): string => {
    if (!rawError) return defaultMsg
    const lower = rawError.toLowerCase()
    if (lower.includes('failed to fetch') || lower.includes('fetch failed') || lower.includes('networkerror')) {
      return 'Unable to connect to KALA right now. Please make sure the server is running and try again.'
    }
    return rawError
  }

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Please enter both email and password.')
      return
    }

    setIsLoggingIn(true)
    try {
      const result = await login(loginEmail, loginPassword)
      if (!result.success) {
        setLoginError(mapErrorMessage(result.error, 'Invalid email or password.'))
      }
    } catch (err: any) {
      setLoginError(mapErrorMessage(err?.message, 'Invalid email or password.'))
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Handle Register submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}

    const trimmedFirstName = regFirstName.trim()
    const trimmedLastName = regLastName.trim()
    const trimmedEmail = regEmail.trim()
    const trimmedPhone = regPhone.trim()
    const nameRegex = /^[A-Za-z\s]+$/
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const phoneRegex = /^[6-9]\d{9}$/

    // 1. First Name (required, min 2 chars, letters & spaces only)
    if (!trimmedFirstName) {
      errors.firstName = 'First name is required.'
    } else if (trimmedFirstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters.'
    } else if (!nameRegex.test(trimmedFirstName)) {
      errors.firstName = 'First name can only contain letters and spaces.'
    }

    // 2. Last Name (required, min 2 chars, letters & spaces only)
    if (!trimmedLastName) {
      errors.lastName = 'Last name is required.'
    } else if (trimmedLastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters.'
    } else if (!nameRegex.test(trimmedLastName)) {
      errors.lastName = 'Last name can only contain letters and spaces.'
    }

    // 3. Email (required, valid format)
    if (!trimmedEmail) {
      errors.email = 'Email address is required.'
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.'
    }

    // 4. Phone (strictly 10 digits starting with 6, 7, 8, or 9; no +91, spaces, letters, or special chars)
    if (!trimmedPhone) {
      errors.phone = 'Phone number is required.'
    } else if (!phoneRegex.test(trimmedPhone)) {
      errors.phone = 'Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.'
    }

    // 5. Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character)
    if (!regPassword) {
      errors.password = 'Password is required.'
    } else if (regPassword.length < 8) {
      errors.password = 'Password must be at least 8 characters.'
    } else if (!/[A-Z]/.test(regPassword)) {
      errors.password = 'Password must contain at least one uppercase letter.'
    } else if (!/[a-z]/.test(regPassword)) {
      errors.password = 'Password must contain at least one lowercase letter.'
    } else if (!/[0-9]/.test(regPassword)) {
      errors.password = 'Password must contain at least one number.'
    } else if (!/[^a-zA-Z0-9]/.test(regPassword)) {
      errors.password = 'Password must contain at least one special character.'
    }

    // 6. Confirm Password (required, must match Password)
    if (!regConfirmPassword) {
      errors.confirmPassword = 'Please confirm your password.'
    } else if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match.'
    }

    setRegErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    setIsRegistering(true)
    try {
      const result = await register({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail.toLowerCase(),
        phone: trimmedPhone,
        password: regPassword,
      })

      if (!result.success) {
        setRegErrors({ banner: mapErrorMessage(result.error, 'Registration failed.') })
      }
    } catch (err: any) {
      setRegErrors({ banner: mapErrorMessage(err?.message, 'Registration failed.') })
    } finally {
      setIsRegistering(false)
    }
  }

  // Initial session hydration loading state
  if (isLoading) {
    return (
      <main className="kala-container kala-account-page" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="kala-body" style={{ color: 'var(--kala-text-secondary)', letterSpacing: '0.1em' }}>LOADING ACCOUNT...</p>
      </main>
    )
  }

  // --------------------------------------------------------------------------
  // RENDER: NOT AUTHENTICATED (LOGIN / REGISTER VIEW)
  // --------------------------------------------------------------------------
  if (!isAuthenticated || !currentUser) {
    return (
      <main className="kala-container kala-account-page">
        <div className="kala-auth-card">
          <div className="kala-auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'login'}
              className={`kala-auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('login')
                setLoginError('')
                setRegErrors({})
              }}
            >
              LOGIN
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'register'}
              className={`kala-auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('register')
                setLoginError('')
                setRegErrors({})
              }}
            >
              CREATE ACCOUNT
            </button>
          </div>

          {activeTab === 'login' ? (
            <div>
              <h1 className="kala-auth-title">Welcome Back</h1>
              <p className="kala-auth-desc">Sign in to view your orders and account details.</p>

              {loginError && (
                <div className="kala-auth-banner-error" role="alert">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} noValidate className="kala-auth-form">
                <div className="kala-form-group">
                  <label htmlFor="loginEmail" className="kala-form-label">
                    Email Address *
                  </label>
                  <input
                    id="loginEmail"
                    type="email"
                    className="kala-form-input"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div className="kala-form-group">
                  <label htmlFor="loginPassword" className="kala-form-label">
                    Password *
                  </label>
                  <input
                    id="loginPassword"
                    type="password"
                    className="kala-form-input"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  className="kala-btn kala-btn-primary kala-auth-submit-btn"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? 'LOGGING IN...' : 'LOG IN'}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <h1 className="kala-auth-title">Create Account</h1>
              <p className="kala-auth-desc">Join KALA for personalized orders and saved items.</p>

              {regErrors.banner && (
                <div className="kala-auth-banner-error" role="alert">
                  <span>{regErrors.banner} </span>
                  {regErrors.banner.includes('already exists') && (
                    <button
                      type="button"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--kala-orange)',
                        fontWeight: 700,
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        marginLeft: '0.5rem',
                      }}
                      onClick={() => setActiveTab('login')}
                    >
                      Log in here
                    </button>
                  )}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} noValidate className="kala-auth-form">
                <div className="kala-form-grid two-col">
                  <div className="kala-form-group">
                    <label htmlFor="regFirstName" className="kala-form-label">
                      First Name *
                    </label>
                    <input
                      id="regFirstName"
                      type="text"
                      className={`kala-form-input ${regErrors.firstName ? 'error' : ''}`}
                      value={regFirstName}
                      onChange={(e) => {
                        setRegFirstName(e.target.value)
                        if (regErrors.firstName) setRegErrors((prev) => ({ ...prev, firstName: '' }))
                      }}
                    />
                    {regErrors.firstName && (
                      <span className="kala-form-error">{regErrors.firstName}</span>
                    )}
                  </div>

                  <div className="kala-form-group">
                    <label htmlFor="regLastName" className="kala-form-label">
                      Last Name *
                    </label>
                    <input
                      id="regLastName"
                      type="text"
                      className={`kala-form-input ${regErrors.lastName ? 'error' : ''}`}
                      value={regLastName}
                      onChange={(e) => {
                        setRegLastName(e.target.value)
                        if (regErrors.lastName) setRegErrors((prev) => ({ ...prev, lastName: '' }))
                      }}
                    />
                    {regErrors.lastName && (
                      <span className="kala-form-error">{regErrors.lastName}</span>
                    )}
                  </div>
                </div>

                <div className="kala-form-group">
                  <label htmlFor="regEmail" className="kala-form-label">
                    Email Address *
                  </label>
                  <input
                    id="regEmail"
                    type="email"
                    className={`kala-form-input ${regErrors.email ? 'error' : ''}`}
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value)
                      if (regErrors.email) setRegErrors((prev) => ({ ...prev, email: '' }))
                    }}
                  />
                  {regErrors.email && (
                    <span className="kala-form-error">{regErrors.email}</span>
                  )}
                </div>

                <div className="kala-form-group">
                  <label htmlFor="regPhone" className="kala-form-label">
                    Phone Number (10 Digits) *
                  </label>
                  <input
                    id="regPhone"
                    type="tel"
                    placeholder="e.g. 9876543210 (10 digits)"
                    className={`kala-form-input ${regErrors.phone ? 'error' : ''}`}
                    value={regPhone}
                    onChange={(e) => {
                      setRegPhone(e.target.value)
                      if (regErrors.phone) setRegErrors((prev) => ({ ...prev, phone: '' }))
                    }}
                  />
                  {regErrors.phone && (
                    <span className="kala-form-error">{regErrors.phone}</span>
                  )}
                </div>

                <div className="kala-form-group">
                  <label htmlFor="regPassword" className="kala-form-label">
                    Password (min 8 chars) *
                  </label>
                  <div className="kala-password-input-wrap">
                    <input
                      id="regPassword"
                      type={showRegPassword ? 'text' : 'password'}
                      className={`kala-form-input ${regErrors.password ? 'error' : ''}`}
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value)
                        if (regErrors.password) setRegErrors((prev) => ({ ...prev, password: '' }))
                      }}
                    />
                    <button
                      type="button"
                      className="kala-password-toggle-btn"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {regPassword && (
                    <div className="kala-password-strength" aria-live="polite">
                      <div className="kala-strength-header">
                        <span className="kala-strength-title">Password Strength</span>
                        <span className={`kala-strength-badge ${passwordStrength.className}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="kala-strength-track">
                        <div
                          className={`kala-strength-bar ${passwordStrength.className}`}
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                      <div className="kala-strength-criteria">
                        <div className={`kala-criterion-item ${passwordCriteria.hasMinLength ? 'valid' : ''}`}>
                          <span className="kala-criterion-icon">{passwordCriteria.hasMinLength ? '✓' : '○'}</span>
                          <span>8+ characters</span>
                        </div>
                        <div className={`kala-criterion-item ${passwordCriteria.hasUpper ? 'valid' : ''}`}>
                          <span className="kala-criterion-icon">{passwordCriteria.hasUpper ? '✓' : '○'}</span>
                          <span>Uppercase letter (A-Z)</span>
                        </div>
                        <div className={`kala-criterion-item ${passwordCriteria.hasLower ? 'valid' : ''}`}>
                          <span className="kala-criterion-icon">{passwordCriteria.hasLower ? '✓' : '○'}</span>
                          <span>Lowercase letter (a-z)</span>
                        </div>
                        <div className={`kala-criterion-item ${passwordCriteria.hasNumber ? 'valid' : ''}`}>
                          <span className="kala-criterion-icon">{passwordCriteria.hasNumber ? '✓' : '○'}</span>
                          <span>Number (0-9)</span>
                        </div>
                        <div className={`kala-criterion-item ${passwordCriteria.hasSpecial ? 'valid' : ''}`}>
                          <span className="kala-criterion-icon">{passwordCriteria.hasSpecial ? '✓' : '○'}</span>
                          <span>Special character (!@#$)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {regErrors.password && (
                    <span className="kala-form-error">{regErrors.password}</span>
                  )}
                </div>

                <div className="kala-form-group">
                  <label htmlFor="regConfirmPassword" className="kala-form-label">
                    Confirm Password *
                  </label>
                  <div className="kala-password-input-wrap">
                    <input
                      id="regConfirmPassword"
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      className={`kala-form-input ${regErrors.confirmPassword ? 'error' : ''}`}
                      value={regConfirmPassword}
                      onChange={(e) => {
                        setRegConfirmPassword(e.target.value)
                        if (regErrors.confirmPassword) setRegErrors((prev) => ({ ...prev, confirmPassword: '' }))
                      }}
                    />
                    <button
                      type="button"
                      className="kala-password-toggle-btn"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      aria-label={showRegConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showRegConfirmPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {regErrors.confirmPassword && (
                    <span className="kala-form-error">{regErrors.confirmPassword}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="kala-btn kala-btn-primary kala-auth-submit-btn"
                  disabled={isRegistering}
                >
                  {isRegistering ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    )
  }

  // --------------------------------------------------------------------------
  // RENDER: AUTHENTICATED (MY ACCOUNT VIEW)
  // --------------------------------------------------------------------------
  return (
    <main className="kala-container kala-account-page">
      <header className="kala-account-header">
        <div>
          <p className="kala-label" style={{ color: 'var(--kala-orange)', marginBottom: '0.25rem' }}>
            CUSTOMER DASHBOARD
          </p>
          <h1 className="kala-h1" style={{ margin: 0 }}>
            MY ACCOUNT
          </h1>
        </div>
        <button
          type="button"
          className="kala-logout-btn"
          onClick={logout}
        >
          LOGOUT
        </button>
      </header>

      {/* Customer Information Card */}
      <section className="kala-profile-card" aria-labelledby="profile-title">
        <h2 id="profile-title" className="kala-profile-title">
          CUSTOMER INFORMATION
        </h2>
        <div className="kala-profile-grid">
          <div>
            <div className="kala-profile-item-label">Name</div>
            <div className="kala-profile-item-val">
              {currentUser.firstName} {currentUser.lastName}
            </div>
          </div>
          <div>
            <div className="kala-profile-item-label">Email</div>
            <div className="kala-profile-item-val">{currentUser.email}</div>
          </div>
          <div>
            <div className="kala-profile-item-label">Phone</div>
            <div className="kala-profile-item-val">+91 {currentUser.phone}</div>
          </div>
        </div>
      </section>

      {/* Customer Orders Section */}
      <section aria-labelledby="orders-title">
        <h2 id="orders-title" className="kala-orders-section-title">
          MY ORDERS {isLoadingOrders ? '' : `(${orders.length})`}
        </h2>

        {isLoadingOrders ? (
          <div className="kala-orders-empty" style={{ minHeight: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p className="kala-body" style={{ color: 'var(--kala-text-secondary)', letterSpacing: '0.08em' }}>
              LOADING YOUR ORDERS...
            </p>
          </div>
        ) : ordersError ? (
          <div className="kala-auth-banner-error" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{ordersError}</span>
            <button
              type="button"
              onClick={loadOrders}
              style={{
                background: 'transparent',
                border: '1px solid currentColor',
                color: 'inherit',
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.8rem',
              }}
            >
              RETRY
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="kala-orders-empty">
            <h3 className="kala-orders-empty-title">NO ORDERS YET</h3>
            <p className="kala-orders-empty-desc">
              You haven't placed any orders with this account yet.
            </p>
            <Link to="/shop" className="kala-btn kala-btn-primary">
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div className="kala-orders-list" role="list">
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
              const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0)
              const orderTotal = order.pricing?.total ?? 0

              return (
                <article
                  key={order.orderId}
                  className="kala-order-summary-card"
                  role="listitem"
                >
                  <div className="kala-order-summary-header">
                    <div className="kala-order-summary-id">
                      Order ID: <strong>{order.orderId}</strong>
                    </div>
                    <div className="kala-order-summary-date">{formattedDate}</div>
                  </div>

                  <div className="kala-order-summary-body">
                    <div>
                      <div style={{ marginBottom: '0.4rem' }}>
                        <span
                          className={`kala-status-badge ${(order.status || 'pending').toLowerCase()}`}
                          style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }}
                        >
                          Status: {order.status === 'pending'
                            ? 'Pending'
                            : order.status === 'confirmed'
                            ? 'Confirmed'
                            : order.status === 'processing'
                            ? 'Processing'
                            : order.status === 'shipped'
                            ? 'Shipped'
                            : order.status === 'delivered'
                            ? 'Delivered'
                            : order.status === 'cancelled'
                            ? 'Cancelled'
                            : order.status}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--kala-text-secondary)',
                          marginTop: '0.25rem',
                        }}
                      >
                        {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div className="kala-order-summary-total">
                        ₹{orderTotal.toLocaleString('en-IN')}
                      </div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <Link
                          to={`/account/orders/${order.orderId}`}
                          className="kala-btn kala-btn-secondary kala-order-view-btn"
                        >
                          VIEW ORDER
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

export default Account
