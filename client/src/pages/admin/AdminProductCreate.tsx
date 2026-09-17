import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createAdminProduct,
  type AdminProductCategory,
} from '../../services/adminApi'
import { getProductImage } from '../../data/products'
import '../../styles/Admin.css'

const EXISTING_IMAGES = [
  'Streetwear 01.png',
  'Streetwear -02.png',
  'Streetwear 03.png',
  'Streetwear 04.png',
  'Streetwear 05.png',
  'Streetwear 06.png',
  'gaming 01.png',
  'gaming 02.png',
  'gaming 03.png',
  'gaming 04.png',
  'gaming 05.png',
  'gymwear-01.jpg.jpeg',
  'gymwear02.png',
  'gymwear-03.png',
  'Gymwear04.png',
  'Gymwear-05.png',
  'Gymwear06.png',
  'Gymwear07.png',
  'Gymwear08.png',
  'Gymwear09.png',
]

export const AdminProductCreate: React.FC = () => {
  const navigate = useNavigate()

  const [name, setName] = useState<string>('')
  const [customId, setCustomId] = useState<string>('')
  const [category, setCategory] = useState<AdminProductCategory>('Streetwear')
  const [price, setPrice] = useState<string>('')
  const [image, setImage] = useState<string>('Streetwear 01.png')
  const [description, setDescription] = useState<string>('')
  const [available, setAvailable] = useState<boolean>(true)

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const resolveImage = (imagePath: string) => {
    if (!imagePath) return ''
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      return imagePath
    }
    let filename = imagePath
    if (filename.startsWith('/images/')) {
      filename = filename.replace('/images/', '')
    }
    return getProductImage(filename)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    // Basic frontend checks
    if (!name.trim()) {
      setErrorMessage('Product name is required.')
      return
    }

    const numPrice = Number(price)
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMessage('Please enter a valid non-negative price.')
      return
    }

    if (!image.trim()) {
      setErrorMessage('Product image reference is required.')
      return
    }

    if (!description.trim()) {
      setErrorMessage('Product description is required.')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        name: name.trim(),
        id: customId.trim() ? customId.trim() : undefined,
        category,
        price: numPrice,
        image: image.trim(),
        description: description.trim(),
        available,
      }

      const res = await createAdminProduct(payload)
      setSuccessMessage(`Product '${res.product.name}' created successfully!`)

      // Redirect after brief delay
      setTimeout(() => {
        navigate('/admin/products')
      }, 900)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create product.'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-page-container">
      {/* Breadcrumb Back Link */}
      <div className="admin-detail-breadcrumb">
        <Link to="/admin/products" className="admin-back-link">
          ← Back to Products List
        </Link>
      </div>

      {/* Header */}
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Add New Product</h1>
          <p className="admin-page-subtitle">
            Create an official apparel item in the live MongoDB catalog.
          </p>
        </div>
      </header>

      {/* Form Card */}
      <div className="admin-form-container">
        {errorMessage && (
          <div className="admin-feedback-alert feedback-error" role="alert">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="admin-feedback-alert feedback-success" role="alert">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-product-form">
          <div className="admin-form-row">
            {/* Product Name */}
            <div className="admin-form-group flex-2">
              <label htmlFor="prod-name" className="admin-form-label">
                Product Title <span className="text-danger">*</span>
              </label>
              <input
                id="prod-name"
                type="text"
                className="admin-form-input"
                placeholder="e.g. KALA Obsidian Heavyweight Tee"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Custom Slug ID */}
            <div className="admin-form-group flex-1">
              <label htmlFor="prod-id" className="admin-form-label">
                Custom URL Slug (Optional)
              </label>
              <input
                id="prod-id"
                type="text"
                className="admin-form-input font-mono"
                placeholder="Auto-generated if left empty"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                disabled={isSubmitting}
              />
              <span className="admin-form-hint">Must be unique (lowercase letters, numbers, hyphens).</span>
            </div>
          </div>

          <div className="admin-form-row">
            {/* Category */}
            <div className="admin-form-group flex-1">
              <label htmlFor="prod-category" className="admin-form-label">
                Category <span className="text-danger">*</span>
              </label>
              <select
                id="prod-category"
                className="admin-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as AdminProductCategory)}
                disabled={isSubmitting}
              >
                <option value="Streetwear">Streetwear</option>
                <option value="Gaming">Gaming</option>
                <option value="Gymwear">Gymwear</option>
              </select>
            </div>

            {/* Price */}
            <div className="admin-form-group flex-1">
              <label htmlFor="prod-price" className="admin-form-label">
                Price (INR ₹) <span className="text-danger">*</span>
              </label>
              <input
                id="prod-price"
                type="number"
                min="0"
                step="1"
                className="admin-form-input font-mono"
                placeholder="e.g. 1999"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Availability */}
            <div className="admin-form-group flex-1">
              <label htmlFor="prod-available" className="admin-form-label">
                Stock Status
              </label>
              <select
                id="prod-available"
                className="admin-select"
                value={available ? 'true' : 'false'}
                onChange={(e) => setAvailable(e.target.value === 'true')}
                disabled={isSubmitting}
              >
                <option value="true">In Stock (Available)</option>
                <option value="false">Out of Stock (Unavailable)</option>
              </select>
            </div>
          </div>

          {/* Image Reference */}
          <div className="admin-form-row">
            <div className="admin-form-group flex-2">
              <label htmlFor="prod-image" className="admin-form-label">
                Image Reference / Filename <span className="text-danger">*</span>
              </label>
              <div className="admin-image-input-group">
                <input
                  id="prod-image"
                  type="text"
                  className="admin-form-input font-mono"
                  placeholder="Select or enter image filename (e.g. Streetwear 01.png)"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <select
                  className="admin-select"
                  value={EXISTING_IMAGES.includes(image) ? image : ''}
                  onChange={(e) => {
                    if (e.target.value) setImage(e.target.value)
                  }}
                  disabled={isSubmitting}
                  aria-label="Pick from catalog images"
                >
                  <option value="">-- Choose from Catalog Images --</option>
                  {EXISTING_IMAGES.map((img) => (
                    <option key={img} value={img}>
                      {img}
                    </option>
                  ))}
                </select>
              </div>
              <span className="admin-form-hint">
                References existing catalog artwork stored in the KALA image pipeline.
              </span>
            </div>

            {/* Image Preview Box */}
            <div className="admin-form-group flex-1">
              <span className="admin-form-label">Live Preview</span>
              <div className="admin-image-preview-box">
                {image ? (
                  <img
                    src={resolveImage(image)}
                    alt="Preview"
                    onError={(e) => {
                      ;(e.target as HTMLElement).style.opacity = '0.3'
                    }}
                  />
                ) : (
                  <span className="text-muted text-xs">No image specified</span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="admin-form-group">
            <label htmlFor="prod-description" className="admin-form-label">
              Product Description <span className="text-danger">*</span>
            </label>
            <textarea
              id="prod-description"
              className="admin-form-textarea"
              rows={4}
              placeholder="Provide a detailed overview of fabric weight, cut, GSM, wash details, and design highlights..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Form Actions */}
          <div className="admin-form-actions">
            <Link to="/admin/products" className="admin-btn admin-btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Product...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminProductCreate
