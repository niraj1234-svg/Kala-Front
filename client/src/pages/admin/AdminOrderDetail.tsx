import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  fetchAdminOrderById,
  updateAdminOrderStatus,
  updateAdminOrderTracking,
  type ShiprocketShipmentStatus,
  type AdminTrackingScan,
  retryAdminOrderShipment,
  trackAdminOrderShipment,
  getAdminOrderShippingLabel,
  getAdminOrderInvoice,
  scheduleAdminOrderPickup,
  type AdminOrder,
  type AdminOrderStatus,
} from '../../services/adminApi'
import '../../styles/Admin.css'

const STATUS_OPTIONS: AdminOrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
]

export const AdminOrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<AdminOrder | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Status form state
  const [selectedStatus, setSelectedStatus] = useState<AdminOrderStatus>('pending')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false)
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Tracking form state
  const [trackingNumber, setTrackingNumber] = useState<string>('')
  const [carrier, setCarrier] = useState<string>('')
  const [isUpdatingTracking, setIsUpdatingTracking] = useState<boolean>(false)
  const [trackingFeedback, setTrackingFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Shiprocket Shipping state
  const [isRetryingShipment, setIsRetryingShipment] = useState<boolean>(false)
  const [isTrackingLoading, setIsTrackingLoading] = useState<boolean>(false)
  const [isLabelLoading, setIsLabelLoading] = useState<boolean>(false)
  const [isInvoiceLoading, setIsInvoiceLoading] = useState<boolean>(false)
  const [isPickupLoading, setIsPickupLoading] = useState<boolean>(false)
  const [shippingFeedback, setShippingFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [copiedAwb, setCopiedAwb] = useState<boolean>(false)
  const [trackingModalOpen, setTrackingModalOpen] = useState<boolean>(false)
  const [liveTrackingData, setLiveTrackingData] = useState<{
    currentStatus?: string
    currentLocation?: string
    etd?: string
    scans: AdminTrackingScan[]
  } | null>(null)
  const [pickupModalOpen, setPickupModalOpen] = useState<boolean>(false)
  const [pickupDateInput, setPickupDateInput] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })

  const loadOrder = useCallback(async () => {
    if (!orderId) return
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const data = await fetchAdminOrderById(orderId)
      setOrder(data.order)
      setSelectedStatus(data.order.status)
      setTrackingNumber(data.order.tracking?.trackingNumber || '')
      setCarrier(data.order.tracking?.carrier || '')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve order details.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    loadOrder()
  }, [loadOrder])

  const getShiprocketStatusBadgeClass = (status?: ShiprocketShipmentStatus) => {
    switch (status) {
      case 'delivered':
        return 'status-badge status-success'
      case 'out_for_delivery':
        return 'status-badge status-cyan'
      case 'in_transit':
      case 'pickup_completed':
        return 'status-badge status-info'
      case 'pickup_scheduled':
        return 'status-badge status-purple'
      case 'awb_assigned':
      case 'label_generated':
      case 'created':
        return 'status-badge status-info'
      case 'rto_initiated':
      case 'rto_delivered':
        return 'status-badge status-orange'
      case 'failed':
        return 'status-badge status-danger'
      default:
        return 'status-badge status-neutral'
    }
  }

  const formatShiprocketStatusDisplay = (status?: ShiprocketShipmentStatus) => {
    switch (status) {
      case 'pending':
        return 'Pending Fulfillment'
      case 'created':
        return 'Order Created in Shiprocket'
      case 'awb_assigned':
        return 'AWB Assigned'
      case 'label_generated':
        return 'Label Generated'
      case 'pickup_scheduled':
        return 'Pickup Scheduled'
      case 'pickup_completed':
        return 'Picked Up'
      case 'in_transit':
        return 'In Transit'
      case 'out_for_delivery':
        return 'Out for Delivery'
      case 'delivered':
        return 'Delivered'
      case 'rto_initiated':
        return 'RTO Initiated'
      case 'rto_delivered':
        return 'RTO Delivered'
      case 'cancelled':
        return 'Shipment Cancelled'
      case 'failed':
        return 'Fulfillment Failed'
      default:
        return 'Not Initiated'
    }
  }

  const handleCopyAwb = (awb: string) => {
    if (!awb) return
    navigator.clipboard.writeText(awb)
    setCopiedAwb(true)
    setTimeout(() => setCopiedAwb(false), 2000)
  }

  const handleRetryShipment = async () => {
    if (!order) return
    setIsRetryingShipment(true)
    setShippingFeedback(null)
    try {
      const res = await retryAdminOrderShipment(order.orderId)
      if (res.success) {
        setShippingFeedback({ type: 'success', message: res.message || 'Shipment fulfillment retried successfully.' })
        await loadOrder()
      } else {
        setShippingFeedback({ type: 'error', message: res.message || 'Failed to retry shipment.' })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error retrying shipment.'
      setShippingFeedback({ type: 'error', message: msg })
    } finally {
      setIsRetryingShipment(false)
    }
  }

  const handleTrackShipment = async () => {
    if (!order) return
    setIsTrackingLoading(true)
    setShippingFeedback(null)
    try {
      const res = await trackAdminOrderShipment(order.orderId)
      if (res.success) {
        setLiveTrackingData({
          currentStatus: res.currentStatus,
          currentLocation: res.currentLocation,
          etd: res.etd,
          scans: res.scans || [],
        })
        setTrackingModalOpen(true)
        await loadOrder()
      } else {
        setShippingFeedback({ type: 'error', message: res.message || 'Failed to retrieve tracking data.' })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error retrieving tracking data.'
      setShippingFeedback({ type: 'error', message: msg })
    } finally {
      setIsTrackingLoading(false)
    }
  }

  const handleDownloadLabel = async () => {
    if (!order) return
    if (order.shiprocketOrder?.labelUrl) {
      window.open(order.shiprocketOrder.labelUrl, '_blank', 'noopener,noreferrer')
      return
    }
    setIsLabelLoading(true)
    setShippingFeedback(null)
    try {
      const res = await getAdminOrderShippingLabel(order.orderId)
      if (res.success && res.labelUrl) {
        window.open(res.labelUrl, '_blank', 'noopener,noreferrer')
        await loadOrder()
      } else {
        setShippingFeedback({ type: 'error', message: res.message || 'Failed to generate shipping label.' })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating shipping label.'
      setShippingFeedback({ type: 'error', message: msg })
    } finally {
      setIsLabelLoading(false)
    }
  }

  const handleDownloadInvoice = async () => {
    if (!order) return
    if (order.shiprocketOrder?.invoiceUrl) {
      window.open(order.shiprocketOrder.invoiceUrl, '_blank', 'noopener,noreferrer')
      return
    }
    setIsInvoiceLoading(true)
    setShippingFeedback(null)
    try {
      const res = await getAdminOrderInvoice(order.orderId)
      if (res.success && res.invoiceUrl) {
        window.open(res.invoiceUrl, '_blank', 'noopener,noreferrer')
        await loadOrder()
      } else {
        setShippingFeedback({ type: 'error', message: res.message || 'Failed to generate invoice.' })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating invoice.'
      setShippingFeedback({ type: 'error', message: msg })
    } finally {
      setIsInvoiceLoading(false)
    }
  }

  const handleSchedulePickup = async () => {
    if (!order) return
    setIsPickupLoading(true)
    setShippingFeedback(null)
    try {
      const res = await scheduleAdminOrderPickup(order.orderId, pickupDateInput || undefined)
      if (res.success) {
        setShippingFeedback({
          type: 'success',
          message: `Pickup scheduled successfully! Token: ${res.pickupTokenNumber || 'Assigned'}${res.pickupScheduledDate ? ` (Date: ${res.pickupScheduledDate})` : ''}`,
        })
        setPickupModalOpen(false)
        await loadOrder()
      } else {
        setShippingFeedback({ type: 'error', message: res.message || 'Failed to schedule pickup.' })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error scheduling pickup.'
      setShippingFeedback({ type: 'error', message: msg })
    } finally {
      setIsPickupLoading(false)
    }
  }

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return
    setIsUpdatingStatus(true)
    setStatusFeedback(null)

    try {
      const result = await updateAdminOrderStatus(order.orderId, selectedStatus)
      setOrder(result.order)
      setStatusFeedback({ type: 'success', message: 'Order status updated successfully.' })
      // Refresh order details from backend to ensure all side-effects and history are loaded
      await loadOrder()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update order status.'
      setStatusFeedback({ type: 'error', message: msg })
      // On backend rejection, refresh order to reset selectedStatus to actual server status
      await loadOrder()
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleTrackingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return
    setTrackingFeedback(null)

    const trimmedCarrier = carrier.trim()
    const trimmedTracking = trackingNumber.trim()

    if (!trimmedCarrier) {
      setTrackingFeedback({ type: 'error', message: 'Carrier is required.' })
      return
    }
    if (trimmedCarrier.length > 100) {
      setTrackingFeedback({ type: 'error', message: 'Carrier cannot exceed 100 characters.' })
      return
    }
    if (!trimmedTracking) {
      setTrackingFeedback({ type: 'error', message: 'Tracking number is required.' })
      return
    }
    if (trimmedTracking.length > 100) {
      setTrackingFeedback({ type: 'error', message: 'Tracking number cannot exceed 100 characters.' })
      return
    }

    setIsUpdatingTracking(true)

    try {
      const result = await updateAdminOrderTracking(order.orderId, {
        trackingNumber: trimmedTracking,
        carrier: trimmedCarrier,
      })
      setOrder(result.order)
      setTrackingFeedback({ type: 'success', message: 'Tracking details updated successfully.' })
      await loadOrder()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update tracking details.'
      setTrackingFeedback({ type: 'error', message: msg })
      await loadOrder()
    } finally {
      setIsUpdatingTracking(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const resolveItemImage = (imgSrc?: string) => {
    if (!imgSrc) return ''
    if (imgSrc.startsWith('data:') || imgSrc.startsWith('http://') || imgSrc.startsWith('https://') || imgSrc.startsWith('/')) {
      return imgSrc
    }
    return `/assets/${imgSrc}`
  }

  const handleDownloadArtwork = (artworkUrl: string, orderId: string, itemIdx: number) => {
    const link = document.createElement('a')
    link.href = artworkUrl
    link.download = `KALA-Artwork-${orderId}-Item${itemIdx + 1}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadPreview = (previewUrl: string, orderId: string, itemIdx: number) => {
    const link = document.createElement('a')
    link.href = previewUrl
    link.download = `KALA-Production-Preview-${orderId}-Item${itemIdx + 1}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadgeClass = (status: AdminOrderStatus) => {
    switch (status) {
      case 'confirmed':
      case 'delivered':
        return 'status-badge status-success'
      case 'processing':
      case 'shipped':
        return 'status-badge status-info'
      case 'cancelled':
        return 'status-badge status-danger'
      default:
        return 'status-badge status-warning'
    }
  }

  if (isLoading) {
    return (
      <div className="admin-page-container">
        <div className="admin-state-container" role="status">
          <div className="admin-spinner" />
          <p>Loading order details...</p>
        </div>
      </div>
    )
  }

  if (errorMessage || !order) {
    return (
      <div className="admin-page-container">
        <div className="admin-state-container admin-state-error">
          <p className="admin-error-text">{errorMessage || 'Order not found.'}</p>
          <div className="admin-btn-group">
            <button type="button" className="admin-btn admin-btn-primary" onClick={loadOrder}>
              Retry
            </button>
            <Link to="/admin/orders" className="admin-btn admin-btn-secondary">
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page-container">
      {/* Top Breadcrumb / Back Link */}
      <div className="admin-detail-breadcrumb">
        <Link to="/admin/orders" className="admin-back-link">
          ← Back to Orders List
        </Link>
      </div>

      {/* Header with Order ID & Status */}
      <header className="admin-detail-header">
        <div>
          <div className="admin-detail-title-row">
            <h1 className="admin-page-title">Order {order.orderId}</h1>
            <span className={getStatusBadgeClass(order.status)}>
              {order.status.toUpperCase()}
            </span>
          </div>
          <p className="admin-page-subtitle">
            Placed on {formatDate(order.createdAt)} • Customer ID:{' '}
            <span className="font-mono">{order.userId || 'Guest Order'}</span>
          </p>
        </div>
      </header>

      {/* Main Grid: Details on Left, Actions on Right */}
      <div className="admin-detail-grid">
        {/* Left Column: Line Items + Addresses + Totals */}
        <div className="admin-detail-main">
          {/* Items Table */}
          <div className="admin-card-section">
            <h2 className="admin-section-title">Purchased Items ({order.items.length})</h2>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item Details</th>
                    <th>Size</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th className="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={`${item.productId}-${item.size}-${idx}`}>
                      <td>
                        <div className="admin-item-cell">
                          {item.image && (
                            <img
                              src={resolveItemImage(item.image)}
                              alt={item.name}
                              className="admin-item-thumb"
                              onError={(e) => {
                                ;(e.currentTarget as HTMLElement).style.display = 'none'
                              }}
                            />
                          )}
                          <div className="admin-item-info">
                            <span className="item-name font-medium text-white">{item.name}</span>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              <span className="item-id font-mono text-muted text-xs">{item.productId}</span>
                              {item.color && (
                                <span className="text-xs text-[#9CA3AF]">
                                  Color: <strong className="text-white">{item.color}</strong>
                                </span>
                              )}
                              {item.customization?.position && (
                                <span className="text-[11px] font-mono font-bold text-[#FF7A33] bg-[#D94700]/20 px-1.5 py-0.5 rounded border border-[#D94700]/30 uppercase">
                                  {item.customization.position} Print
                                </span>
                              )}
                              {item.customization?.frontText && (
                                <span className="text-[11px] font-mono font-bold text-white bg-[#374151] px-1.5 py-0.5 rounded border border-[#4B5563]">
                                  Front: "{item.customization.frontText}"
                                </span>
                              )}
                              {item.customization?.backText && (
                                <span className="text-[11px] font-mono font-bold text-white bg-[#374151] px-1.5 py-0.5 rounded border border-[#4B5563]">
                                  Back: "{item.customization.backText}"
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono">{item.size}</td>
                      <td>{formatPrice(item.price)}</td>
                      <td className="font-medium">{item.quantity}</td>
                      <td className="text-right font-medium text-white">
                        {formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Custom Customer Artwork & Production Specifications (Requirements 11, 12, 13) */}
            {order.items.some((it) => it.customization?.artworkUrl || it.customization?.previewUrl || it.customization?.position || it.customization?.frontText || it.customization?.backText) && (
              <div className="admin-custom-artwork-section p-5 bg-[#1F2937] rounded-2xl border border-[#374151] shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#374151]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#D94700] ring-4 ring-[#D94700]/20 animate-pulse" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      Custom Apparel Production Artwork & Design
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#9CA3AF]">
                    Direct Customer Configuration
                  </span>
                </div>

                <div className="space-y-6">
                  {order.items.map((item, idx) => {
                    const cust = item.customization
                    if (!cust || (!cust.artworkUrl && !cust.previewUrl && !cust.position && !cust.frontText && !cust.backText)) {
                      return null
                    }

                    return (
                      <div
                        key={`custom-${idx}`}
                        className="bg-[#111827] rounded-xl p-4 sm:p-5 border border-[#374151] space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1F2937]">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#D94700]/20 text-[#FF7A33] border border-[#D94700]/30 uppercase">
                              Item #{idx + 1}
                            </span>
                            <span className="text-white font-medium text-sm">{item.name}</span>
                            <span className="text-xs text-[#9CA3AF]">({item.size})</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#D1D5DB]">
                            <span>Apparel: <strong className="text-white uppercase">{cust.apparelType || 'T-Shirt'}</strong></span>
                            <span>•</span>
                            <span>Color: <strong className="text-white">{cust.color || item.color || 'Standard'}</strong></span>
                            <span>•</span>
                            <span>Placement: <strong className="text-[#D94700] uppercase font-bold">{cust.position || 'Front'}</strong></span>
                          </div>
                        </div>

                        {/* Final Custom Production Previews: Front & Back (Requirement 17) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* 1. FRONT PREVIEW */}
                          <div className="p-4 bg-[#1F2937] rounded-xl border border-[#374151] flex flex-col items-center">
                            <span className="text-xs font-mono font-semibold text-[#D1D5DB] mb-2 uppercase tracking-wide">
                              FRONT PREVIEW
                            </span>
                            <div className="w-full aspect-square max-w-[260px] bg-[#FAF9F6] rounded-xl border border-[#374151] overflow-hidden flex items-center justify-center p-2 mb-3 shadow-inner">
                              {(cust.frontPreviewUrl || cust.previewUrl) ? (
                                <img
                                  src={resolveItemImage(cust.frontPreviewUrl || cust.previewUrl)}
                                  alt="Front Production Preview"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <span className="text-xs text-[#6B7280]">Front preview not available</span>
                              )}
                            </div>
                            {(cust.frontPreviewUrl || cust.previewUrl) && (
                              <button
                                type="button"
                                className="w-full py-2.5 px-4 rounded-lg bg-[#374151] hover:bg-[#4B5563] text-white text-xs font-bold font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                onClick={() => handleDownloadPreview((cust.frontPreviewUrl || cust.previewUrl)!, order.orderId, idx)}
                              >
                                <svg className="w-4 h-4 text-[#D94700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>DOWNLOAD FRONT PREVIEW</span>
                              </button>
                            )}
                          </div>

                          {/* 2. BACK PREVIEW */}
                          <div className="p-4 bg-[#1F2937] rounded-xl border border-[#374151] flex flex-col items-center">
                            <span className="text-xs font-mono font-semibold text-[#D1D5DB] mb-2 uppercase tracking-wide">
                              BACK PREVIEW
                            </span>
                            <div className="w-full aspect-square max-w-[260px] bg-[#FAF9F6] rounded-xl border border-[#374151] overflow-hidden flex items-center justify-center p-2 mb-3 shadow-inner">
                              {cust.backPreviewUrl ? (
                                <img
                                  src={resolveItemImage(cust.backPreviewUrl)}
                                  alt="Back Production Preview"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <span className="text-xs text-[#6B7280]">Back preview not configured</span>
                              )}
                            </div>
                            {cust.backPreviewUrl && (
                              <button
                                type="button"
                                className="w-full py-2.5 px-4 rounded-lg bg-[#374151] hover:bg-[#4B5563] text-white text-xs font-bold font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                onClick={() => handleDownloadPreview(cust.backPreviewUrl!, `${order.orderId}-Back`, idx)}
                              >
                                <svg className="w-4 h-4 text-[#D94700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>DOWNLOAD BACK PREVIEW</span>
                              </button>
                            )}
                          </div>

                          {/* 3. Original Uploaded Customer Artwork */}
                          <div className="p-4 bg-[#1F2937] rounded-xl border border-[#374151] flex flex-col items-center">
                            <span className="text-xs font-mono font-semibold text-[#D1D5DB] mb-2 uppercase tracking-wide">
                              Original Customer Artwork
                            </span>
                            <div className="w-full aspect-square max-w-[260px] bg-[#0B0F19] rounded-xl border border-[#374151] overflow-hidden flex items-center justify-center p-3 mb-3 shadow-inner">
                              {(cust.artworkUrl || cust.frontArtworkUrl) ? (
                                <img
                                  src={resolveItemImage(cust.artworkUrl || cust.frontArtworkUrl)}
                                  alt="Original Uploaded Artwork"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <span className="text-xs text-[#6B7280]">Original artwork file not available</span>
                              )}
                            </div>
                            {(cust.artworkUrl || cust.frontArtworkUrl) && (
                              <button
                                type="button"
                                className="w-full py-2.5 px-4 rounded-lg bg-[#D94700] hover:bg-[#BF3E00] text-white text-xs font-bold font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                onClick={() => handleDownloadArtwork((cust.artworkUrl || cust.frontArtworkUrl)!, order.orderId, idx)}
                              >
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>DOWNLOAD ARTWORK</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Customer Requirement Details if present */}
                        {cust.requirementDetails && (
                          <div className="p-3 bg-[#1F2937] rounded-lg border border-[#374151] text-xs font-mono text-[#D1D5DB]">
                            <span className="text-[#FF7A33] font-bold uppercase tracking-wider block mb-1">Requirement Notes:</span>
                            <p className="text-white italic whitespace-pre-wrap">{cust.requirementDetails}</p>
                          </div>
                        )}

                        {/* Exact Placement Coordinates Specs */}
                        {cust.artwork && (
                          <div className="p-3 bg-[#1F2937] rounded-lg text-xs font-mono text-[#D1D5DB] flex flex-wrap items-center justify-between gap-3 border border-[#374151]">
                            <span>Placement: <strong className="text-white uppercase font-bold">{cust.position}</strong></span>
                            <span>Center X: <strong className="text-white">{cust.artwork.x}%</strong></span>
                            <span>Center Y: <strong className="text-white">{cust.artwork.y}%</strong></span>
                            <span>Scale: <strong className="text-white">{Math.round((cust.artwork.scale || 1) * 100)}%</strong></span>
                            <span>Rotation: <strong className="text-white">{cust.artwork.rotation || 0}°</strong></span>
                          </div>
                        )}

                        {/* Custom Print Typography Specifications & Live Previews (Requirement 13) */}
                        {(cust.frontText || cust.backText) && (
                          <div className="p-4 bg-[#1F2937] rounded-xl border border-[#374151] space-y-4">
                            <div className="flex items-center justify-between border-b border-[#374151] pb-2">
                              <span className="text-xs font-bold text-[#FF7A33] uppercase tracking-wide">
                                Custom Print Typography & Live Previews
                              </span>
                              <span className="text-[11px] font-mono text-[#9CA3AF]">
                                {item.name} • {item.color || 'Standard'} • Size: {item.size} • Qty: {item.quantity}
                              </span>
                            </div>

                            {/* Front and Back Live Rendered Design Previews */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Front Preview */}
                              <div className="p-3 bg-[#111827] rounded-xl border border-[#374151] flex flex-col items-center">
                                <span className="text-xs font-mono font-bold text-[#D1D5DB] mb-2 uppercase tracking-wider">
                                  Front Preview
                                </span>
                                <div className="relative w-full aspect-square max-w-[240px] bg-[#FAF9F6] rounded-xl border border-[#374151] overflow-hidden flex items-center justify-center p-2 mb-3 shadow-inner">
                                  <img
                                    src={resolveItemImage(item.image) || '/images/products/kala-bihari-story-front.png'}
                                    alt="Front Preview"
                                    className="w-full h-full object-contain"
                                  />
                                  {cust.frontText && (
                                    <div
                                      className="absolute pointer-events-none"
                                      style={{
                                        left: `${cust.frontPosition?.x ?? 50}%`,
                                        top: `${cust.frontPosition?.y ?? 52}%`,
                                        transform: `translate(-50%, -50%) rotate(${cust.frontRotation ?? 0}deg)`,
                                      }}
                                    >
                                      <span
                                        className="font-extrabold uppercase tracking-wider text-white bg-[#111111]/90 px-2 py-0.5 rounded shadow border border-white/40 whitespace-nowrap"
                                        style={{
                                          fontSize: `${Math.max(10, Math.min(22, Math.round((cust.frontFontSize || 32) * 0.42)))}px`,
                                        }}
                                      >
                                        {cust.frontText}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="w-full text-xs font-mono text-[#9CA3AF] space-y-1">
                                  <div>Front Text: <strong className="text-white">{cust.frontText ? `"${cust.frontText}"` : 'None'}</strong></div>
                                  {cust.frontText && (
                                    <>
                                      <div>Position: <strong className="text-white">X: {cust.frontPosition?.x ?? 50}% | Y: {cust.frontPosition?.y ?? 52}%</strong></div>
                                      <div>Text Size: <strong className="text-[#FF7A33]">{cust.frontFontSize || 32}px</strong></div>
                                      {cust.frontRotation !== undefined && cust.frontRotation !== 0 && (
                                        <div>Rotation: <strong className="text-[#FF7A33]">{cust.frontRotation}°</strong></div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Back Preview */}
                              <div className="p-3 bg-[#111827] rounded-xl border border-[#374151] flex flex-col items-center">
                                <span className="text-xs font-mono font-bold text-[#D1D5DB] mb-2 uppercase tracking-wider">
                                  Back Preview
                                </span>
                                <div className="relative w-full aspect-square max-w-[240px] bg-[#FAF9F6] rounded-xl border border-[#374151] overflow-hidden flex items-center justify-center p-2 mb-3 shadow-inner">
                                  <img
                                    src="/images/products/kala-bihari-story-back.png"
                                    alt="Back Preview"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      ;(e.currentTarget as HTMLImageElement).src = '/assets/kala-bihari-story-back.png'
                                    }}
                                  />
                                  {cust.backText && (
                                    <div
                                      className="absolute pointer-events-none"
                                      style={{
                                        left: `${cust.backPosition?.x ?? 50}%`,
                                        top: `${cust.backPosition?.y ?? 44}%`,
                                        transform: `translate(-50%, -50%) rotate(${cust.backRotation ?? 0}deg)`,
                                      }}
                                    >
                                      <span
                                        className="font-extrabold uppercase tracking-wider text-white bg-[#111111]/90 px-2 py-0.5 rounded shadow border border-white/40 whitespace-nowrap"
                                        style={{
                                          fontSize: `${Math.max(10, Math.min(22, Math.round((cust.backFontSize || 32) * 0.42)))}px`,
                                        }}
                                      >
                                        {cust.backText}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="w-full text-xs font-mono text-[#9CA3AF] space-y-1">
                                  <div>Back Text: <strong className="text-white">{cust.backText ? `"${cust.backText}"` : 'None'}</strong></div>
                                  {cust.backText && (
                                    <>
                                      <div>Position: <strong className="text-white">X: {cust.backPosition?.x ?? 50}% | Y: {cust.backPosition?.y ?? 44}%</strong></div>
                                      <div>Text Size: <strong className="text-[#FF7A33]">{cust.backFontSize || 32}px</strong></div>
                                      {cust.backRotation !== undefined && cust.backRotation !== 0 && (
                                        <div>Rotation: <strong className="text-[#FF7A33]">{cust.backRotation}°</strong></div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Summary Metadata Row */}
                            <div className="p-3 bg-[#111827] rounded-lg text-xs font-mono text-[#9CA3AF] flex flex-wrap items-center justify-between gap-2 border border-[#374151]">
                              <span>Product: <strong className="text-white">{item.name}</strong></span>
                              <span>Color: <strong className="text-white">{cust.color || item.color || 'Standard'}</strong></span>
                              <span>Size: <strong className="text-white">{item.size}</strong></span>
                              <span>Qty: <strong className="text-white">{item.quantity}</strong></span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Pricing Summary Breakdown */}
            <div className="admin-pricing-breakdown">
              <div className="pricing-row">
                <span className="text-muted">Items Subtotal</span>
                <span className="font-medium">{formatPrice(order.pricing.subtotal)}</span>
              </div>
              <div className="pricing-row">
                <span className="text-muted">Standard Express Shipping</span>
                <span className="font-medium">{formatPrice(order.pricing.shipping)}</span>
              </div>
              <div className="pricing-row pricing-total">
                <span className="text-white font-bold">Total Amount Paid</span>
                <span className="text-white font-bold text-lg">
                  {formatPrice(order.pricing.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Address Info */}
          <div className="admin-info-columns">
            <div className="admin-card-section">
              <h3 className="admin-section-title">Customer Information</h3>
              <div className="admin-kv-list">
                <div className="kv-row">
                  <span className="kv-label">Name</span>
                  <span className="kv-val font-medium text-white">
                    {order.customer.firstName} {order.customer.lastName}
                  </span>
                </div>
                <div className="kv-row">
                  <span className="kv-label">Email</span>
                  <span className="kv-val font-mono">{order.customer.email}</span>
                </div>
                <div className="kv-row">
                  <span className="kv-label">Phone</span>
                  <span className="kv-val font-mono">{order.customer.phone}</span>
                </div>
              </div>
            </div>

            <div className="admin-card-section">
              <h3 className="admin-section-title">Shipping Address</h3>
              <div className="admin-address-block">
                <p className="font-medium text-white">{order.shippingAddress.address}</p>
                <p className="text-muted">
                  {order.shippingAddress.city}, {order.shippingAddress.state} —{' '}
                  <span className="font-mono">{order.shippingAddress.pincode}</span>
                </p>
                <p className="text-muted">India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Administrative Actions & Controls */}
        <aside className="admin-detail-sidebar">
          {/* Shiprocket Logistics & Fulfillment Section */}
          <div className="admin-card-section admin-shiprocket-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <h3 className="admin-section-title" style={{ margin: 0 }}>
                Shiprocket Fulfillment
              </h3>
              <span className={`status-badge ${getShiprocketStatusBadgeClass(order.shiprocketOrder?.status)}`}>
                {formatShiprocketStatusDisplay(order.shiprocketOrder?.status)}
              </span>
            </div>

            {shippingFeedback && (
              <div
                className={`admin-feedback-alert ${
                  shippingFeedback.type === 'success' ? 'feedback-success' : 'feedback-error'
                }`}
                role="alert"
                style={{ marginBottom: '0.75rem' }}
              >
                {shippingFeedback.message}
              </div>
            )}

            {order.shiprocketOrder?.lastError && (
              <div className="admin-feedback-alert feedback-error" role="alert" style={{ marginBottom: '0.75rem' }}>
                <strong>Logistics Error:</strong> {order.shiprocketOrder.lastError}
              </div>
            )}

            <div className="admin-shiprocket-meta-grid">
              <div className="admin-meta-row">
                <span className="text-muted">Shiprocket Order ID:</span>
                <span className="font-mono text-white font-medium">
                  {order.shiprocketOrder?.orderId ? `#${order.shiprocketOrder.orderId}` : 'Not created'}
                </span>
              </div>
              <div className="admin-meta-row">
                <span className="text-muted">Shipment ID:</span>
                <span className="font-mono text-white font-medium">
                  {order.shiprocketOrder?.shipmentId ? `#${order.shiprocketOrder.shipmentId}` : 'Not assigned'}
                </span>
              </div>
              <div className="admin-meta-row">
                <span className="text-muted">Courier Partner:</span>
                <span className="font-medium text-white">
                  {order.shiprocketOrder?.courierName || 'Not assigned'}
                </span>
              </div>
              <div className="admin-meta-row">
                <span className="text-muted">AWB Code:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span className="font-mono text-white font-bold">
                    {order.shiprocketOrder?.awbCode || order.tracking?.trackingNumber || 'Pending'}
                  </span>
                  {(order.shiprocketOrder?.awbCode || order.tracking?.trackingNumber) && (
                    <button
                      type="button"
                      className="admin-btn-copy"
                      onClick={() => handleCopyAwb(order.shiprocketOrder?.awbCode || order.tracking?.trackingNumber || '')}
                      title="Copy AWB code"
                    >
                      {copiedAwb ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
              {order.shiprocketOrder?.weightKg && (
                <div className="admin-meta-row">
                  <span className="text-muted">Package Specs:</span>
                  <span className="text-white text-xs">
                    {order.shiprocketOrder.weightKg} kg ({order.shiprocketOrder.dimensions?.length || 25}×{order.shiprocketOrder.dimensions?.breadth || 20}×{order.shiprocketOrder.dimensions?.height || 3} cm)
                  </span>
                </div>
              )}
              <div className="admin-meta-row">
                <span className="text-muted">Pickup Status:</span>
                <span className="text-white text-xs">
                  {order.shiprocketOrder?.pickupTokenNumber
                    ? `Token: ${order.shiprocketOrder.pickupTokenNumber}${order.shiprocketOrder.pickupScheduledDate ? ` (${order.shiprocketOrder.pickupScheduledDate})` : ''}`
                    : 'Not scheduled'}
                </span>
              </div>
              {order.shiprocketOrder?.currentTrackingStatus && (
                <div className="admin-meta-row">
                  <span className="text-muted">Live Tracking:</span>
                  <span className="text-white text-xs font-semibold">
                    {order.shiprocketOrder.currentTrackingStatus}
                    {order.shiprocketOrder.lastTrackingSyncAt && (
                      <span className="text-muted" style={{ display: 'block', fontSize: '0.68rem', fontWeight: 'normal' }}>
                        (Synced {formatDate(order.shiprocketOrder.lastTrackingSyncAt)})
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={handleTrackShipment}
                  disabled={isTrackingLoading || (!order.shiprocketOrder?.awbCode && !order.tracking?.trackingNumber)}
                  title={(!order.shiprocketOrder?.awbCode && !order.tracking?.trackingNumber) ? 'Assign AWB first to track' : 'Sync live tracking from Shiprocket'}
                >
                  {isTrackingLoading ? 'Syncing...' : 'Sync Tracking'}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={handleDownloadLabel}
                  disabled={isLabelLoading || !order.shiprocketOrder?.shipmentId}
                  title={!order.shiprocketOrder?.shipmentId ? 'Create shipment first to generate label' : 'View or download shipping label'}
                >
                  {isLabelLoading ? 'Generating...' : order.shiprocketOrder?.labelUrl ? 'View Label' : 'Generate Label'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={handleDownloadInvoice}
                  disabled={isInvoiceLoading || !order.shiprocketOrder?.orderId}
                  title={!order.shiprocketOrder?.orderId ? 'Create order first to generate invoice' : 'View or download invoice'}
                >
                  {isInvoiceLoading ? 'Generating...' : order.shiprocketOrder?.invoiceUrl ? 'View Invoice' : 'Generate Invoice'}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setPickupModalOpen(true)}
                  disabled={isPickupLoading || !order.shiprocketOrder?.shipmentId || Boolean(order.shiprocketOrder?.pickupTokenNumber)}
                  title={
                    !order.shiprocketOrder?.shipmentId
                      ? 'Shipment must exist before scheduling pickup'
                      : order.shiprocketOrder?.pickupTokenNumber
                        ? 'Pickup already scheduled'
                        : 'Schedule courier pickup'
                  }
                >
                  {order.shiprocketOrder?.pickupTokenNumber ? 'Pickup Scheduled' : 'Schedule Pickup'}
                </button>
              </div>

              {(!order.shiprocketOrder?.awbCode || order.shiprocketOrder?.status === 'failed') && (
                <button
                  type="button"
                  className="admin-btn admin-btn-primary full-width"
                  onClick={handleRetryShipment}
                  disabled={isRetryingShipment || order.payment?.status !== 'paid'}
                  title={order.payment?.status !== 'paid' ? 'Order must be paid before fulfilling' : 'Retry order creation & AWB assignment'}
                  style={{ marginTop: '0.2rem' }}
                >
                  {isRetryingShipment ? 'Fulfilling...' : 'Retry / Fulfill Shipment'}
                </button>
              )}
            </div>
          </div>

          {/* Order Fulfillment Section */}
          <div className="admin-card-section">
            <h3 className="admin-section-title">Order Fulfillment</h3>
            {statusFeedback && (
              <div
                className={`admin-feedback-alert ${
                  statusFeedback.type === 'success' ? 'feedback-success' : 'feedback-error'
                }`}
                role="alert"
              >
                {statusFeedback.message}
              </div>
            )}
            <form onSubmit={handleStatusSubmit} className="admin-action-form">
              <div className="admin-form-group">
                <label htmlFor="order-status-select" className="admin-form-label">
                  Current Status
                </label>
                <select
                  id="order-status-select"
                  className="admin-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as AdminOrderStatus)}
                  disabled={isUpdatingStatus}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="admin-btn admin-btn-primary full-width"
                disabled={isUpdatingStatus || selectedStatus === order.status}
              >
                {isUpdatingStatus ? 'Updating...' : 'UPDATE STATUS'}
              </button>
            </form>
          </div>

          {/* Tracking Information Form */}
          <div className="admin-card-section">
            <h3 className="admin-section-title">Tracking Information</h3>
            {trackingFeedback && (
              <div
                className={`admin-feedback-alert ${
                  trackingFeedback.type === 'success' ? 'feedback-success' : 'feedback-error'
                }`}
                role="alert"
              >
                {trackingFeedback.message}
              </div>
            )}
            <form onSubmit={handleTrackingSubmit} className="admin-action-form">
              <div className="admin-form-group">
                <label htmlFor="carrier-input" className="admin-form-label">
                  Carrier
                </label>
                <input
                  id="carrier-input"
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. BlueDart, Delhivery, DTDC"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  disabled={isUpdatingTracking}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="tracking-input" className="admin-form-label">
                  Tracking Number
                </label>
                <input
                  id="tracking-input"
                  type="text"
                  className="admin-form-input font-mono"
                  placeholder="e.g. ABC123456789"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  disabled={isUpdatingTracking}
                />
              </div>

              {order.tracking?.updatedAt && (
                <p className="admin-tracking-meta text-muted">
                  Last updated: {formatDate(order.tracking.updatedAt)}
                </p>
              )}

              <button
                type="submit"
                className="admin-btn admin-btn-secondary full-width"
                disabled={isUpdatingTracking}
              >
                {isUpdatingTracking ? 'Updating...' : 'UPDATE TRACKING'}
              </button>
            </form>
          </div>

          {/* Status History Audit Trail */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="admin-card-section">
              <h3 className="admin-section-title">Status History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {order.statusHistory.map((item, idx) => (
                  <div
                    key={`${item.status}-${item.changedAt}-${idx}`}
                    style={{
                      padding: '0.6rem 0.75rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '4px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.2rem',
                      }}
                    >
                      <span
                        className={getStatusBadgeClass(item.status)}
                        style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}
                      >
                        {item.status.toUpperCase()}
                      </span>
                      <span style={{ color: '#9ca3af', fontSize: '0.72rem' }}>
                        {formatDate(item.changedAt)}
                      </span>
                    </div>
                    {item.note && (
                      <p
                        style={{
                          color: '#d1d5db',
                          margin: '0.25rem 0 0 0',
                          fontSize: '0.75rem',
                          lineHeight: '1.3',
                        }}
                      >
                        {item.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      {/* Shiprocket Tracking Modal */}
      {trackingModalOpen && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card" style={{ maxWidth: '600px', width: '92%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 className="admin-modal-title" style={{ margin: 0 }}>
                Real-Time Tracking Scans
              </h3>
              <button
                type="button"
                className="admin-btn-action"
                onClick={() => setTrackingModalOpen(false)}
                style={{ padding: '0.2rem 0.6rem' }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem', marginBottom: '1rem', background: '#121214', padding: '0.75rem', borderRadius: '6px' }}>
              <div>
                <span className="text-muted text-xs block">Current Status</span>
                <span className="font-semibold text-white text-sm">
                  {liveTrackingData?.currentStatus || order?.shiprocketOrder?.currentTrackingStatus || 'In Progress'}
                </span>
              </div>
              <div>
                <span className="text-muted text-xs block">Current Location</span>
                <span className="font-medium text-white text-sm">
                  {liveTrackingData?.currentLocation || 'In Transit'}
                </span>
              </div>
              {liveTrackingData?.etd && (
                <div>
                  <span className="text-muted text-xs block">Estimated Delivery</span>
                  <span className="font-medium text-emerald-400 text-sm">{liveTrackingData.etd}</span>
                </div>
              )}
            </div>

            <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.5rem' }}>
              Activity Scan History ({liveTrackingData?.scans?.length || 0})
            </h4>

            {(!liveTrackingData?.scans || liveTrackingData.scans.length === 0) ? (
              <p className="text-muted text-sm" style={{ padding: '1rem 0', textAlign: 'center' }}>
                No tracking scans recorded yet by the courier partner.
              </p>
            ) : (
              <div className="admin-tracking-scans-timeline">
                {liveTrackingData.scans.map((scan, idx) => (
                  <div key={idx} className="admin-scan-card">
                    <div className="admin-scan-activity">{scan.activity}</div>
                    <div className="admin-scan-meta">
                      <span>{scan.location || 'Hub / Sorting Center'}</span>
                      <span>{formatDate(scan.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="admin-modal-actions" style={{ marginTop: '1.25rem' }}>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setTrackingModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shiprocket Courier Pickup Confirmation Modal */}
      {pickupModalOpen && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card" style={{ maxWidth: '520px', width: '92%' }}>
            <h3 className="admin-modal-title">Schedule Courier Pickup</h3>
            <p className="admin-modal-body">
              Confirm courier pickup request for Order{' '}
              <strong className="text-white font-mono">{order?.orderId}</strong> (Shipment ID:{' '}
              <strong className="text-white font-mono">#{order?.shiprocketOrder?.shipmentId}</strong>).
            </p>

            <div style={{ background: '#121214', padding: '0.85rem', borderRadius: '6px', margin: '0.85rem 0', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
              <div className="admin-meta-row">
                <span className="text-muted">Courier:</span>
                <span className="text-white font-medium">{order?.shiprocketOrder?.courierName || 'Auto-Assigned Courier'}</span>
              </div>
              <div className="admin-meta-row">
                <span className="text-muted">AWB Code:</span>
                <span className="font-mono text-white">{order?.shiprocketOrder?.awbCode || order?.tracking?.trackingNumber}</span>
              </div>
              <div className="admin-meta-row">
                <span className="text-muted">Pickup Postcode:</span>
                <span className="text-white">495004 (Bilaspur Warehouse)</span>
              </div>
            </div>

            <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="pickup-date-input" className="admin-form-label">
                Scheduled Pickup Date
              </label>
              <input
                id="pickup-date-input"
                type="date"
                className="admin-form-input"
                value={pickupDateInput}
                onChange={(e) => setPickupDateInput(e.target.value)}
                disabled={isPickupLoading}
              />
              <span className="text-muted text-xs" style={{ marginTop: '0.25rem', display: 'block' }}>
                Couriers typically pick up between 11:00 AM and 6:00 PM on the scheduled date.
              </span>
            </div>

            <div className="admin-feedback-alert feedback-error" style={{ marginBottom: '1rem', fontSize: '0.78rem' }}>
              <strong>Notice:</strong> This action notifies Shiprocket and creates a live pickup token with the assigned courier partner.
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setPickupModalOpen(false)}
                disabled={isPickupLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleSchedulePickup}
                disabled={isPickupLoading}
              >
                {isPickupLoading ? 'Scheduling...' : 'Confirm & Schedule Pickup'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default AdminOrderDetail
