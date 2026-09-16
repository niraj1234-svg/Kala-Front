import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchAdminCustomers,
  type AdminCustomerAccount,
} from '../../services/adminApi'
import '../../styles/Admin.css'

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<AdminCustomerAccount[]>([])
  const [page, setPage] = useState<number>(1)
  const [limit] = useState<number>(15)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadCustomers = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const data = await fetchAdminCustomers({
        page,
        limit,
        search: searchTerm,
      })
      setCustomers(data.customers)
      setTotalPages(data.pagination.pages)
      setTotalCount(data.pagination.total)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load customers.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [page, limit, searchTerm])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadCustomers()
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="admin-page-container">
      {/* Header */}
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customers Management</h1>
          <p className="admin-page-subtitle">
            View registered customer profiles, contact info, and lifetime order histories.
          </p>
        </div>
      </header>

      {/* Controls / Search Bar */}
      <div className="admin-controls-bar">
        <form onSubmit={handleSearchSubmit} className="admin-search-bar">
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by customer name, email, phone, or User ID..."
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
      </div>

      {/* Main Table Area */}
      {isLoading ? (
        <div className="admin-state-container">
          <div className="admin-spinner" aria-hidden="true" />
          <p className="admin-state-text">Loading registered customer accounts...</p>
        </div>
      ) : errorMessage ? (
        <div className="admin-state-container admin-state-error">
          <p className="admin-error-text">{errorMessage}</p>
          <button type="button" className="admin-btn admin-btn-primary" onClick={loadCustomers}>
            Retry Loading
          </button>
        </div>
      ) : customers.length === 0 ? (
        <div className="admin-state-container">
          <p className="admin-state-text">No customers found matching the search criteria.</p>
          {searchTerm && (
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => {
                setSearchTerm('')
                setPage(1)
              }}
            >
              Reset Search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact Details</th>
                  <th>Account Role</th>
                  <th>Order History</th>
                  <th>Member Since</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((cust) => (
                  <tr key={cust.userId}>
                    <td>
                      <div className="admin-product-cell-main">
                        <span className="admin-product-name-text">
                          {cust.firstName} {cust.lastName}
                        </span>
                        <span className="admin-product-id-sub font-mono">
                          ID: {cust.userId}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-product-cell-main">
                        <span className="font-mono text-white text-sm">{cust.email}</span>
                        <span className="text-muted text-xs font-mono">{cust.phone || 'No phone'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge status-info">
                        {(cust.role || 'customer').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="admin-category-badge">
                        {cust.orderCount} {cust.orderCount === 1 ? 'Order' : 'Orders'}
                      </span>
                    </td>
                    <td className="text-muted text-sm">{formatDate(cust.createdAt)}</td>
                    <td className="text-right">
                      <Link
                        to={`/admin/customers/${cust.userId}`}
                        className="admin-btn-action"
                        aria-label={`View details for customer ${cust.firstName} ${cust.lastName}`}
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="admin-pagination-bar">
            <span className="admin-pagination-info">
              Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total customers)
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
    </div>
  )
}

export default AdminCustomers
