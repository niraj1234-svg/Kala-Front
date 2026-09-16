import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSavedOrders } from '../types/order'
import type { Order } from '../types/order'
import '../styles/Account.css'

export const Account: React.FC = () => {
  const { currentUser, isAuthenticated, login, register, logout } = useAuth()

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Register form state
  const [regFirstName, setRegFirstName] = useState('')
  const [regLastName, setRegLastName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [regErrors, setRegErrors] = useState<Record<string, string>>({})

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Please enter both email and password.')
      return
    }

    const result = login(loginEmail, loginPassword)
    if (!result.success) {
      setLoginError(result.error || 'Invalid email or password.')
    }
  }

  // Handle Register submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}

    // 1. First Name
    if (!regFirstName.trim()) {
      errors.firstName = 'First name is required.'
    }

    // 2. Last Name
    if (!regLastName.trim()) {
      errors.lastName = 'Last name is required.'
    }

    // 3. Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regEmail.trim()) {
      errors.email = 'Email is required.'
    } else if (!emailRegex.test(regEmail.trim())) {
      errors.email = 'Please enter a valid email address.'
    }

    // 4. Phone (10-digit Indian format)
    const cleanPhone = regPhone.replace(/[\s-+]/g, '')
    const phoneRegex = /^[6-9]\d{9}$/
    if (!regPhone.trim()) {
      errors.phone = 'Phone number is required.'
    } else if (!phoneRegex.test(cleanPhone)) {
      errors.phone = 'Please enter a valid 10-digit Indian phone number.'
    }

    // 5. Password
    if (!regPassword) {
      errors.password = 'Password is required.'
    } else if (regPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters.'
    }

    // 6. Confirm Password
    if (!regConfirmPassword) {
      errors.confirmPassword = 'Please confirm your password.'
    } else if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match.'
    }

    setRegErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    const result = register({
      firstName: regFirstName,
      lastName: regLastName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
    })

    if (!result.success) {
      setRegErrors({ banner: result.error || 'Registration failed.' })
    }
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

                <button type="submit" className="kala-btn kala-btn-primary kala-auth-submit-btn">
                  LOG IN
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
                      onChange={(e) => setRegFirstName(e.target.value)}
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
                      onChange={(e) => setRegLastName(e.target.value)}
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
                    onChange={(e) => setRegEmail(e.target.value)}
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
                    placeholder="e.g. 9876543210"
                    className={`kala-form-input ${regErrors.phone ? 'error' : ''}`}
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                  />
                  {regErrors.phone && (
                    <span className="kala-form-error">{regErrors.phone}</span>
                  )}
                </div>

                <div className="kala-form-grid two-col">
                  <div className="kala-form-group">
                    <label htmlFor="regPassword" className="kala-form-label">
                      Password (min 6 chars) *
                    </label>
                    <input
                      id="regPassword"
                      type="password"
                      className={`kala-form-input ${regErrors.password ? 'error' : ''}`}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                    {regErrors.password && (
                      <span className="kala-form-error">{regErrors.password}</span>
                    )}
                  </div>

                  <div className="kala-form-group">
                    <label htmlFor="regConfirmPassword" className="kala-form-label">
                      Confirm Password *
                    </label>
                    <input
                      id="regConfirmPassword"
                      type="password"
                      className={`kala-form-input ${regErrors.confirmPassword ? 'error' : ''}`}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                    />
                    {regErrors.confirmPassword && (
                      <span className="kala-form-error">{regErrors.confirmPassword}</span>
                    )}
                  </div>
                </div>

                <button type="submit" className="kala-btn kala-btn-primary kala-auth-submit-btn">
                  CREATE ACCOUNT
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
  const allOrders: Order[] = getSavedOrders()
  // Filter orders by current user's email
  const userOrders = allOrders.filter(
    (order) => order.customer.email.toLowerCase() === currentUser.email.toLowerCase()
  )

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
          MY ORDERS ({userOrders.length})
        </h2>

        {userOrders.length === 0 ? (
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
            {userOrders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
              const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0)

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
                      <div className="kala-order-summary-status">
                        ● {order.status === 'confirmed' ? 'Order Placed' : order.status}
                      </div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--kala-text-secondary)',
                          marginTop: '0.35rem',
                        }}
                      >
                        {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div className="kala-order-summary-total">
                        ₹{order.total.toLocaleString('en-IN')}
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
