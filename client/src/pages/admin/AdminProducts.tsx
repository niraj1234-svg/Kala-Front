import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchAdminProducts,
  updateAdminProduct,
  deleteAdminProduct,
  type AdminProduct,
} from '../../services/adminApi'
import {
  fetchPendingProducts,
  approvePendingProduct,
  rejectPendingProduct,
} from '../../services/adminVendorApi'
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

  // Tab: 'all' | 'pending'
  const [activeCatalogTab, setActiveCatalogTab] = useState<'all' | 'pending'>('all')
  const [pendingProducts, setPendingProducts] = useState<any[]>([])
  const [isPendingLoading, setIsPendingLoading] = useState<boolean>(false)
  const [rejectionModalProduct, setRejectionModalProduct] = useState<any | null>(null)
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('')
  const [isActionPending, setIsActionPending] = useState<boolean>(false)

  const loadPendingProducts = useCallback(async () => {
    setIsPendingLoading(true)
    try {
      const data = await fetchPendingProducts()
      setPendingProducts(data.products || [])
    } catch (err: any) {
      console.warn('Failed to load pending products:', err)
    } finally {
      setIsPendingLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPendingProducts()
  }, [loadPendingProducts])

  const handleApprovePending = async (productId: string, name: string) => {
    setIsActionPending(true)
    try {
      await approvePendingProduct(productId)
      setActionFeedback({
        type: 'success',
        message: `Product "${name}" approved successfully and published to marketplace.`,
      })
      loadPendingProducts()
      loadProducts()
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to approve product.' })
    } finally {
      setIsActionPending(false)
    }
  }

  const handleRejectPending = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectionModalProduct) return
    setIsActionPending(true)
    try {
      await rejectPendingProduct(rejectionModalProduct._id || rejectionModalProduct.id, rejectionReasonInput)
      setActionFeedback({
        type: 'success',
        message: `Product "${rejectionModalProduct.name}" rejected with reason sent to vendor.`,
      })
      setRejectionModalProduct(null)
      setRejectionReasonInput('')
      loadPendingProducts()
    } catch (err: any) {
      alert(err.message || 'Failed to reject product.')
    } finally {
      setIsActionPending(false)
    }
  }

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

      {/* Catalog Mode Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #2A2A2A', paddingBottom: '0.75rem' }}>
        <button
          type="button"
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '6px',
            fontSize: '0.88rem',
            fontWeight: 700,
            background: activeCatalogTab === 'all' ? '#FFFFFF' : 'transparent',
            color: activeCatalogTab === 'all' ? '#111111' : '#A3A3A3',
            border: '1px solid #333333',
            cursor: 'pointer',
          }}
          onClick={() => setActiveCatalogTab('all')}
        >
          All Catalog Products ({totalCount})
        </button>
        <button
          type="button"
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '6px',
            fontSize: '0.88rem',
            fontWeight: 700,
            background: activeCatalogTab === 'pending' ? 'var(--kala-orange, #D94700)' : 'transparent',
            color: activeCatalogTab === 'pending' ? '#FFFFFF' : 'var(--kala-orange, #D94700)',
            border: '1px solid var(--kala-orange, #D94700)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
          onClick={() => {
            setActiveCatalogTab('pending')
            loadPendingProducts()
          }}
        >
          Pending Vendor Approvals
          {pendingProducts.length > 0 && (
            <span
              style={{
                background: activeCatalogTab === 'pending' ? '#FFFFFF' : 'var(--kala-orange, #D94700)',
                color: activeCatalogTab === 'pending' ? 'var(--kala-orange, #D94700)' : '#FFFFFF',
                padding: '0.1rem 0.5rem',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: 800,
              }}
            >
              {pendingProducts.length}
            </span>
          )}
        </button>
      </div>

      {activeCatalogTab === 'pending' ? (
        /* PENDING VENDOR PRODUCTS TAB */
        <div>
          {isPendingLoading ? (
            <div className="admin-state-container">
              <div className="admin-spinner" aria-hidden="true" />
              <p className="admin-state-text">Loading pending vendor product submissions...</p>
            </div>
          ) : pendingProducts.length === 0 ? (
            <div className="admin-state-container">
              <p className="admin-state-text">No pending vendor submissions awaiting review.</p>
              <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                All merchant submitted products have been moderated.
              </p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '70px' }}>Image</th>
                    <th>Product & Store Details</th>
                    <th>Category</th>
                    <th>Price & MRP</th>
                    <th>Stock</th>
                    <th className="text-right" style={{ minWidth: '180px' }}>Review Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingProducts.map((p) => (
                    <tr key={p._id || p.id}>
                      <td>
                        <div className="admin-product-thumb">
                          <img src={resolveImage(p.image)} alt={p.name} />
                        </div>
                      </td>
                      <td>
                        <div className="admin-product-cell-main">
                          <span className="admin-product-name-text" style={{ fontSize: '0.95rem' }}>{p.name}</span>
                          <span style={{ fontSize: '0.78rem', color: '#D94700' }}>
                            Store: {p.shopId?.shopName || p.brand || 'Vendor Store'}
                          </span>
                          <span className="admin-product-id-sub font-mono">SKU: {p.sku || p.id || p._id}</span>
                        </div>
                      </td>
                      <td>
                        <span className="admin-category-badge">{p.category}</span>
                        {p.subcategory && <div style={{ fontSize: '0.75rem', color: '#888' }}>{p.subcategory}</div>}
                      </td>
                      <td>
                        <div className="font-medium text-white">{formatPrice(p.price)}</div>
                        {p.mrp && <div style={{ fontSize: '0.75rem', color: '#888', textDecoration: 'line-through' }}>{formatPrice(p.mrp)}</div>}
                      </td>
                      <td>{p.stock !== undefined ? p.stock : 50} units</td>
                      <td className="text-right">
                        <div style={{ display: 'inline-flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn-primary"
                            style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
                            disabled={isActionPending}
                            onClick={() => handleApprovePending(p._id || p.id, p.name)}
                          >
                            ✓ Approve
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
                            disabled={isActionPending}
                            onClick={() => {
                              setRejectionModalProduct(p)
                              setRejectionReasonInput('')
                            }}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ALL PRODUCTS TAB (Standard Admin Catalog) */
        <>
          <div className="admin-controls-card">
            <form onSubmit={handleSearchSubmit} className="admin-search-form">
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

        <div className="admin-filters-wrapper">
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
                  <th className="text-right" style={{ whiteSpace: 'nowrap', minWidth: '220px' }}>Actions</th>
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
                    <td className="text-right" style={{ whiteSpace: 'nowrap', minWidth: '220px' }}>
                      <div className="admin-action-row" style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
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

      {/* 5. Reject Product Reason Modal */}
      {rejectionModalProduct && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card" style={{ maxWidth: '480px' }}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Reject Product Submission</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setRejectionModalProduct(null)}
                aria-label="Close dialog"
                disabled={isActionPending}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRejectPending}>
              <div className="admin-modal-body">
                <p className="admin-confirm-text">
                  Provide an explanation for rejecting <strong>"{rejectionModalProduct.name}"</strong>. The vendor will see this reason in their dashboard to make necessary edits.
                </p>

                <div className="kala-form-group" style={{ marginTop: '1rem' }}>
                  <label className="admin-filter-label">Rejection Reason</label>
                  <textarea
                    className="admin-search-input"
                    rows={4}
                    style={{ width: '100%', resize: 'vertical', marginTop: '0.4rem', padding: '0.75rem' }}
                    placeholder="e.g. Image resolution is too low, or misleading title/pricing."
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-btn-group" style={{ marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => setRejectionModalProduct(null)}
                    disabled={isActionPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-btn admin-btn-danger"
                    disabled={isActionPending || !rejectionReasonInput.trim()}
                  >
                    {isActionPending ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts
