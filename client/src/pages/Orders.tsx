import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCustomerOrders, type BackendOrder } from '../services/customerApi'
import { OrderCard } from '../components/order/OrderCard'

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
      <main className="min-h-[70vh] bg-[#FAF9F6] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono uppercase tracking-widest text-[#666666]">
            Loading your orders...
          </p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-[70vh] bg-[#FAF9F6] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white border border-[#222222] p-8 text-center shadow-sm">
          <div className="w-12 h-12 bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-[#111111] mb-2">
            My Orders
          </h1>
          <p className="text-xs text-[#666666] mb-6">
            Please log in with your mobile number or email to view your order history and track shipments.
          </p>
          <Link
            to="/login"
            className="inline-block w-full py-3 bg-[#111111] hover:bg-[#D94700] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Log In to View Orders
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[75vh] bg-[#FAF9F6] py-10 px-4 sm:px-6 lg:px-8 text-[#111111]">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#222222] mb-8">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider text-[#111111]">
              My Orders
            </h1>
            <p className="text-xs text-[#666666] mt-1">
              Track active deliveries and review your previous purchases with KALA.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#111111] bg-white border border-[#222222] hover:bg-[#F5F5F5] transition-colors disabled:opacity-50"
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
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1 px-4 py-2 bg-[#D94700] hover:bg-[#B83B00] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Shop More
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={loadOrders}
              className="underline font-semibold ml-3"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Orders List or Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white border border-[#222222] p-12 text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center">
              <svg className="w-7 h-7 text-[#777777]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold uppercase tracking-wider text-[#111111] mb-2">
              No Orders Found
            </h2>
            <p className="text-xs text-[#666666] max-w-sm mx-auto mb-6">
              You haven't placed any orders yet. Discover our latest oversized tees and collections.
            </p>
            <Link
              to="/shop"
              className="inline-block px-6 py-3 bg-[#111111] hover:bg-[#D94700] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
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
