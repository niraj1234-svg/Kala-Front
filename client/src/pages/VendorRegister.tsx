import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerVendor, type VendorRegisterPayload } from '../services/vendorApi'
import { setAuthToken } from '../services/authApi'
import '../styles/Vendor.css'

const BUSINESS_CATEGORIES = [
  'Manufacturer',
  'Wholesaler',
  'Retailer',
  'Clothing Brand',
  'Printing Business',
  'Supplier',
  'Accessories',
  'Merchandise Business',
  'Other',
]

export const VendorRegister: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<VendorRegisterPayload>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    businessName: '',
    category: 'Clothing Brand',
    description: '',
    businessEmail: '',
    businessPhone: '',
    city: '',
    state: '',
    address: '',
  })

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<boolean>(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please provide your full name, email, and password.')
      return
    }

    if (!formData.businessName || !formData.city || !formData.state) {
      setError('Please provide your business name, city, and state.')
      return
    }

    setLoading(true)
    try {
      const res = await registerVendor(formData)
      if (res.token) {
        setAuthToken(res.token)
      }
      setSubmitted(true)
    } catch (err: any) {
      console.error('Registration failed:', err)
      setError(err.message || 'Unable to submit vendor application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="vendor-register-page">
        <div className="vendor-register-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#D1FAE5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Application Submitted!
          </h2>
          <p style={{ color: '#5F6368', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Thank you for applying to sell on KALA Marketplace. Your application is currently{' '}
            <strong style={{ color: '#92400E' }}>PENDING</strong> administrator review. Once approved, you
            will unlock full access to publish your storefront and upload products.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="marketplace-btn-primary"
              onClick={() => navigate('/vendor/dashboard')}
            >
              Go to Vendor Dashboard
            </button>
            <Link to="/shop" className="marketplace-btn-secondary" style={{ color: '#111', borderColor: '#111' }}>
              Explore Shop
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="vendor-register-page">
      <div className="vendor-register-card">
        <div className="vendor-register-header">
          <span className="vendor-register-badge">Seller Onboarding</span>
          <h1>Become a KALA Vendor</h1>
          <p>
            Connect with thousands of custom apparel buyers and independent brand seekers.
            Register your business today.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.9rem 1.25rem',
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              borderRadius: '6px',
              marginBottom: '1.75rem',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* SECTION 1: PERSONAL CREDENTIALS */}
          <div className="vendor-form-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Account & Contact Details
          </div>

          <div className="vendor-form-grid">
            <div className="vendor-form-group">
              <label className="vendor-form-label">
                Full Name <span>*</span>
              </label>
              <input
                type="text"
                name="fullName"
                className="vendor-form-input"
                placeholder="e.g. Ramesh Kumar"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="vendor-form-group">
              <label className="vendor-form-label">
                Personal / Login Email <span>*</span>
              </label>
              <input
                type="email"
                name="email"
                className="vendor-form-input"
                placeholder="name@business.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="vendor-form-group">
              <label className="vendor-form-label">
                Mobile Number <span>*</span>
              </label>
              <input
                type="tel"
                name="phone"
                className="vendor-form-input"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="vendor-form-group">
              <label className="vendor-form-label">
                Password <span>*</span>
              </label>
              <input
                type="password"
                name="password"
                className="vendor-form-input"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* SECTION 2: BUSINESS INFORMATION */}
          <div className="vendor-form-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            Business & Company Information
          </div>

          <div className="vendor-form-grid">
            <div className="vendor-form-group">
              <label className="vendor-form-label">
                Business Name <span>*</span>
              </label>
              <input
                type="text"
                name="businessName"
                className="vendor-form-input"
                placeholder="e.g. Apex Streetwear Studio"
                value={formData.businessName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="vendor-form-group">
              <label className="vendor-form-label">
                Business Category <span>*</span>
              </label>
              <select
                name="category"
                className="vendor-form-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {BUSINESS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="vendor-form-group">
              <label className="vendor-form-label">Business Email</label>
              <input
                type="email"
                name="businessEmail"
                className="vendor-form-input"
                placeholder="contact@apexstudio.in"
                value={formData.businessEmail}
                onChange={handleChange}
              />
            </div>

            <div className="vendor-form-group">
              <label className="vendor-form-label">Business Phone</label>
              <input
                type="tel"
                name="businessPhone"
                className="vendor-form-input"
                placeholder="Office contact number"
                value={formData.businessPhone}
                onChange={handleChange}
              />
            </div>

            <div className="vendor-form-group">
              <label className="vendor-form-label">
                City <span>*</span>
              </label>
              <input
                type="text"
                name="city"
                className="vendor-form-input"
                placeholder="e.g. Surat, Tirupur, Delhi"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="vendor-form-group">
              <label className="vendor-form-label">
                State <span>*</span>
              </label>
              <input
                type="text"
                name="state"
                className="vendor-form-input"
                placeholder="e.g. Gujarat, Tamil Nadu"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>

            <div className="vendor-form-group full-width">
              <label className="vendor-form-label">Operating Address</label>
              <input
                type="text"
                name="address"
                className="vendor-form-input"
                placeholder="Factory / Office / Studio street address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="vendor-form-group full-width">
              <label className="vendor-form-label">Business Overview / Products Offered</label>
              <textarea
                name="description"
                className="vendor-form-textarea"
                placeholder="Briefly describe what you manufacture, print, or supply..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="vendor-submit-btn"
            disabled={loading}
          >
            {loading ? 'Submitting Application...' : 'Submit Vendor Application'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default VendorRegister
