import React, { useState } from 'react'
import type { BackendOrder, OrderStatusHistoryItem } from '../../services/orderApi'
import '../../styles/OrderTracking.css'

interface OrderTrackingTimelineProps {
  order: BackendOrder
  onRefresh?: () => void
  isRefreshing?: boolean
}

interface MilestoneDef {
  key: string
  label: string
}

const MILESTONES: MilestoneDef[] = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
]

const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

export const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({
  order,
  onRefresh,
  isRefreshing = false,
}) => {
  const [copied, setCopied] = useState<boolean>(false)

  const normalizedStatus = (order.status || 'pending').toLowerCase()
  const isCancelled = normalizedStatus === 'cancelled'

  const formatTimestamp = (dateStr?: string): string => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return ''
      return d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const handleCopyTracking = async (trackingNum: string) => {
    if (!trackingNum) return
    let copiedSuccess = false
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(trackingNum)
        copiedSuccess = true
      }
    } catch {
      // Clipboard API restricted or document not focused
    }

    if (!copiedSuccess) {
      try {
        const textArea = document.createElement('textarea')
        textArea.value = trackingNum
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        copiedSuccess = true
      } catch {
        // Fallback execution
      }
    }

    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Find history entry for each status
  const getHistoryEntry = (statusKey: string): OrderStatusHistoryItem | undefined => {
    if (!order.statusHistory || !Array.isArray(order.statusHistory)) {
      return undefined
    }
    // Return latest history entry for this status
    const matching = order.statusHistory.filter(
      (h) => (h.status || '').toLowerCase() === statusKey.toLowerCase()
    )
    return matching[matching.length - 1]
  }

  const cancellationEntry = getHistoryEntry('cancelled')

  // Calculate milestone index
  const currentIndex = STATUS_ORDER.indexOf(normalizedStatus)
  const trackFillPercent = isCancelled
    ? 0
    : currentIndex >= 0
    ? Math.round((currentIndex / (STATUS_ORDER.length - 1)) * 100)
    : 0

  const statusLabel =
    normalizedStatus === 'pending'
      ? 'Pending'
      : normalizedStatus === 'confirmed'
      ? 'Confirmed'
      : normalizedStatus === 'processing'
      ? 'Processing'
      : normalizedStatus === 'shipped'
      ? 'Shipped'
      : normalizedStatus === 'delivered'
      ? 'Delivered'
      : normalizedStatus === 'cancelled'
      ? 'Cancelled'
      : order.status.toUpperCase()

  const hasTrackingNumber = Boolean(order.tracking?.trackingNumber?.trim())
  const hasCarrier = Boolean(order.tracking?.carrier?.trim())
  const hasTrackingInfo = hasTrackingNumber || hasCarrier

  return (
    <section className="kala-tracking-card" aria-label="Order Tracking and Fulfillment Status">
      {/* Top Bar: Title & Current Status Badge */}
      <div className="kala-tracking-topbar">
        <div className="kala-tracking-title-wrap">
          <span className="kala-tracking-tag">Live Fulfillment Status</span>
          <h2 className="kala-tracking-title">Track Order</h2>
        </div>

        <div className="kala-tracking-controls">
          <span
            className={`kala-status-badge ${normalizedStatus}`}
            aria-label={`Current order status: ${statusLabel}`}
          >
            {statusLabel}
          </span>

          {onRefresh && (
            <button
              type="button"
              className="kala-tracking-refresh-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh order status"
              title="Refresh order status from server"
            >
              <span aria-hidden="true">{isRefreshing ? '⟳' : '↻'}</span>
              <span>{isRefreshing ? 'REFRESHING...' : 'REFRESH'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Cancelled Notice (Represented Separately) */}
      {isCancelled && (
        <div className="kala-cancelled-alert" role="alert">
          <div className="kala-cancelled-icon" aria-hidden="true">
            ✕
          </div>
          <div>
            <h3 className="kala-cancelled-title">Order Cancelled</h3>
            <p className="kala-cancelled-desc">
              {cancellationEntry?.note ||
                'This order was cancelled. Please contact customer care if you have any questions.'}
              {cancellationEntry?.changedAt && (
                <> · Cancelled on {formatTimestamp(cancellationEntry.changedAt)}</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Fulfillment Sequence Timeline Stepper */}
      <div className="kala-timeline-wrap">
        <div className="kala-timeline-stepper" role="list">
          {/* Background Connecting Track */}
          <div className="kala-timeline-track" aria-hidden="true">
            <div
              className="kala-timeline-track-fill"
              style={{ width: `${trackFillPercent}%` }}
            />
          </div>

          {MILESTONES.map((milestone, idx) => {
            const historyItem = getHistoryEntry(milestone.key)

            // Determine step state
            let isCompleted = false
            let isCurrent = false

            if (!isCancelled && currentIndex >= 0) {
              if (idx < currentIndex) {
                isCompleted = true
              } else if (idx === currentIndex) {
                isCurrent = true
              }
            } else if (isCancelled) {
              // For cancelled orders, steps with history entries prior to cancellation are completed
              if (historyItem) {
                isCompleted = true
              }
            }

            const stepClass = isCompleted
              ? 'completed'
              : isCurrent
              ? 'current'
              : 'upcoming'

            const timestamp = historyItem?.changedAt
              ? formatTimestamp(historyItem.changedAt)
              : ''

            return (
              <div
                key={milestone.key}
                className={`kala-timeline-step ${stepClass}`}
                role="listitem"
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div className="kala-timeline-node" aria-hidden="true">
                  {isCompleted ? '✓' : isCurrent ? '●' : '○'}
                </div>

                <div className="kala-timeline-step-info">
                  <div className="kala-timeline-step-label">{milestone.label}</div>
                  {timestamp && (
                    <div className="kala-timeline-step-time">{timestamp}</div>
                  )}
                  {historyItem?.note && (
                    <div className="kala-timeline-step-note">{historyItem.note}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Shipping / Logistics Information Card */}
      <div className="kala-shipping-card" aria-labelledby="shipping-info-heading">
        <h3 id="shipping-info-heading" className="kala-shipping-title">
          <span>📦</span> Shipping Information
        </h3>

        {hasTrackingInfo ? (
          <div className="kala-shipping-grid">
            <div>
              <div className="kala-shipping-field-label">Carrier</div>
              <div className="kala-shipping-field-val">
                {order.tracking?.carrier || 'Standard Courier'}
              </div>
            </div>

            <div>
              <div className="kala-shipping-field-label">Tracking Number</div>
              <div className="kala-shipping-field-val">
                {hasTrackingNumber ? (
                  <div className="kala-tracking-num-wrap">
                    <span className="kala-tracking-code">
                      {order.tracking!.trackingNumber}
                    </span>
                    <button
                      type="button"
                      className={`kala-copy-btn ${copied ? 'copied' : ''}`}
                      onClick={() => handleCopyTracking(order.tracking!.trackingNumber!)}
                      aria-label={
                        copied
                          ? 'Tracking number copied to clipboard'
                          : 'Copy tracking number'
                      }
                    >
                      {copied ? 'Copied ✓' : 'Copy'}
                    </button>
                  </div>
                ) : (
                  <span style={{ color: '#9ca3af' }}>Pending Assignment</span>
                )}
              </div>
            </div>

            <div>
              <div className="kala-shipping-field-label">Last Updated</div>
              <div className="kala-shipping-field-val" style={{ fontSize: '0.875rem' }}>
                {order.tracking?.updatedAt
                  ? formatTimestamp(order.tracking.updatedAt)
                  : formatTimestamp(order.updatedAt || order.createdAt)}
              </div>
            </div>
          </div>
        ) : (
          <p className="kala-shipping-empty-note">
            Tracking information will appear once your order is shipped.
          </p>
        )}
      </div>
    </section>
  )
}

export default OrderTrackingTimeline
