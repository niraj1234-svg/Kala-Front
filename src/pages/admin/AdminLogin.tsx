import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../../context/AdminContext'
import '../../styles/Admin.css'

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate()
  const { adminLogin, isAdminAuthenticated, isAdminLoading } = useAdmin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect to /admin if already authenticated
  useEffect(() => {
    if (isAdminAuthenticated && !isAdminLoading) {
      navigate('/admin', { replace: true })
    }
  }, [isAdminAuthenticated, isAdminLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const cleanEmail = email.trim()
    if (!cleanEmail) {
      setErrorMessage('Please enter your administrator email address.')
      return
    }

    if (!password) {
      setErrorMessage('Please enter your administrator password.')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await adminLogin(cleanEmail, password)
      if (result.success) {
        navigate('/admin', { replace: true })
      } else {
        setErrorMessage(result.error || 'Invalid credentials or administrative privileges.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to log in. Please try again.'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <span className="admin-login-logo">KALA</span>
          <span className="admin-login-badge">Admin Portal</span>
        </div>

        {errorMessage && (
          <div className="admin-login-error" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
          <div className="admin-form-group">
            <label htmlFor="admin-email" className="admin-form-label">
              Admin Email
            </label>
            <input
              id="admin-email"
              type="email"
              className="admin-form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@kala.com"
              disabled={isSubmitting}
              autoComplete="email"
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="admin-password" className="admin-form-label">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              className="admin-form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isSubmitting}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="admin-login-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In to Admin'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
