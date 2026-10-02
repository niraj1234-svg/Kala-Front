import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCustomerOrders, type BackendOrder } from '../services/customerApi'
import { OrderCard } from '../components/order/OrderCard'
import '../styles/OrderDetails.css'

export const Orders: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [orders, setOrders] = useState<BackendOrder[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  const loadOrders = async () => {
    try {
      setErrorMessage(null)
      const data = await getCustomerOrders()
      setOrders(data)
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to load orders right now.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (!isAuthLoading) {
      if (isAuthenticated) {
        loadOrders()
      } else {
        setIsLoading(false)
      }
    }
  }, [isAuthenticated, isAuthLoading])

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadOrders()
  }

  if (isAuthLoading || isLoading) {
    return (
      <main className="kala-order-details-page">
        <div className="kala-order-details-container">
          <div className="kala-order-loading-box">
            <div className="kala-order-spinner" />
            <div className="kala-order-loading-text">Loading your orders...</div>
          </div>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="kala-order-details-page">
        <div className="kala-order-details-container">
          <div className="kala-order-error-box">
            <div className="kala-order-error-icon">🔒</div>
            <h1 className="kala-order-error-title">My Orders</h1>
            <p className="kala-order-error-msg">
              Please sign in with your email to view your order history, invoices, and shipment tracking.
            </p>
            <Link to="/account?redirect=/orders" className="kala-btn kala-btn-primary">
              Log In to View Orders
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="kala-order-details-page">
      <div className="kala-order-details-container">
        {/* Page Header */}
        <div className="kala-orders-header-row">
          <div>
            <h1 className="kala-orders-title">MY ORDERS ({orders.length})</h1>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              Track active shipments and review your purchase history.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="kala-btn kala-btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
            >
              {isRefreshing ? 'REFRESHING...' : '↻ REFRESH'}
            </button>
            <Link
              to="/shop"
              className="kala-btn kala-btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.45rem 1rem' }}
            >
              SHOP MORE
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              padding: '1rem',
              marginBottom: '1.5rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '0.875rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{errorMessage}</span>
            <button
              onClick={loadOrders}
              style={{ fontWeight: 700, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b' }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Orders List or Empty State */}
        {orders.length === 0 ? (
          <div className="kala-order-card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📦</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', color: '#111111', marginBottom: '0.5rem' }}>
              No Orders Found
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
              You haven't placed any orders yet. Discover our latest oversized tees and custom apparel.
            </p>
            <Link to="/shop" className="kala-btn kala-btn-primary">
              EXPLORE COLLECTION
            </Link>
          </div>
        ) : (
          <div>
            {orders.map((order) => (
              <OrderCard key={order.orderId} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default Orders
