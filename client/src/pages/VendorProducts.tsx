import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getVendorProducts, deleteVendorProduct } from '../services/vendorApi'
import { getProductImage } from '../data/products'
import type { MarketplaceProduct } from '../types/marketplace'
import '../styles/Vendor.css'

export const VendorProducts: React.FC = () => {
  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getVendorProducts()
      setProducts(res.products || [])
    } catch (err: any) {
      console.error('Error loading products:', err)
      setError(err.message || 'Failed to load your catalog.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from your catalog?`)) {
      return
    }

    setDeletingId(id)
    try {
      await deleteVendorProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err: any) {
      alert(err.message || 'Failed to delete product.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="vendor-portal-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="vendor-sidebar">
        <div className="vendor-sidebar-header">
          <div className="vendor-sidebar-brand">
            <span>Seller Workspace</span>
          </div>
          <span className="vendor-sidebar-tag status-badge-approved">Active Merchant</span>
        </div>

        <ul className="vendor-sidebar-nav">
          <li>
            <Link to="/vendor/dashboard" className="vendor-nav-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Overview
            </Link>
          </li>
          <li>
            <Link to="/vendor/products" className="vendor-nav-link active">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              My Products ({products.length})
            </Link>
          </li>
          <li>
            <Link to="/vendor/products/add" className="vendor-nav-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Add Product
            </Link>
          </li>
          <li>
            <Link to="/vendor/shop/create" className="vendor-nav-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Shop Settings
            </Link>
          </li>
        </ul>
      </aside>

      {/* MAIN PRODUCTS LIST */}
      <main className="vendor-main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Product Management</h1>
            <p style={{ color: '#5F6368', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Upload, edit, and organize all apparel & merchandise sold from your shop
            </p>
          </div>
          <Link to="/vendor/products/add" className="marketplace-btn-primary">
            + Add New Product
          </Link>
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

        <div className="vendor-table-card">
          <div className="vendor-table-header">
            <div className="vendor-table-title">Inventory & Listings ({products.length})</div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#D94700' }}>
                Loading products...
              </div>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <p style={{ color: '#5F6368', fontSize: '1rem', marginBottom: '1.5rem' }}>
                You have not added any products to your shop yet.
              </p>
              <Link to="/vendor/products/add" className="marketplace-btn-primary">
                Upload Your First Product
              </Link>
            </div>
          ) : (
            <div className="vendor-table-wrap">
              <table className="vendor-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="product-row-info">
                          <img src={getProductImage(item.image)} alt={item.name} className="product-thumb" />
                          <div>
                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#5F6368' }}>ID: {item.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>{item.category}</td>
                      <td>
                        <strong>₹{item.price.toLocaleString('en-IN')}</strong>
                        {item.discountPrice && (
                          <div style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: '#888' }}>
                            ₹{item.discountPrice.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>
                      <td>{item.stock !== undefined ? item.stock : 50}</td>
                      <td>
                        <span
                          className={`vendor-sidebar-tag ${
                            item.status === 'ACTIVE' || item.available
                              ? 'status-badge-approved'
                              : 'status-badge-pending'
                          }`}
                        >
                          {item.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <Link to={`/vendor/products/${item.id}/edit`} className="btn-action-sm">
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="btn-action-sm btn-action-delete"
                            disabled={deletingId === item.id}
                            onClick={() => handleDelete(item.id, item.name)}
                          >
                            {deletingId === item.id ? 'Deleting...' : 'Delete'}
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
      </main>
    </div>
  )
}

export default VendorProducts
