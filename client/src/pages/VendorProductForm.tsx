import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  createVendorProduct,
  updateVendorProduct,
  getVendorProducts,
  getVendorMe,
} from '../services/vendorApi'
import '../styles/Vendor.css'

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const DEFAULT_CATEGORIES = [
  'Streetwear',
  'Custom Clothing',
  'Clothing Brand',
  'Sportswear',
  'Gymwear',
  'Corporate Merchandise',
  'Printing Services',
  'Accessories',
  'Gaming',
  'Other',
]

export const VendorProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  const [formData, setFormData] = useState({
    name: '',
    category: 'Streetwear',
    price: '',
    discountPrice: '',
    image: '',
    description: '',
    stock: '50',
    sku: '',
    status: 'ACTIVE',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: 'Black, White',
  })

  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    initForm()
  }, [id])

  const initForm = async () => {
    setLoading(true)
    setError(null)
    try {
      const me = await getVendorMe()
      if (me.vendorProfile?.status !== 'APPROVED') {
        setError(`Your vendor account status is ${me.vendorProfile?.status || 'PENDING'}. Product uploads are only unlocked for APPROVED vendors.`)
        return
      }

      if (isEditMode && id) {
        const prodData = await getVendorProducts()
        const found = (prodData.products || []).find((p) => p.id === id)
        if (found) {
          setFormData({
            name: found.name || '',
            category: found.category || 'Streetwear',
            price: String(found.price || ''),
            discountPrice: found.discountPrice ? String(found.discountPrice) : '',
            image: found.image || '',
            description: found.description || '',
            stock: found.stock !== undefined ? String(found.stock) : '50',
            sku: found.sku || '',
            status: found.status || 'ACTIVE',
            sizes: found.sizes || ['S', 'M', 'L'],
            colors: Array.isArray(found.colors) ? found.colors.join(', ') : 'Black, White',
          })
        } else {
          setError('Product not found or does not belong to your account.')
        }
      }
    } catch (err: any) {
      console.error('Failed to initialize product form:', err)
      setError(err.message || 'Authentication error.')
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

  const handleSizeToggle = (size: string) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(size)
      return {
        ...prev,
        sizes: exists ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
      }
    })
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be under 5MB.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, image: reader.result as string }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setStatusMessage(null)

    if (!formData.name || !formData.category || !formData.price || !formData.image || !formData.description) {
      setError('Please provide name, category, price, primary image, and description.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
        image: formData.image.trim(),
        description: formData.description.trim(),
        stock: Number(formData.stock) || 0,
        sku: formData.sku.trim(),
        status: formData.status as any,
        sizes: formData.sizes,
        colors: formData.colors
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
      }

      if (isEditMode && id) {
        await updateVendorProduct(id, payload)
        setStatusMessage('Product updated successfully!')
      } else {
        await createVendorProduct(payload)
        setStatusMessage('Product published directly to KALA Marketplace!')
      }

      setTimeout(() => navigate('/vendor/products'), 1400)
    } catch (err: any) {
      console.error('Error saving product:', err)
      setError(err.message || 'Failed to save product.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#D94700' }}>
          Loading product configuration...
        </h2>
      </div>
    )
  }

  return (
    <div className="vendor-register-page">
      <div className="vendor-register-card">
        <div className="vendor-register-header">
          <span className="vendor-register-badge">Catalog Manager</span>
          <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
          <p>
            {isEditMode
              ? 'Update pricing, images, and inventory for this listing.'
              : 'Direct publication is enabled for approved vendors. Upload images and details to sell on KALA.'}
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
          {/* SECTION 1: ESSENTIAL DETAILS */}
          <div className="vendor-form-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            Product Information
          </div>

          <div className="vendor-form-grid">
            <div className="vendor-form-group full-width">
              <label className="vendor-form-label">
                Product Title / Name <span>*</span>
              </label>
              <input
                type="text"
                name="name"
                className="vendor-form-input"
                placeholder="e.g. Heavyweight Boxy Tee 280 GSM"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="vendor-form-group">
              <label className="vendor-form-label">
                Category <span>*</span>
              </label>
              <select
                name="category"
                className="vendor-form-select"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="vendor-form-group">
              <label className="vendor-form-label">
                Status <span>*</span>
              </label>
              <select
                name="status"
                className="vendor-form-select"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="ACTIVE">ACTIVE (Published)</option>
                <option value="DRAFT">DRAFT (Hidden)</option>
                <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <div className="vendor-form-group">
              <label className="vendor-form-label">
                Selling Price (₹) <span>*</span>
              </label>
              <input
                type="number"
                name="price"
                min="0"
                step="1"
                className="vendor-form-input"
                placeholder="e.g. 1499"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="vendor-form-group">
              <label className="vendor-form-label">Original / Compare Price (₹)</label>
              <input
                type="number"
                name="discountPrice"
                min="0"
                step="1"
                className="vendor-form-input"
                placeholder="e.g. 1999 (Crossed out)"
                value={formData.discountPrice}
                onChange={handleInputChange}
              />
            </div>

            <div className="vendor-form-group">
              <label className="vendor-form-label">Inventory Stock Quantity</label>
              <input
                type="number"
                name="stock"
                min="0"
                className="vendor-form-input"
                placeholder="50"
                value={formData.stock}
                onChange={handleInputChange}
              />
            </div>

            <div className="vendor-form-group">
              <label className="vendor-form-label">SKU / Item Identifier</label>
              <input
                type="text"
                name="sku"
                className="vendor-form-input"
                placeholder="e.g. KALA-TSHIRT-01"
                value={formData.sku}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* SECTION 2: IMAGES */}
          <div className="vendor-form-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Product Photography (URL or Direct Upload)
          </div>

          <div className="vendor-form-grid">
            <div className="vendor-form-group full-width">
              <label className="vendor-form-label">
                Primary Product Image <span>*</span>
              </label>
              <input
                type="text"
                name="image"
                className="vendor-form-input"
                placeholder="Paste high-res image URL or select a local photo below"
                value={formData.image}
                onChange={handleInputChange}
                required
              />
              <input
                type="file"
                accept="image/*"
                style={{ marginTop: '0.4rem', fontSize: '0.85rem' }}
                onChange={handleImageFileChange}
              />
              {formData.image && (
                <div className="image-preview-box" style={{ height: '160px', marginTop: '0.75rem' }}>
                  <img src={formData.image} alt="Preview" className="image-preview-img" />
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: SIZES & VARIANTS */}
          <div className="vendor-form-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Available Sizes & Colors
          </div>

          <div className="vendor-form-grid">
            <div className="vendor-form-group full-width">
              <label className="vendor-form-label">Available Sizes</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                {DEFAULT_SIZES.map((sz) => {
                  const isChecked = formData.sizes.includes(sz)
                  return (
                    <button
                      type="button"
                      key={sz}
                      className={`marketplace-cat-chip ${isChecked ? 'active' : ''}`}
                      onClick={() => handleSizeToggle(sz)}
                    >
                      {sz} {isChecked ? '✓' : ''}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="vendor-form-group full-width">
              <label className="vendor-form-label">Available Colors (Comma separated)</label>
              <input
                type="text"
                name="colors"
                className="vendor-form-input"
                placeholder="e.g. Jet Black, Vintage White, Olive Green"
                value={formData.colors}
                onChange={handleInputChange}
              />
            </div>

            <div className="vendor-form-group full-width">
              <label className="vendor-form-label">
                Full Product Description & Specifications <span>*</span>
              </label>
              <textarea
                name="description"
                className="vendor-form-textarea"
                style={{ minHeight: '130px' }}
                placeholder="Fabric composition, GSM weight, wash care instructions, fit description..."
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.75rem' }}>
            <button
              type="submit"
              className="vendor-submit-btn"
              style={{ marginTop: 0 }}
              disabled={submitting}
            >
              {submitting
                ? 'Publishing Product...'
                : isEditMode
                ? 'Update Product Listing'
                : 'Publish Product to KALA'}
            </button>
            <Link
              to="/vendor/products"
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

export default VendorProductForm
