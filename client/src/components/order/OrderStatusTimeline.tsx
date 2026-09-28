import React from 'react'
import type { BackendOrder, OrderStatusHistoryItem } from '../../services/orderApi'

interface OrderStatusTimelineProps {
  order: BackendOrder
  onRefresh?: () => void
  isRefreshing?: boolean
}

interface MilestoneDef {
  key: string
  label: string
  description: string
}

const ORDER_MILESTONES: MilestoneDef[] = [
  { key: 'confirmed', label: 'Order Confirmed', description: 'Order & payment confirmed' },
  { key: 'processing', label: 'Processing', description: 'Order is being prepared' },
  { key: 'packed', label: 'Packed', description: 'Items securely packed & ready' },
  { key: 'shipped', label: 'Shipped', description: 'Handed over to delivery carrier' },
  { key: 'out_for_delivery', label: 'Out for Delivery', description: 'Package is out with courier' },
  { key: 'delivered', label: 'Delivered', description: 'Package delivered to address' },
]

const PROGRESSION_KEYS = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered']

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  order,
  onRefresh,
  isRefreshing = false,
}) => {
  const currentStatus = (order.status || 'pending').toLowerCase()
  const isCancelled = currentStatus === 'cancelled'

  // Map 'pending' to 'confirmed' for display purposes if payment is paid
  const effectiveCurrentIndex = PROGRESSION_KEYS.indexOf(
    currentStatus === 'pending' && order.payment?.status === 'paid' ? 'confirmed' : currentStatus
  )

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

  // Find latest history entry for a status
  const getHistoryForStatus = (statusKey: string): OrderStatusHistoryItem | undefined => {
    if (!order.statusHistory || !Array.isArray(order.statusHistory)) return undefined
    const matches = order.statusHistory.filter(
      (h) => (h.status || '').toLowerCase() === statusKey.toLowerCase()
    )
    return matches[matches.length - 1]
  }

  const cancellationHistory = getHistoryForStatus('cancelled')

  return (
    <div className="bg-white border border-[#222222] rounded-none p-5 sm:p-7 text-[#111111] my-4 shadow-sm">
      {/* Header bar with Status Badge & Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#E5E5E5]">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-[#777777] uppercase block">
            Current Order Status
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                isCancelled
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : currentStatus === 'delivered'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-[#D94700]/10 text-[#D94700] border border-[#D94700]/30'
              }`}
            >
              {isCancelled
                ? 'Cancelled'
                : ORDER_MILESTONES.find((m) => m.key === currentStatus)?.label || currentStatus.replace(/_/g, ' ')}
            </span>
            {order.payment?.status && (
              <span
                className={`inline-flex items-center px-2.5 py-1 text-xs font-medium tracking-wide uppercase ${
                  order.payment.status === 'paid'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                Payment: {order.payment.status}
              </span>
            )}
          </div>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#111111] bg-[#F5F5F5] hover:bg-[#EAEAEA] border border-[#CCCCCC] transition-colors disabled:opacity-60"
            title="Refresh order status"
          >
            <svg
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Status'}</span>
          </button>
        )}
      </div>

      {/* Cancellation Notice if Cancelled */}
      {isCancelled ? (
        <div className="mt-5 p-4 bg-red-50 border border-red-200 text-red-900">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-semibold text-sm">This order has been cancelled.</p>
              {cancellationHistory?.changedAt && (
                <p className="text-xs text-red-700 mt-1">
                  Cancelled on: {formatTimestamp(cancellationHistory.changedAt)}
                </p>
              )}
              {cancellationHistory?.note && (
                <p className="text-xs text-red-800 mt-1 bg-white/70 p-2 border border-red-100 font-mono">
                  {cancellationHistory.note}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Status Progression Milestones */
        <div className="mt-6">
          <div className="relative">
            {ORDER_MILESTONES.map((milestone, idx) => {
              const milestoneIndex = PROGRESSION_KEYS.indexOf(milestone.key)
              const isPast = effectiveCurrentIndex > milestoneIndex
              const isCurrent = effectiveCurrentIndex === milestoneIndex
              const history = getHistoryForStatus(milestone.key)
              const isLast = idx === ORDER_MILESTONES.length - 1

              return (
                <div key={milestone.key} className="relative flex items-start gap-4 pb-6 last:pb-0">
                  {/* Connecting Line between milestones */}
                  {!isLast && (
                    <div
                      className={`absolute left-[13px] top-[26px] bottom-0 w-[2px] ${
                        isPast ? 'bg-[#D94700]' : 'bg-[#E5E5E5]'
                      }`}
                      aria-hidden="true"
                    />
                  )}

                  {/* Indicator Dot / Icon */}
                  <div className="relative z-10 shrink-0 mt-0.5">
                    {isPast ? (
                      <div className="w-7 h-7 rounded-full bg-[#D94700] text-white flex items-center justify-center shadow-sm">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    ) : isCurrent ? (
                      <div className="w-7 h-7 rounded-full border-2 border-[#D94700] bg-white flex items-center justify-center ring-4 ring-[#D94700]/20">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#D94700]" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full border border-[#D1D5DB] bg-[#F9FAFB] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#D1D5DB]" />
                      </div>
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p
                        className={`text-sm font-semibold tracking-wide ${
                          isCurrent
                            ? 'text-[#D94700]'
                            : isPast
                            ? 'text-[#111111]'
                            : 'text-[#888888]'
                        }`}
                      >
                        {milestone.label}
                        {isCurrent && (
                          <span className="ml-2 inline-block text-[10px] font-mono uppercase px-2 py-0.5 bg-[#D94700]/10 text-[#D94700] border border-[#D94700]/20">
                            Current
                          </span>
                        )}
                      </p>

                      {/* Timestamp if reached */}
                      {history?.changedAt && (isPast || isCurrent) && (
                        <span className="text-xs font-mono text-[#777777]">
                          {formatTimestamp(history.changedAt)}
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-xs mt-0.5 ${
                        isCurrent ? 'text-[#333333]' : isPast ? 'text-[#666666]' : 'text-[#AAAAAA]'
                      }`}
                    >
                      {milestone.description}
                    </p>

                    {/* Note if recorded for this milestone */}
                    {history?.note && (isPast || isCurrent) && (
                      <p className="mt-1 text-xs font-mono text-[#555555] bg-[#F8F8F8] px-2.5 py-1 border-l-2 border-[#D94700]">
                        {history.note}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Courier & Tracking Details if present */}
      {order.tracking?.trackingNumber && (
        <div className="mt-6 pt-5 border-t border-[#E5E5E5] flex flex-wrap items-center justify-between gap-3 bg-[#FAFAFA] p-3.5 border border-[#EEEEEE]">
          <div>
            <span className="text-[11px] font-mono uppercase text-[#777777] block">
              Carrier &amp; Tracking
            </span>
            <div className="text-xs font-semibold text-[#111111] mt-0.5">
              {order.tracking.carrier || 'Courier Partner'}:{' '}
              <span className="font-mono text-[#D94700]">{order.tracking.trackingNumber}</span>
            </div>
          </div>
          {order.tracking.updatedAt && (
            <span className="text-[11px] font-mono text-[#777777]">
              Updated: {formatTimestamp(order.tracking.updatedAt)}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default OrderStatusTimeline
