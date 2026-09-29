import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCustomerOrderDetail, type BackendOrder } from '../services/customerApi'
import { OrderStatusTimeline } from '../components/order/OrderStatusTimeline'

export const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [order, setOrder] = useState<BackendOrder | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchOrder = async () => {
    if (!orderId) return
    try {
      setErrorMessage(null)
      const data = await getCustomerOrderDetail(orderId)
      if (data) {
        setOrder(data)
      } else {
        setErrorMessage('Order not found.')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to retrieve order details.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (!isAuthLoading) {
      if (isAuthenticated && orderId) {
        fetchOrder()
      } else if (!isAuthenticated) {
        setIsLoading(false)
      }
    }
  }, [orderId, isAuthenticated, isAuthLoading])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchOrder()
  }

  const formatINR = (amt: number): string => `₹${Math.round(amt).toLocaleString('en-IN')}`

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-IN', {
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

  if (isAuthLoading || isLoading) {
    return (
      <main className="min-h-[70vh] bg-[#FAF9F6] py-16 px-4 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-mono uppercase tracking-widest text-[#666666]">
            Loading order details...
          </p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-[70vh] bg-[#FAF9F6] py-16 px-4">
        <div className="max-w-md mx-auto bg-white border border-[#222222] p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold uppercase tracking-wider text-[#111111] mb-2">
            Authentication Required
          </h1>
          <p className="text-xs text-[#666666] mb-6">
            Please log in to view the tracking details for this order.
          </p>
          <Link
            to="/login"
            className="inline-block w-full py-3 bg-[#111111] hover:bg-[#D94700] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Log In
          </Link>
        </div>
      </main>
    )
  }

  if (errorMessage || !order) {
    return (
      <main className="min-h-[70vh] bg-[#FAF9F6] py-16 px-4">
        <div className="max-w-md mx-auto bg-white border border-[#222222] p-8 text-center shadow-sm">
          <h1 className="text-lg font-bold uppercase tracking-wider text-[#111111] mb-2">
            Unable to Load Order
          </h1>
          <p className="text-xs text-red-600 mb-6">{errorMessage || 'Order not found.'}</p>
          <Link
            to="/orders"
            className="inline-block px-6 py-2.5 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#D94700] transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[75vh] bg-[#FAF9F6] py-10 px-4 sm:px-6 lg:px-8 text-[#111111]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#222222]">
          <div>
            <Link
              to="/orders"
              className="inline-flex items-center gap-1 text-xs font-mono uppercase text-[#777777] hover:text-[#111111] mb-2 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to All Orders</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[#111111]">
              Order #{order.orderId}
            </h1>
            <p className="text-xs text-[#666666] mt-0.5">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-semibold uppercase px-3 py-1 border tracking-wider ${
                order.payment?.status === 'paid'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              Payment: {order.payment?.status || 'Pending'}
            </span>
          </div>
        </div>

        {/* ORDER STATUS TIMELINE (Requirement 7) */}
        <div>
          <OrderStatusTimeline
            order={order}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </div>

        {/* 2-Column Info: Items & Delivery Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Purchased Items List (2 cols) */}
          <div className="md:col-span-2 bg-white border border-[#222222] p-5 sm:p-6 shadow-sm">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#777777] mb-4 pb-2 border-b border-[#EEEEEE]">
              Purchased Items ({(order.items || []).reduce((s: number, i: any) => s + (i.quantity || 1), 0)})
            </h2>

            <div className="divide-y divide-[#EEEEEE]">
              {(order.items || []).map((item: any, idx: number) => (
                <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover border border-[#E5E5E5] shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111111]">{item.name}</p>
                    <p className="text-xs text-[#666666] mt-0.5 font-mono">
                      Product ID: {item.productId}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#555555] mt-1">
                      <span>
                        Size: <strong className="text-[#111111]">{item.size}</strong>
                      </span>
                      {item.color && (
                        <span>
                          Color: <strong className="text-[#111111]">{item.color}</strong>
                        </span>
                      )}
                      <span>
                        Qty: <strong className="text-[#111111]">{item.quantity}</strong>
                      </span>
                    </div>

                    {item.customization?.frontText && (
                      <div className="mt-2 text-xs font-mono bg-[#FAFAFA] border border-[#E5E5E5] p-2 text-[#333333]">
                        <span className="font-semibold text-[#D94700]">Custom Front Text:</span> "
                        {item.customization.frontText}"
                      </div>
                    )}

                    {item.customization?.backText && (
                      <div className="mt-2 text-xs font-mono bg-[#FAFAFA] border border-[#E5E5E5] p-2 text-[#333333]">
                        <span className="font-semibold text-[#D94700]">Custom Back Text:</span> "
                        {item.customization.backText}" {!item.customization?.frontText && `(+₹${item.customization.price || 25})`}
                      </div>
                    )}

                    {(item.customization?.customDesign || item.customization?.position) && (
                      <div className="mt-2 text-xs font-mono bg-[#FAFAFA] border border-[#E5E5E5] p-2.5 text-[#333333] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#D94700] uppercase tracking-wide">Custom Artwork Design</span>
                          <span className="text-[10px] bg-[#111111] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            {item.customization.position || item.customization.customDesign?.position || 'Front'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#666666] flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
                          <span>Apparel: <strong className="text-[#111111] uppercase">{item.customization.apparelType || item.customization.customDesign?.apparelType || 'Custom'}</strong></span>
                          <span>Color: <strong className="text-[#111111] uppercase">{item.customization.color || item.customization.customDesign?.color || item.color || 'Standard'}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-[#777777] block font-mono">
                      {formatINR(item.price || 0)} each
                    </span>
                    <span className="text-sm font-bold font-mono text-[#111111] mt-0.5 block">
                      {formatINR((item.price || 0) * (item.quantity || 1))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment Summary (1 col) */}
          <div className="space-y-6">
            {/* Delivery Address Card */}
            <div className="bg-white border border-[#222222] p-5 shadow-sm">
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#777777] mb-3 pb-2 border-b border-[#EEEEEE]">
                Shipping Address
              </h2>
              <div className="text-xs space-y-1 text-[#333333]">
                <p className="font-bold text-sm text-[#111111]">
                  {order.customerName ||
                    `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim()}
                </p>
                <p>{order.shippingAddress?.address}</p>
                {order.shippingAddress?.landmark && (
                  <p className="text-[#666666]">Landmark: {order.shippingAddress.landmark}</p>
                )}
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
                  <span className="font-mono font-semibold">{order.shippingAddress?.pincode}</span>
                </p>
                <div className="pt-2 mt-2 border-t border-[#EEEEEE] font-mono text-[11px] text-[#666666] space-y-0.5">
                  <p>Mobile: {order.customer?.phone}</p>
                  <p>Email: {order.customer?.email}</p>
                </div>
              </div>
            </div>

            {/* Price Details Card */}
            <div className="bg-white border border-[#222222] p-5 shadow-sm">
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#777777] mb-3 pb-2 border-b border-[#EEEEEE]">
                Price Summary
              </h2>
              <div className="text-xs space-y-2 font-mono text-[#444444]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatINR(order.pricing?.subtotal || 0)}</span>
                </div>
                {(order.pricing?.discount || 0) > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount</span>
                    <span>-{formatINR(order.pricing?.discount || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>
                    {(order.pricing?.shipping || 0) === 0 ? 'FREE' : formatINR(order.pricing.shipping)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#222222] flex justify-between font-bold text-sm text-[#111111]">
                  <span>Total Paid</span>
                  <span className="text-[#D94700]">{formatINR(order.pricing?.total || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default OrderDetails
