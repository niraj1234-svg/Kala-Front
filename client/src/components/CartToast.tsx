import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/CartToast.css'

export const CartToast: React.FC = () => {
  const [toast, setToast] = useState<{ id: number; productName: string } | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ productName: string }>
      const productName = customEvent.detail?.productName || 'Item'
      const id = Date.now()

      setToast({ id, productName })

      clearTimeout(timer)
      timer = setTimeout(() => {
        setToast(null)
      }, 4000)
    }

    window.addEventListener('kala:cart-toast', handleToast)
    return () => {
      window.removeEventListener('kala:cart-toast', handleToast)
      clearTimeout(timer)
    }
  }, [])

  if (!toast) return null

  return (
    <aside
      key={toast.id}
      className="kala-cart-toast"
      role="status"
      aria-live="polite"
      aria-label="Item added to cart notification"
    >
      <div className="kala-cart-toast-icon" aria-hidden="true">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div className="kala-cart-toast-content">
        <span className="kala-cart-toast-title">Added to cart!</span>
        <span className="kala-cart-toast-product" title={toast.productName}>
          {toast.productName}
        </span>
      </div>

      <div className="kala-cart-toast-actions">
        <Link to="/cart" className="kala-cart-toast-link" onClick={() => setToast(null)}>
          View Cart
        </Link>
        <button
          type="button"
          className="kala-cart-toast-close"
          onClick={() => setToast(null)}
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </aside>
  )
}

export default CartToast
