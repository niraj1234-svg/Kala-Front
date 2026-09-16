import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchAdminProducts,
  updateAdminProduct,
  deleteAdminProduct,
  type AdminProduct,
} from '../../services/adminApi'
import { getProductImage } from '../../data/products'
import '../../styles/Admin.css'

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [page, setPage] = useState<number>(1)
  const [limit] = useState<number>(15)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [availableFilter, setAvailableFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Confirmation modal state for deletion
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const data = await fetchAdminProducts({
        page,
        limit,
        category: categoryFilter,
        available: availableFilter,
        search: searchTerm,
      })
      setProducts(data.products)
      setTotalPages(data.pagination.pages)
      setTotalCount(data.pagination.total)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load products.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [page, limit, categoryFilter, availableFilter, searchTerm])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadProducts()
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value)
    setPage(1)
  }

  const handleAvailableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAvailableFilter(e.target.value)
    setPage(1)
  }

  const handleToggleAvailability = async (product: AdminProduct) => {
    const nextState = !product.available
    try {
      await updateAdminProduct(product.id, { available: nextState })
      setActionFeedback({
        type: 'success',
        message: `Product '${product.name}' is now ${nextState ? 'In Stock (Available)' : 'Out of Stock (Unavailable)'}.`,
      })
      // Update local state smoothly
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, available: nextState } : p))
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update stock status.'
      setActionFeedback({ type: 'error', message: msg })
    }
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete) return
    setIsDeleting(true)

    try {
      const res = await deleteAdminProduct(productToDelete.id)
      setActionFeedback({
        type: 'success',
        message: res.message || `Product '${productToDelete.name}' removed from catalog.`,
      })
      setProductToDelete(null)
      loadProducts()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete product.'
      setActionFeedback({ type: 'error', message: msg })
    } finally {
      setIsDeleting(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

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

  return (
    <div className="admin-page-container">
      {/* 1. Header with Add Product CTA */}
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products Catalog</h1>
          <p className="admin-page-subtitle">
            Manage store apparel inventory, pricing, categories, and live customer storefront availability.
          </p>
        </div>
        <div>
          <Link to="/admin/products/new" className="admin-btn admin-btn-primary">
            + Add New Product
          </Link>
        </div>
      </header>

      {/* Global Action Feedback Alert */}
      {actionFeedback && (
        <div
          className={`admin-feedback-alert ${
            actionFeedback.type === 'success' ? 'feedback-success' : 'feedback-error'
          }`}
          role="alert"
        >
          <span>{actionFeedback.message}</span>
          <button
            type="button"
            className="admin-feedback-dismiss"
            onClick={() => setActionFeedback(null)}
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Controls: Search Bar & Filters */}
      <div className="admin-controls-bar">
        <form onSubmit={handleSearchSubmit} className="admin-search-bar">
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by ID, name, category, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="admin-btn admin-btn-secondary">
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => {
                setSearchTerm('')
                setPage(1)
              }}
            >
              Clear
            </button>
          )}
        </form>

        <div className="admin-filter-group">
          <label htmlFor="category-filter" className="admin-filter-label">
            Category:
          </label>
          <select
            id="category-filter"
            className="admin-select"
            value={categoryFilter}
            onChange={handleCategoryChange}
          >
            <option value="All">All Categories</option>
            <option value="Streetwear">Streetwear</option>
            <option value="Gaming">Gaming</option>
            <option value="Gymwear">Gymwear</option>
          </select>
        </div>

        <div className="admin-filter-group">
          <label htmlFor="available-filter" className="admin-filter-label">
            Stock:
          </label>
          <select
            id="available-filter"
            className="admin-select"
            value={availableFilter}
            onChange={handleAvailableChange}
          >
            <option value="all">All Statuses</option>
            <option value="true">In Stock Only</option>
            <option value="false">Out of Stock Only</option>
          </select>
        </div>
      </div>

      {/* 3. Main Products Table Area */}
      {isLoading ? (
        <div className="admin-state-container">
          <div className="admin-spinner" aria-hidden="true" />
          <p className="admin-state-text">Loading catalog products from MongoDB...</p>
        </div>
      ) : errorMessage ? (
        <div className="admin-state-container admin-state-error">
          <p className="admin-error-text">{errorMessage}</p>
          <button type="button" className="admin-btn admin-btn-primary" onClick={loadProducts}>
            Retry Loading
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="admin-state-container">
          <p className="admin-state-text">No products found matching the current search or filters.</p>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => {
              setSearchTerm('')
              setCategoryFilter('All')
              setAvailableFilter('all')
              setPage(1)
            }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>Image</th>
                  <th>Product Details</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Availability</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <div className="admin-product-thumb">
                        <img
                          src={resolveImage(prod.image)}
                          alt={prod.name}
                          loading="lazy"
                          onError={(e) => {
                            // Fallback if image fails to render
                            ;(e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="admin-product-cell-main">
                        <span className="admin-product-name-text">{prod.name}</span>
                        <span className="admin-product-id-sub font-mono">ID: {prod.id}</span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-category-badge">{prod.category}</span>
                    </td>
                    <td className="font-medium text-white">{formatPrice(prod.price)}</td>
                    <td>
                      <span
                        className={
                          prod.available
                            ? 'status-badge status-success'
                            : 'status-badge status-danger'
                        }
                      >
                        {prod.available ? 'IN STOCK' : 'OUT OF STOCK'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="admin-action-row">
                        <button
                          type="button"
                          className={`admin-btn-action ${prod.available ? 'text-warning' : 'text-success'}`}
                          title={prod.available ? 'Mark Out of Stock' : 'Mark In Stock'}
                          onClick={() => handleToggleAvailability(prod)}
                          aria-label={`Toggle availability for ${prod.name}`}
                        >
                          {prod.available ? 'Deactivate' : 'Activate'}
                        </button>
                        <Link
                          to={`/admin/products/${prod.id}/edit`}
                          className="admin-btn-action"
                          aria-label={`Edit product ${prod.name}`}
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="admin-btn-action text-danger"
                          onClick={() => setProductToDelete(prod)}
                          aria-label={`Delete product ${prod.name}`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="admin-pagination-bar">
            <span className="admin-pagination-info">
              Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total catalog items)
            </span>
            <div className="admin-pagination-btns">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* 4. Delete Confirmation Modal */}
      {productToDelete && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Confirm Product Removal</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setProductToDelete(null)}
                aria-label="Close dialog"
                disabled={isDeleting}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <p className="admin-confirm-text">
                Are you sure you want to remove <strong>"{productToDelete.name}"</strong> (
                <span className="font-mono">{productToDelete.id}</span>) from the catalog?
              </p>
              <p className="admin-confirm-note">
                <strong>Safety Guarantee:</strong> If this product is linked to customer orders, it will be safely deactivated (marked Out of Stock) rather than deleted, safeguarding customer purchase history. Local image files are never touched.
              </p>

              <div className="admin-btn-group" style={{ marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setProductToDelete(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Removing...' : 'Confirm Remove'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts
