import React, { useState, useEffect } from 'react'
import {
  fetchAdminVendors,
  approveAdminVendor,
  rejectAdminVendor,
  suspendAdminVendor,
} from '../../services/adminVendorApi'
import type { EnrichedVendorApplication, VendorStatus } from '../../types/marketplace'
import '../../styles/Vendor.css'

export const AdminVendors: React.FC = () => {
  const [vendors, setVendors] = useState<EnrichedVendorApplication[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    loadVendors()
  }, [statusFilter])

  const loadVendors = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminVendors(statusFilter, searchQuery)
      setVendors(data.vendors || [])
    } catch (err: any) {
      console.error('Error loading admin vendors:', err)
      setError(err.message || 'Failed to load vendor applications.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadVendors()
  }

  const handleApprove = async (id: string, name: string) => {
    if (!window.confirm(`Approve vendor application for "${name}"?`)) return
    setActionLoadingId(id)
    try {
      await approveAdminVendor(id)
      setVendors((prev) =>
        prev.map((v) => (v.userId === id || (v as any)._id === id ? { ...v, status: 'APPROVED' as VendorStatus } : v))
      )
      setSuccessMessage(`Vendor "${name}" has been approved!`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      alert(err.message || 'Approval failed.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleReject = async (id: string, name: string) => {
    const reason = window.prompt(`Enter rejection reason for "${name}" (optional):`, 'Incomplete business documents')
    if (reason === null) return

    setActionLoadingId(id)
    try {
      await rejectAdminVendor(id, reason)
      setVendors((prev) =>
        prev.map((v) => (v.userId === id || (v as any)._id === id ? { ...v, status: 'REJECTED' as VendorStatus } : v))
      )
      setSuccessMessage(`Vendor "${name}" has been marked as rejected.`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      alert(err.message || 'Rejection failed.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleSuspend = async (id: string, name: string) => {
    if (!window.confirm(`Suspend vendor "${name}" and pause their public shop?`)) return
    setActionLoadingId(id)
    try {
      await suspendAdminVendor(id)
      setVendors((prev) =>
        prev.map((v) => (v.userId === id || (v as any)._id === id ? { ...v, status: 'SUSPENDED' as VendorStatus } : v))
      )
      setSuccessMessage(`Vendor "${name}" has been suspended.`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      alert(err.message || 'Suspension failed.')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div style={{ padding: '1.5rem clamp(1rem, 3vw, 2rem)' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>
            Vendor Management & Approval
          </h1>
          <p style={{ color: '#5F6368', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Review merchant applications, approve verified sellers, and govern marketplace stores
          </p>
        </div>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#D94700' }}>
          {vendors.length} Total Applications
        </span>
      </div>

      {successMessage && (
        <div
          style={{
            padding: '0.9rem 1.25rem',
            backgroundColor: '#D1FAE5',
            color: '#065F46',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {successMessage}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '0.9rem 1.25rem',
            backgroundColor: '#FEE2E2',
            color: '#991B1B',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </div>
      )}

      {/* FILTER CONTROLS */}
      <div className="marketplace-controls-card" style={{ marginBottom: '1.75rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="vendor-form-input"
            style={{ flex: 1, minWidth: '240px' }}
            placeholder="Search vendor by business name, city, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="marketplace-btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
            Filter
          </button>
        </form>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`marketplace-cat-chip ${statusFilter === tab ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* VENDORS TABLE */}
      <div className="vendor-table-card">
        <div className="vendor-table-header">
          <div className="vendor-table-title">Merchant Applications</div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#D94700' }}>
              Loading applications...
            </div>
          </div>
        ) : vendors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#5F6368' }}>
            No vendor applications found matching the current filters.
          </div>
        ) : (
          <div className="vendor-table-wrap">
            <table className="vendor-table">
              <thead>
                <tr>
                  <th>Business / Applicant</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Products</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => {
                  const targetId = v.userId || (v as any)._id
                  const isProcessing = actionLoadingId === targetId
                  return (
                    <tr key={targetId}>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{v.businessName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#5F6368' }}>
                          {v.user ? `${v.user.firstName} ${v.user.lastName}` : v.email} &bull; {v.phone}
                        </div>
                        {v.adminNotes && (
                          <div style={{ fontSize: '0.75rem', color: '#B91C1C', marginTop: '0.2rem' }}>
                            Note: {v.adminNotes}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{v.category}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{v.city}, {v.state}</div>
                      </td>
                      <td>
                        <span
                          className={`vendor-sidebar-tag ${
                            v.status === 'APPROVED'
                              ? 'status-badge-approved'
                              : v.status === 'PENDING'
                              ? 'status-badge-pending'
                              : v.status === 'REJECTED'
                              ? 'status-badge-rejected'
                              : 'status-badge-suspended'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td>
                        <strong>{v.productCount || 0}</strong> items
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {v.status !== 'APPROVED' && (
                            <button
                              type="button"
                              className="btn-action-sm btn-action-approve"
                              disabled={isProcessing}
                              onClick={() => handleApprove(targetId, v.businessName)}
                            >
                              Approve
                            </button>
                          )}
                          {v.status !== 'REJECTED' && (
                            <button
                              type="button"
                              className="btn-action-sm btn-action-delete"
                              disabled={isProcessing}
                              onClick={() => handleReject(targetId, v.businessName)}
                            >
                              Reject
                            </button>
                          )}
                          {v.status === 'APPROVED' && (
                            <button
                              type="button"
                              className="btn-action-sm"
                              disabled={isProcessing}
                              onClick={() => handleSuspend(targetId, v.businessName)}
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminVendors
