import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, isAuthenticated, login, register, logout } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    const res = await login(email, password)
    setLoading(false)
    if (res.success) {
      onClose()
    } else {
      setErrorMsg(res.error || 'Invalid email or password.')
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    const [first = '', ...rest] = name.trim().split(/\s+/)
    const firstName = first || 'Valued'
    const lastName = rest.join(' ') || 'Customer'

    const res = await register({
      email,
      password,
      firstName,
      lastName,
      phone: phone || '0000000000',
    })
    setLoading(false)
    if (res.success) {
      onClose()
    } else {
      setErrorMsg(res.error || 'Failed to create account.')
    }
  }

  const userDisplayName = currentUser ? ([currentUser.firstName, currentUser.lastName].filter(Boolean).join(' ') || currentUser.email) : ''

  return (
    <div className="kala-bulk-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="kala-bulk-modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="kala-bulk-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        {isAuthenticated && currentUser ? (
          <div className="kala-bulk-modal-logged-in">
            <div className="kala-bulk-modal-avatar">
              {currentUser.firstName ? currentUser.firstName[0].toUpperCase() : (currentUser.email ? currentUser.email[0].toUpperCase() : 'U')}
            </div>
            <h3 className="kala-bulk-modal-title">Welcome, {userDisplayName}</h3>
            <p className="kala-bulk-modal-subtitle">
              Your bulk customizations and orders are safely linked to your KALA account.
            </p>
            <div className="kala-bulk-modal-actions">
              <button
                type="button"
                className="kala-bulk-modal-btn primary"
                onClick={onClose}
              >
                Continue Customizing
              </button>
              <button
                type="button"
                className="kala-bulk-modal-btn outline"
                onClick={() => {
                  logout()
                  onClose()
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="kala-bulk-modal-auth">
            <div className="kala-bulk-modal-tabs">
              <button
                type="button"
                className={`kala-bulk-modal-tab ${tab === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setTab('login')
                  setErrorMsg(null)
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`kala-bulk-modal-tab ${tab === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setTab('register')
                  setErrorMsg(null)
                }}
              >
                Create Account
              </button>
            </div>

            <p className="kala-bulk-modal-auth-desc">
              Save your custom apparel designs and track bulk orders anytime.
            </p>

            {errorMsg && (
              <div className="kala-bulk-modal-error">
                {errorMsg}
              </div>
            )}

            {tab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="kala-bulk-modal-form">
                <div className="kala-bulk-form-group">
                  <label htmlFor="bulk-auth-email">Email Address</label>
                  <input
                    id="bulk-auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                  />
                </div>
                <div className="kala-bulk-form-group">
                  <label htmlFor="bulk-auth-password">Password</label>
                  <input
                    id="bulk-auth-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="kala-bulk-modal-submit"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="kala-bulk-modal-form">
                <div className="kala-bulk-form-group">
                  <label htmlFor="bulk-reg-name">Full Name</label>
                  <input
                    id="bulk-reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Niraj Kumar"
                  />
                </div>
                <div className="kala-bulk-form-group">
                  <label htmlFor="bulk-reg-email">Email Address</label>
                  <input
                    id="bulk-reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                  />
                </div>
                <div className="kala-bulk-form-group">
                  <label htmlFor="bulk-reg-phone">Phone Number</label>
                  <input
                    id="bulk-reg-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="kala-bulk-form-group">
                  <label htmlFor="bulk-reg-password">Password</label>
                  <input
                    id="bulk-reg-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="kala-bulk-modal-submit"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountModal
