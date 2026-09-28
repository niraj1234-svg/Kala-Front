import React from 'react'
import { Link } from 'react-router-dom'
import type { BackendOrder } from '../../services/orderApi'

interface OrderCardProps {
  order: BackendOrder
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const formatINR = (amt: number): string => `₹${Math.round(amt).toLocaleString('en-IN')}`

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return ''
    }
  }

  const statusLabel = (st: string): string => {
    const map: Record<string, string> = {
      pending: 'Order Placed',
      confirmed: 'Confirmed',
      processing: 'Processing',
      packed: 'Packed',
      shipped: 'Shipped',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    }
    return map[st.toLowerCase()] || st.replace(/_/g, ' ')
  }

  const isCancelled = order.status?.toLowerCase() === 'cancelled'
  const isDelivered = order.status?.toLowerCase() === 'delivered'
  const totalQuantity = (order.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0)

  return (
    <div className="bg-white border border-[#222222] p-5 sm:p-6 transition-all hover:border-[#D94700]">
      {/* Top Bar: Order ID, Date, Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EEEEEE]">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-[#777777] uppercase block">
            Order Reference
          </span>
          <span className="text-sm font-bold font-mono text-[#111111]">{order.orderId}</span>
          <span className="text-xs text-[#666666] ml-2 block sm:inline">
            Placed on {formatDate(order.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {order.payment?.status && (
            <span
              className={`text-[11px] font-semibold font-mono uppercase px-2 py-0.5 border ${
                order.payment.status === 'paid'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {order.payment.status}
            </span>
          )}

          <span
            className={`text-xs font-semibold uppercase px-2.5 py-0.5 border tracking-wider ${
              isCancelled
                ? 'bg-red-50 text-red-700 border-red-200'
                : isDelivered
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-[#D94700]/10 text-[#D94700] border-[#D94700]/30'
            }`}
          >
            {statusLabel(order.status)}
          </span>
        </div>
      </div>

      {/* Items Preview */}
      <div className="py-4 space-y-3">
        {(order.items || []).map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 min-w-0">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 object-cover border border-[#E5E5E5] shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="font-semibold text-[#111111] truncate">{item.name}</p>
                <p className="text-[#666666] text-[11px] mt-0.5">
                  Size: <span className="font-semibold">{item.size}</span>
                  {item.color && (
                    <>
                      {' '}
                      • Color: <span className="font-semibold">{item.color}</span>
                    </>
                  )}
                  {item.customization?.backText && (
                    <>
                      {' '}
                      • Custom Back: "{item.customization.backText}"
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[#777777] block">Qty: {item.quantity}</span>
              <span className="font-semibold text-[#111111] font-mono">
                {formatINR((item.price || 0) * (item.quantity || 1))}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer: Total & View Details Button */}
      <div className="pt-4 border-t border-[#EEEEEE] flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-[#777777] uppercase block font-mono">
            {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} • Total Amount
          </span>
          <span className="text-base font-bold text-[#111111] font-mono">
            {formatINR(order.pricing?.total || 0)}
          </span>
        </div>

        <Link
          to={`/orders/${order.orderId}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#111111] hover:bg-[#D94700] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          <span>View Details</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

export default OrderCard
