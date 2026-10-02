import React from 'react'
import { Link } from 'react-router-dom'
import type { BackendOrder } from '../../services/orderApi'
import '../../styles/OrderDetails.css'

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

  const resolveImageUrl = (img?: string): string => {
    if (!img) return ''
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:') || img.startsWith('/')) {
      return img
    }
    return `/${img}`
  }

  const isCancelled = order.status?.toLowerCase() === 'cancelled'
  const isDelivered = order.status?.toLowerCase() === 'delivered'
  const isPaid = order.payment?.status === 'paid'
  const totalQuantity = (order.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0)

  return (
    <article className="kala-order-card-preview">
      {/* Top Bar: Order ID, Date, Status */}
      <div className="kala-order-card-preview-top">
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280' }}>
            ORDER REFERENCE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
            <span style={{ fontFamily: 'var(--kala-font-mono, monospace)', fontWeight: 800, fontSize: '0.95rem', color: '#111111' }}>
              #{order.orderId}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              • {formatDate(order.createdAt)}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className={`kala-badge ${isPaid ? 'kala-badge-payment-paid' : 'kala-badge-payment-pending'}`}>
            {isPaid ? 'PAID' : order.payment?.status?.toUpperCase() || 'PENDING'}
          </span>

          <span
            className={`kala-badge kala-badge-status ${
              isCancelled
                ? 'cancelled'
                : isDelivered
                ? 'delivered'
                : (order.status || 'pending').toLowerCase()
            }`}
          >
            {(order.status || 'pending').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Items Preview */}
      <div className="kala-order-card-preview-items">
        {(order.items || []).map((item, idx) => {
          const imgUrl = resolveImageUrl(item.image)
          return (
            <div key={idx} className="kala-order-card-preview-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={item.name}
                    style={{ width: '48px', height: '52px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e5e7eb', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: '48px', height: '52px', backgroundColor: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                    👕
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#111111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.15rem' }}>
                    Size: <strong>{item.size}</strong> {item.color && <>• Color: <strong>{item.color}</strong></>} • Qty: <strong>{item.quantity}</strong>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0, fontFamily: 'var(--kala-font-mono, monospace)', fontWeight: 700, color: '#111111' }}>
                {formatINR((item.price || 0) * (item.quantity || 1))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer: Total & View Details Button */}
      <div className="kala-order-card-preview-bottom">
        <div>
          <div style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {totalQuantity} {totalQuantity === 1 ? 'ITEM' : 'ITEMS'} • TOTAL PAID
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 900, fontFamily: 'var(--kala-font-mono, monospace)', color: 'var(--kala-orange, #D94700)' }}>
            {formatINR(order.pricing?.total || 0)}
          </div>
        </div>

        <Link
          to={`/account/orders/${order.orderId}`}
          className="kala-btn kala-btn-secondary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
        >
          VIEW ORDER DETAILS →
        </Link>
      </div>
    </article>
  )
}

export default OrderCard
