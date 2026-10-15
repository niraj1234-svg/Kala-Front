import React, { useState, useEffect, useCallback } from 'react'
import {
  fetchAdminRegistrations,
  fetchAdminRegistrationById,
  retryAdminEmail,
  downloadAdminDesignathonCsv,
  fetchAdminDesignathonSettings,
  updateAdminDesignathonSettings,
} from '../../services/designathonApi'
import '../../styles/AdminDesignathon.css'

export const AdminDesignathon: React.FC = () => {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  })
  const [metrics, setMetrics] = useState({
    totalRegistrations: 0,
    confirmedCount: 0,
    paidCount: 0,
    pendingPaymentCount: 0,
    verifiedRevenue: 0,
  })

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Filters & Search
  const [search, setSearch] = useState<string>('')
  const [regStatus, setRegStatus] = useState<string>('all')
  const [payStatus, setPayStatus] = useState<string>('all')
  const [emailStatus, setEmailStatus] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // Detail Modal State
  const [selectedRegistration, setSelectedRegistration] = useState<any | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false)
  const [isRetryingEmail, setIsRetryingEmail] = useState<boolean>(false)
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)
  const [settingsForm, setSettingsForm] = useState({
    venue: '',
    eventFormat: '',
    judgingCriteria: '',
    submissionInstructions: '',
  })
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false)

  // Fetch registrations from backend
  const loadRegistrations = useCallback(
    async (pageToLoad = 1) => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetchAdminRegistrations({
          page: pageToLoad,
          limit: pagination.limit,
          search: search.trim() || undefined,
          registrationStatus: regStatus !== 'all' ? regStatus : undefined,
          paymentStatus: payStatus !== 'all' ? payStatus : undefined,
          emailStatus: emailStatus !== 'all' ? emailStatus : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        })

        if (res.success) {
          setRegistrations(res.registrations)
          setPagination(res.pagination)
          setMetrics(res.metrics)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load registrations.')
      } finally {
        setIsLoading(false)
      }
    },
    [pagination.limit, search, regStatus, payStatus, emailStatus, startDate, endDate]
  )

  useEffect(() => {
    loadRegistrations(1)
  }, [loadRegistrations])

  // Open Detail Modal
  const handleViewDetails = async (regId: string) => {
    setIsLoadingDetail(true)
    setActionFeedback(null)
    try {
      const res = await fetchAdminRegistrationById(regId)
      if (res.success && res.registration) {
        setSelectedRegistration(res.registration)
      }
    } catch (err: any) {
      alert(err.message || 'Could not fetch registration details.')
    } finally {
      setIsLoadingDetail(false)
    }
  }

  // Handle Retry Email
  const handleRetryEmail = async (regId: string) => {
    setIsRetryingEmail(true)
    setActionFeedback(null)
    try {
      const res = await retryAdminEmail(regId)
      setActionFeedback({
        type: res.success ? 'success' : 'error',
        message: res.message,
      })
      // Refresh current registration
      const updated = await fetchAdminRegistrationById(regId)
      if (updated.success) {
        setSelectedRegistration(updated.registration)
      }
      loadRegistrations(pagination.page)
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Email retry failed.',
      })
    } finally {
      setIsRetryingEmail(false)
    }
  }

  // Handle CSV Download
  const handleExportCsv = async () => {
    try {
      await downloadAdminDesignathonCsv()
    } catch (err: any) {
      alert(err.message || 'Failed to export CSV.')
    }
  }

  // Open Settings Modal
  const handleOpenSettings = async () => {
    try {
      const res = await fetchAdminDesignathonSettings()
      if (res.success && res.settings) {
        setSettingsForm({
          venue: res.settings.venue || '',
          eventFormat: res.settings.eventFormat || '',
          judgingCriteria: res.settings.judgingCriteria || '',
          submissionInstructions: res.settings.submissionInstructions || '',
        })
      }
      setIsSettingsOpen(true)
    } catch (err: any) {
      alert(err.message || 'Failed to load settings.')
    }
  }

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingSettings(true)
    try {
      const res = await updateAdminDesignathonSettings(settingsForm)
      if (res.success) {
        alert('Event settings updated successfully.')
        setIsSettingsOpen(false)
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save settings.')
    } finally {
      setIsSavingSettings(false)
    }
  }

  return (
    <div className="adm-dsn-page">
      {/* 1. TOP HEADER & CONTROLS */}
      <header className="adm-dsn-header">
        <div>
          <h1 className="adm-dsn-title">Designathon Registrations</h1>
          <p className="adm-dsn-subtitle">
            Manage participants, verify Razorpay payments, monitor confirmation emails &amp; audit history
          </p>
        </div>

        <div className="adm-dsn-header-actions">
          <button
            type="button"
            className="kala-btn adm-dsn-settings-btn"
            onClick={handleOpenSettings}
            title="Update pending event notices (venue, format, judging criteria)"
          >
            ⚙ Event Settings
          </button>
          <button
            type="button"
            className="kala-btn adm-dsn-export-btn"
            onClick={handleExportCsv}
            title="Download registrations CSV"
          >
            📥 Export CSV
          </button>
          <button
            type="button"
            className="kala-btn adm-dsn-refresh-btn"
            onClick={() => loadRegistrations(pagination.page)}
            title="Refresh records"
          >
            🔄 Refresh
          </button>
        </div>
      </header>

      {/* 2. SUMMARY METRICS STRIP */}
      <div className="adm-dsn-metrics-grid" role="region" aria-label="Registration statistics">
        <div className="adm-metric-card">
          <span className="adm-metric-label">TOTAL REGISTRATIONS</span>
          <span className="adm-metric-val">{metrics.totalRegistrations}</span>
          <span className="adm-metric-sub">Submitted entries</span>
        </div>

        <div className="adm-metric-card">
          <span className="adm-metric-label">CONFIRMED (PAID)</span>
          <span className="adm-metric-val green">{metrics.confirmedCount}</span>
          <span className="adm-metric-sub">Verified payments</span>
        </div>

        <div className="adm-metric-card">
          <span className="adm-metric-label">PENDING PAYMENT</span>
          <span className="adm-metric-val amber">{metrics.pendingPaymentCount}</span>
          <span className="adm-metric-sub">Uncompleted checkouts</span>
        </div>

        <div className="adm-metric-card">
          <span className="adm-metric-label">VERIFIED REVENUE</span>
          <span className="adm-metric-val orange">₹{metrics.verifiedRevenue.toLocaleString('en-IN')}</span>
          <span className="adm-metric-sub">₹49 per participant</span>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS BAR */}
      <div className="adm-dsn-filter-bar">
        <div className="adm-filter-search">
          <input
            type="text"
            className="adm-filter-input"
            placeholder="Search by name, ID (e.g. KALA-DSN-...), email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="adm-filter-group">
          <label className="adm-filter-lbl">Reg Status:</label>
          <select
            className="adm-filter-select"
            value={regStatus}
            onChange={(e) => setRegStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="payment_failed">Payment Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="adm-filter-group">
          <label className="adm-filter-lbl">Payment:</label>
          <select
            className="adm-filter-select"
            value={payStatus}
            onChange={(e) => setPayStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div className="adm-filter-group">
          <label className="adm-filter-lbl">Email Status:</label>
          <select
            className="adm-filter-select"
            value={emailStatus}
            onChange={(e) => setEmailStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="sent">Sent</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="not_sent">Not Sent</option>
          </select>
        </div>

        <div className="adm-filter-group">
          <label className="adm-filter-lbl">From:</label>
          <input
            type="date"
            className="adm-filter-input date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="adm-filter-group">
          <label className="adm-filter-lbl">To:</label>
          <input
            type="date"
            className="adm-filter-input date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* 4. REGISTRATIONS TABLE */}
      <div className="adm-dsn-table-card">
        {error && (
          <div className="adm-table-error-banner" role="alert">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="adm-table-loading">Loading Designathon registrations...</div>
        ) : registrations.length === 0 ? (
          <div className="adm-table-empty">No registrations found matching the selected criteria.</div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-dsn-table">
              <thead>
                <tr>
                  <th>REG ID</th>
                  <th>PARTICIPANT</th>
                  <th>COLLEGE &amp; DEPT</th>
                  <th>CONTACT</th>
                  <th>REG STATUS</th>
                  <th>PAYMENT</th>
                  <th>RAZORPAY REF</th>
                  <th>EMAIL</th>
                  <th>DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.registrationId}>
                    <td>
                      <button
                        type="button"
                        className="adm-regid-btn"
                        onClick={() => handleViewDetails(reg.registrationId)}
                        title="Click to view details"
                      >
                        {reg.registrationId}
                      </button>
                    </td>

                    <td>
                      <div className="adm-cell-name">{reg.fullName}</div>
                      <div className="adm-cell-sub">Individual Entry</div>
                    </td>

                    <td>
                      <div className="adm-cell-college" title={reg.collegeName}>
                        {reg.collegeName}
                      </div>
                      <div className="adm-cell-sub">
                        {reg.department} • {reg.currentYearSemester}
                      </div>
                    </td>

                    <td>
                      <div className="adm-cell-email">{reg.email}</div>
                      <div className="adm-cell-sub">{reg.whatsappNumber}</div>
                    </td>

                    <td>
                      <span className={`adm-badge reg-${reg.registrationStatus}`}>
                        {reg.registrationStatus.replace('_', ' ')}
                      </span>
                    </td>

                    <td>
                      <span className={`adm-badge pay-${reg.paymentStatus}`}>
                        {reg.paymentStatus} (₹{reg.feeRupees})
                      </span>
                    </td>

                    <td>
                      <div className="adm-cell-payref" title={reg.razorpayPaymentId || reg.razorpayOrderId}>
                        {reg.razorpayPaymentId ? (
                          <span className="pay-id">{reg.razorpayPaymentId}</span>
                        ) : reg.razorpayOrderId ? (
                          <span className="ord-id">{reg.razorpayOrderId}</span>
                        ) : (
                          <span className="none">—</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className={`adm-badge email-${reg.emailStatus}`}>
                        {reg.emailStatus}
                      </span>
                    </td>

                    <td>
                      <div className="adm-cell-date">
                        {new Date(reg.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="adm-cell-sub">
                        {new Date(reg.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="adm-action-link-btn"
                        onClick={() => handleViewDetails(reg.registrationId)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        <div className="adm-dsn-pagination">
          <span className="adm-pagination-info">
            Showing Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} entries)
          </span>

          <div className="adm-pagination-btns">
            <button
              type="button"
              className="kala-btn adm-page-btn"
              disabled={pagination.page <= 1}
              onClick={() => loadRegistrations(pagination.page - 1)}
            >
              ← Previous
            </button>
            <button
              type="button"
              className="kala-btn adm-page-btn"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadRegistrations(pagination.page + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* 5. REGISTRATION DETAIL MODAL */}
      {isLoadingDetail && (
        <div className="adm-modal-backdrop">
          <div className="adm-modal-card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '400px' }}>
            <div className="adm-table-loading">Loading registration details...</div>
          </div>
        </div>
      )}

      {selectedRegistration && (
        <div className="adm-modal-backdrop" onClick={() => setSelectedRegistration(null)} aria-hidden="true">
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <span className="adm-modal-regid">{selectedRegistration.registrationId}</span>
                <h2 className="adm-modal-title">{selectedRegistration.fullName}</h2>
              </div>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setSelectedRegistration(null)}
                aria-label="Close detail modal"
              >
                ✕
              </button>
            </div>

            {actionFeedback && (
              <div className={`adm-feedback-banner ${actionFeedback.type}`} role="alert">
                {actionFeedback.message}
              </div>
            )}

            <div className="adm-modal-body">
              {/* Participant Information */}
              <div className="adm-detail-section">
                <h4 className="adm-detail-section-title">Participant Information</h4>
                <div className="adm-detail-grid">
                  <div className="adm-detail-item">
                    <span className="adm-detail-lbl">Full Name</span>
                    <span className="adm-detail-val">{selectedRegistration.fullName}</span>
                  </div>
                  <div className="adm-detail-item">
                    <span className="adm-detail-lbl">College</span>
                    <span className="adm-detail-val">{selectedRegistration.collegeName}</span>
                  </div>
                  <div className="adm-detail-item">
                    <span className="adm-detail-lbl">Department</span>
                    <span className="adm-detail-val">{selectedRegistration.department}</span>
                  </div>
                  <div className="adm-detail-item">
                    <span className="adm-detail-lbl">Year / Semester</span>
                    <span className="adm-detail-val">{selectedRegistration.currentYearSemester}</span>
                  </div>
                  <div className="adm-detail-item">
                    <span className="adm-detail-lbl">Gmail</span>
                    <span className="adm-detail-val">{selectedRegistration.email}</span>
                  </div>
                  <div className="adm-detail-item">
                    <span className="adm-detail-lbl">WhatsApp Number</span>
                    <span className="adm-detail-val">{selectedRegistration.whatsappNumber}</span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="adm-detail-section">
                <h4 className="adm-detail-section-title">Payment &amp; Razorpay Status</h4>
                <div className="adm-detail-grid">
                  <div className="adm-detail-item">
                    <span className="adm-detail-lbl">Registration Status</span>
                    <span className={`adm-badge reg-${selectedRegistration.registrationStatus}`}>
                      {selectedRegistration.registrationStatus}
                    </span>
                  </div>
                  <div className="adm-detail-item">
                    <span className="adm-detail-lbl">Payment Status</span>
                    <span className={`adm-badge pay-${selectedRegistration.paymentStatus}`}>
                      {selectedRegistration.paymentStatus}
                    </span>
                  </div>
                  <div className="adm-detail-item">
                    <span className="adm-detail-lbl">Amount</span>
                    <span className="adm-detail-val">₹{selectedRegistration.feeRupees} ({selectedRegistration.feePaise} paise)</span>
                  </div>
                  <div className="adm-detail-item">
                    <span className="adm-detail-lbl">Verified Amount</span>
                    <span className="adm-detail-val">
                      {selectedRegistration.verifiedAmountPaise ? `₹${selectedRegistration.verifiedAmountPaise / 100}` : '—'}
                    </span>
                  </div>
                  <div className="adm-detail-item">
                    <span className="adm-detail-lbl">Razorpay Order ID</span>
                    <span className="adm-detail-val font-mono">{selectedRegistration.razorpayOrderId || '—'}</span>
                  </div>
                  <div className="adm-detail-item">
                    <span className="adm-detail-lbl">Razorpay Payment ID</span>
                    <span className="adm-detail-val font-mono">{selectedRegistration.razorpayPaymentId || '—'}</span>
                  </div>
                  <div className="adm-detail-item">
                    <span className="adm-detail-lbl">Payment Verified At</span>
                    <span className="adm-detail-val">
                      {selectedRegistration.paymentVerifiedAt
                        ? new Date(selectedRegistration.paymentVerifiedAt).toLocaleString('en-IN')
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirmation Email Details */}
              <div className="adm-detail-section">
                <div className="adm-section-header-inline">
                  <h4 className="adm-detail-section-title">Confirmation Email Delivery</h4>
                  {selectedRegistration.paymentStatus === 'paid' && (
                    <button
                      type="button"
                      className="kala-btn adm-retry-email-btn"
                      disabled={isRetryingEmail}
                      onClick={() => handleRetryEmail(selectedRegistration.registrationId)}
                    >
                      {isRetryingEmail ? 'Sending...' : '↻ Retry Email'}
                    </button>
                  )}
                </div>

                <div className="adm-detail-grid">
                  <div className="adm-detail-item">
                    <span className="adm-detail-lbl">Email Status</span>
                    <span className={`adm-badge email-${selectedRegistration.emailStatus}`}>
                      {selectedRegistration.emailStatus}
                    </span>
                  </div>
                  <div className="adm-detail-item">
                    <span className="adm-detail-lbl">Delivery Attempts</span>
                    <span className="adm-detail-val">{selectedRegistration.emailAttempts || 0}</span>
                  </div>
                  <div className="adm-detail-item">
                    <span className="adm-detail-lbl">Sent Timestamp</span>
                    <span className="adm-detail-val">
                      {selectedRegistration.emailSentAt
                        ? new Date(selectedRegistration.emailSentAt).toLocaleString('en-IN')
                        : '—'}
                    </span>
                  </div>
                  {selectedRegistration.emailFailureReason && (
                    <div className="adm-detail-item full-width">
                      <span className="adm-detail-lbl">Failure Details</span>
                      <span className="adm-detail-error">{selectedRegistration.emailFailureReason}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Audit History Timeline */}
              <div className="adm-detail-section">
                <h4 className="adm-detail-section-title">Auditable Event History</h4>
                <div className="adm-audit-timeline">
                  {selectedRegistration.auditHistory && selectedRegistration.auditHistory.length > 0 ? (
                    selectedRegistration.auditHistory.map((item: any, idx: number) => (
                      <div key={idx} className="adm-audit-entry">
                        <div className="adm-audit-dot" />
                        <div className="adm-audit-content">
                          <div className="adm-audit-action">{item.action}</div>
                          <div className="adm-audit-meta">
                            By <strong>{item.actor}</strong> •{' '}
                            {new Date(item.timestamp).toLocaleString('en-IN')}
                          </div>
                          {item.details && Object.keys(item.details).length > 0 && (
                            <pre className="adm-audit-json">{JSON.stringify(item.details, null, 2)}</pre>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="adm-audit-empty">No audit history entries recorded.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="kala-btn adm-modal-close"
                onClick={() => setSelectedRegistration(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsSettingsOpen(false)} aria-hidden="true">
          <div className="adm-modal-card settings" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">Designathon Settings &amp; Pending Details</h2>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setIsSettingsOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="adm-settings-form">
              <div className="adm-form-group">
                <label className="adm-form-lbl">Venue (Keep "To be announced" until finalized):</label>
                <input
                  type="text"
                  className="adm-filter-input"
                  value={settingsForm.venue}
                  onChange={(e) => setSettingsForm({ ...settingsForm, venue: e.target.value })}
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-lbl">Event Format Details:</label>
                <input
                  type="text"
                  className="adm-filter-input"
                  value={settingsForm.eventFormat}
                  onChange={(e) => setSettingsForm({ ...settingsForm, eventFormat: e.target.value })}
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-lbl">Judging Criteria Details:</label>
                <input
                  type="text"
                  className="adm-filter-input"
                  value={settingsForm.judgingCriteria}
                  onChange={(e) => setSettingsForm({ ...settingsForm, judgingCriteria: e.target.value })}
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-lbl">Design Submission Instructions:</label>
                <input
                  type="text"
                  className="adm-filter-input"
                  value={settingsForm.submissionInstructions}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, submissionInstructions: e.target.value })
                  }
                />
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="kala-btn adm-modal-cancel"
                  onClick={() => setIsSettingsOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="kala-btn adm-modal-save"
                  disabled={isSavingSettings}
                >
                  {isSavingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDesignathon
