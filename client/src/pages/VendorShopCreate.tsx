import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getVendorMe, createVendorShop, updateVendorShop } from '../services/vendorApi'
import '../styles/Vendor.css'

export const VendorShopCreate: React.FC = () => {
  const navigate = useNavigate()
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    shopName: '',
    category: 'Clothing Brand',
    description: '',
    contactEmail: '',
    contactPhone: '',
    city: '',
    state: '',
    address: '',
    logo: '',
    banner: '',
  })

  useEffect(() => {
    checkVendorAndLoadShop()
  }, [])

  const checkVendorAndLoadShop = async () => {
    setLoading(true)
    setError(null)
    try {
      const me = await getVendorMe()
      if (me.vendorProfile?.status !== 'APPROVED') {
        setError(`Your vendor account status is ${me.vendorProfile?.status || 'PENDING'}. Shop creation is only available to APPROVED vendors.`)
        return
      }

      if (me.shop) {
        setIsEditMode(true)
        setFormData({
          shopName: me.shop.shopName || '',
          category: me.shop.category || 'Clothing Brand',
          description: me.shop.description || '',
          contactEmail: me.shop.contactEmail || '',
          contactPhone: me.shop.contactPhone || '',
          city: me.shop.city || '',
          state: me.shop.state || '',
          address: me.shop.address || '',
          logo: me.shop.logo || '',
          banner: me.shop.banner || '',
        })
      } else if (me.vendorProfile) {
        // Pre-fill from vendor registration
        setFormData((prev) => ({
          ...prev,
          shopName: me.vendorProfile?.businessName || '',
          category: me.vendorProfile?.category || 'Clothing Brand',
          description: me.vendorProfile?.description || '',
          contactEmail: me.vendorProfile?.email || '',
          contactPhone: me.vendorProfile?.phone || '',
          city: me.vendorProfile?.city || '',
          state: me.vendorProfile?.state || '',
          address: me.vendorProfile?.address || '',
        }))
      }
    } catch (err: any) {
      console.error('Failed to load vendor status:', err)
      setError(err.message || 'Authentication error. Please log in.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Support local image reading to base64 preview
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'banner') => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be under 5MB.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, [field]: reader.result as string }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setStatusMessage(null)

    if (!formData.shopName || !formData.contactEmail || !formData.contactPhone || !formData.city || !formData.state) {
      setError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    try {
      if (isEditMode) {
        const res = await updateVendorShop(formData)
        setStatusMessage('Shop storefront updated successfully!')
        if (res.shop?.slug) {
          setTimeout(() => navigate(`/shop/${res.shop.slug}`), 1200)
          return
        }
      } else {
        const res = await createVendorShop(formData)
        setStatusMessage('Shop storefront created successfully!')
        if (res.shop?.slug) {
          setTimeout(() => navigate(`/shop/${res.shop.slug}`), 1200)
          return
        }
      }
      setTimeout(() => navigate('/vendor/dashboard'), 1500)
    } catch (err: any) {
      console.error('Error saving shop:', err)
      setError(err.message || 'Failed to save shop storefront.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#D94700' }}>
          Verifying seller permissions...
        </h2>
      </div>
    )
  }

  return (
    <div className="vendor-register-page">
      <div className="vendor-register-card">
        <div className="vendor-register-header">
          <span className="vendor-register-badge">Storefront Setup</span>
          <h1>{isEditMode ? 'Manage Your Shop' : 'Create Your Online Shop'}</h1>
          <p>
            {isEditMode
              ? 'Customize your public KALA storefront branding, contact details, and images.'
              : 'Launch your dedicated brand storefront on KALA with a custom URL and logo.'}
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
            }}
          >
            {error}
          </div>
        )}

        {statusMessage && (
          <div
            style={{
              padding: '0.9rem 1.25rem',
              backgroundColor: '#D1FAE5',
              color: '#065F46',
              borderRadius: '6px',
              marginBottom: '1.75rem',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 1. STORE BASICS */}
          <div className="vendor-form-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            Storefront Identity
          </div>

          <div className="vendor-form-grid">
            <div className="vendor-form-group">
              <label className="vendor-form-label">
                Shop Name <span>*</span>
              </label>
              <input
                type="text"
                name="shopName"
                className="vendor-form-input"
                placeholder="e.g. Urban Fabric Co."
                value={formData.shopName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="vendor-form-group">
              <label className="vendor-form-label">
                Category <span>*</span>
              </label>
              <input
                type="text"
                name="category"
                className="vendor-form-input"
                placeholder="e.g. Streetwear, Printing Services"
                value={formData.category}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="vendor-form-group full-width">
              <label className="vendor-form-label">Storefront Bio / Description</label>
              <textarea
                name="description"
                className="vendor-form-textarea"
                placeholder="Tell customers about your brand origin, manufacturing quality, or services..."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* 2. BRANDING IMAGES */}
          <div className="vendor-form-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Visual Branding (Logo & Banner)
          </div>

          <div className="vendor-form-grid">
            <div className="vendor-form-group">
              <label className="vendor-form-label">Logo Image URL or Upload</label>
              <input
                type="text"
                name="logo"
                className="vendor-form-input"
                placeholder="https://... or upload below"
                value={formData.logo}
                onChange={handleInputChange}
              />
              <input
                type="file"
                accept="image/*"
                style={{ marginTop: '0.4rem', fontSize: '0.8rem' }}
                onChange={(e) => handleImageFileChange(e, 'logo')}
              />
              {formData.logo && (
                <div className="image-preview-box" style={{ height: '80px', width: '80px', borderRadius: '50%' }}>
                  <img src={formData.logo} alt="Logo preview" className="image-preview-img" />
                </div>
              )}
            </div>

            <div className="vendor-form-group">
              <label className="vendor-form-label">Cover Banner URL or Upload</label>
              <input
                type="text"
                name="banner"
                className="vendor-form-input"
                placeholder="https://... or upload below"
                value={formData.banner}
                onChange={handleInputChange}
              />
              <input
                type="file"
                accept="image/*"
                style={{ marginTop: '0.4rem', fontSize: '0.8rem' }}
                onChange={(e) => handleImageFileChange(e, 'banner')}
              />
              {formData.banner && (
                <div className="image-preview-box" style={{ height: '80px' }}>
                  <img src={formData.banner} alt="Banner preview" className="image-preview-img" />
                </div>
              )}
            </div>
          </div>

          {/* 3. CONTACT & LOCATION */}
          <div className="vendor-form-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Public Contact & Location
          </div>

          <div className="vendor-form-grid">
            <div className="vendor-form-group">
              <label className="vendor-form-label">
                Contact Email <span>*</span>
              </label>
              <input
                type="email"
                name="contactEmail"
                className="vendor-form-input"
                value={formData.contactEmail}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="vendor-form-group">
              <label className="vendor-form-label">
                Contact Phone <span>*</span>
              </label>
              <input
                type="tel"
                name="contactPhone"
                className="vendor-form-input"
                value={formData.contactPhone}
                onChange={handleInputChange}
                required
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
                value={formData.city}
                onChange={handleInputChange}
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
                value={formData.state}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              className="vendor-submit-btn"
              style={{ marginTop: 0 }}
              disabled={submitting}
            >
              {submitting ? 'Saving Storefront...' : isEditMode ? 'Update Storefront' : 'Publish My Online Shop'}
            </button>
            <Link
              to="/vendor/dashboard"
              className="marketplace-btn-secondary"
              style={{ color: '#111', borderColor: '#111', alignSelf: 'center' }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VendorShopCreate
