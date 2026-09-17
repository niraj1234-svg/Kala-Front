import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  fetchAdminProductById,
  updateAdminProduct,
  type AdminProduct,
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

export const AdminProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [product, setProduct] = useState<AdminProduct | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState<string>('')
  const [category, setCategory] = useState<AdminProductCategory>('Streetwear')
  const [price, setPrice] = useState<string>('')
  const [image, setImage] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [available, setAvailable] = useState<boolean>(true)

  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const loadProduct = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetchAdminProductById(id)
      setProduct(res.product)
      setName(res.product.name)
      setCategory(res.product.category)
      setPrice(String(res.product.price))
      setImage(res.product.image)
      setDescription(res.product.description)
      setAvailable(res.product.available)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Product not found.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadProduct()
  }, [loadProduct])

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setSaveSuccess(null)
    setSaveError(null)

    if (!name.trim()) {
      setSaveError('Product name is required.')
      return
    }

    const numPrice = Number(price)
    if (isNaN(numPrice) || numPrice < 0) {
      setSaveError('Please enter a valid non-negative price.')
      return
    }

    if (!image.trim()) {
      setSaveError('Image reference is required.')
      return
    }

    if (!description.trim()) {
      setSaveError('Description is required.')
      return
    }

    setIsSaving(true)

    try {
      const updated = await updateAdminProduct(product.id, {
        name: name.trim(),
        category,
        price: numPrice,
        image: image.trim(),
        description: description.trim(),
        available,
      })

      setSaveSuccess('Product updated successfully!')
      setProduct(updated.product)
      setTimeout(() => {
        setSaveSuccess(null)
      }, 3500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update product.'
      setSaveError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="admin-page-container">
        <div className="admin-state-container">
          <div className="admin-spinner" aria-hidden="true" />
          <p className="admin-state-text">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (errorMessage || !product) {
    return (
      <div className="admin-page-container">
        <div className="admin-state-container admin-state-error">
          <p className="admin-error-text">{errorMessage || 'Product not found.'}</p>
          <div className="admin-btn-group">
            <button type="button" className="admin-btn admin-btn-primary" onClick={loadProduct}>
              Retry
            </button>
            <Link to="/admin/products" className="admin-btn admin-btn-secondary">
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    )
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
          <h1 className="admin-page-title">Edit Product: {product.name}</h1>
          <p className="admin-page-subtitle">
            Update catalog metadata, pricing, apparel category, and stock status.
          </p>
        </div>
        <div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => navigate('/admin/products')}
          >
            Back to List
          </button>
        </div>
      </header>

      {/* Form Card */}
      <div className="admin-form-container">
        {saveError && (
          <div className="admin-feedback-alert feedback-error" role="alert">
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="admin-feedback-alert feedback-success" role="alert">
            {saveSuccess}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="admin-product-form">
          <div className="admin-form-row">
            {/* Product Title */}
            <div className="admin-form-group flex-2">
              <label htmlFor="edit-name" className="admin-form-label">
                Product Title <span className="text-danger">*</span>
              </label>
              <input
                id="edit-name"
                type="text"
                className="admin-form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
                required
              />
            </div>

            {/* Read-Only Product ID */}
            <div className="admin-form-group flex-1">
              <label htmlFor="edit-id" className="admin-form-label">
                Product ID (Locked)
              </label>
              <input
                id="edit-id"
                type="text"
                className="admin-form-input font-mono"
                value={product.id}
                disabled
                readOnly
                title="Product IDs are immutable to preserve historical order links."
              />
              <span className="admin-form-hint">Locked to safeguard historical order references.</span>
            </div>
          </div>

          <div className="admin-form-row">
            {/* Category */}
            <div className="admin-form-group flex-1">
              <label htmlFor="edit-category" className="admin-form-label">
                Category <span className="text-danger">*</span>
              </label>
              <select
                id="edit-category"
                className="admin-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as AdminProductCategory)}
                disabled={isSaving}
              >
                <option value="Streetwear">Streetwear</option>
                <option value="Gaming">Gaming</option>
                <option value="Gymwear">Gymwear</option>
              </select>
            </div>

            {/* Price */}
            <div className="admin-form-group flex-1">
              <label htmlFor="edit-price" className="admin-form-label">
                Price (INR ₹) <span className="text-danger">*</span>
              </label>
              <input
                id="edit-price"
                type="number"
                min="0"
                step="1"
                className="admin-form-input font-mono"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isSaving}
                required
              />
            </div>

            {/* Availability */}
            <div className="admin-form-group flex-1">
              <label htmlFor="edit-available" className="admin-form-label">
                Stock Status
              </label>
              <select
                id="edit-available"
                className="admin-select"
                value={available ? 'true' : 'false'}
                onChange={(e) => setAvailable(e.target.value === 'true')}
                disabled={isSaving}
              >
                <option value="true">In Stock (Available)</option>
                <option value="false">Out of Stock (Unavailable)</option>
              </select>
            </div>
          </div>

          {/* Image Reference */}
          <div className="admin-form-row">
            <div className="admin-form-group flex-2">
              <label htmlFor="edit-image" className="admin-form-label">
                Image Reference / Filename <span className="text-danger">*</span>
              </label>
              <div className="admin-image-input-group">
                <input
                  id="edit-image"
                  type="text"
                  className="admin-form-input font-mono"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  disabled={isSaving}
                  required
                />
                <select
                  className="admin-select"
                  value={EXISTING_IMAGES.includes(image) ? image : ''}
                  onChange={(e) => {
                    if (e.target.value) setImage(e.target.value)
                  }}
                  disabled={isSaving}
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
            <label htmlFor="edit-description" className="admin-form-label">
              Product Description <span className="text-danger">*</span>
            </label>
            <textarea
              id="edit-description"
              className="admin-form-textarea"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
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
              disabled={isSaving}
            >
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminProductEdit
