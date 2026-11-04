import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  getVendorMe,
  getVendorStats,
  getVendorAnalytics,
  getVendorTransactions,
  getVendorPayouts,
  requestVendorPayout,
  downloadVendorSalesReport,
  getVendorProducts,
  createVendorProduct,
  updateVendorProduct,
  toggleVendorProductStatus,
  deleteVendorProduct,
  getVendorOrders,
  updateVendorOrderStatus,
  updateVendorShop,
} from '../services/vendorApi'
import { clearAuthToken } from '../services/authApi'
import { getProductImage } from '../data/products'
import type {
  VendorProfile,
  VendorShop,
  MarketplaceProduct,
  VendorStats,
  VendorOrder,
  VendorAnalyticsTimeline,
  VendorBestSeller,
  VendorTransaction,
  VendorPayout,
} from '../types/marketplace'
import '../styles/Vendor.css'

const CATEGORIES = [
  'Streetwear',
  'Custom Clothing',
  'Clothing Brand',
  'Gymwear',
  'Sportswear',
  'Corporate Merchandise',
  'Printing Services',
  'Accessories',
  'Gaming',
  'Other',
]

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

type TabType = 'overview' | 'products' | 'add-product' | 'orders' | 'inventory' | 'profile' | 'earnings'

export const VendorDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = (searchParams.get('tab') as TabType) || 'overview'

  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Core Data
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null)
  const [shop, setShop] = useState<VendorShop | null>(null)
  const [stats, setStats] = useState<VendorStats>({
    totalProducts: 0,
    activeProducts: 0,
    pendingProducts: 0,
    draftProducts: 0,
    rejectedProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalEarnings: 0,
  })
  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [orders, setOrders] = useState<VendorOrder[]>([])

  // Header state
  const [showNotifications, setShowNotifications] = useState<boolean>(false)
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false)

  // Analytics & Payout State
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily')
  const [analyticsTimeline, setAnalyticsTimeline] = useState<VendorAnalyticsTimeline[]>([])
  const [analyticsBestSellers, setAnalyticsBestSellers] = useState<VendorBestSeller[]>([])
  const [transactions, setTransactions] = useState<VendorTransaction[]>([])
  const [payouts, setPayouts] = useState<VendorPayout[]>([])
  const [showPayoutModal, setShowPayoutModal] = useState<boolean>(false)
  const [payoutAmount, setPayoutAmount] = useState<string>('')
  const [payoutBankDetails, setPayoutBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: '',
  })
  const [payoutSubmitting, setPayoutSubmitting] = useState<boolean>(false)
  const [downloadingReport, setDownloadingReport] = useState<boolean>(false)

  // Products filtering & search
  const [productSearch, setProductSearch] = useState<string>('')
  const [productFilter, setProductFilter] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  // Orders filtering & tracking modal
  const [orderSearch, setOrderSearch] = useState<string>('')
  const [orderFilter, setOrderFilter] = useState<string>('ALL')
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<VendorOrder | null>(null)
  const [trackingForm, setTrackingForm] = useState({ carrier: '', trackingNumber: '' })
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  // Add/Edit Product Form state
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [productFormSubmitting, setProductFormSubmitting] = useState<boolean>(false)
  const [productFormData, setProductFormData] = useState({
    name: '',
    category: 'Streetwear',
    subcategory: '',
    brand: 'KALA',
    description: '',
    price: '',
    mrp: '',
    costPrice: '',
    weight: '280',
    estimatedDispatchDays: '2',
    discountPrice: '',
    image: '',
    images: [] as string[],
    newImageUrl: '',
    sizes: ['M', 'L', 'XL'],
    colors: 'Black, White',
    stock: '50',
    sku: '',
    shippingInfo: 'Standard dispatch: 2-3 business days. Free shipping above ₹999.',
  })

  // Store Profile editing state
  const [shopFormSubmitting, setShopFormSubmitting] = useState<boolean>(false)
  const [shopFormData, setShopFormData] = useState({
    shopName: '',
    category: 'Clothing Brand',
    description: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    state: '',
    logo: '',
    banner: '',
    isActive: true,
  })

  // Rejection details modal
  const [viewingRejection, setViewingRejection] = useState<{ name: string; reason: string } | null>(null)

  useEffect(() => {
    loadAllDashboardData()
  }, [])

  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setSearchParams({ tab })
    setSuccessMessage(null)
    setError(null)
  }

  const loadAllDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. Fetch vendor me & status
      const meData = await getVendorMe()
      setVendorProfile(meData.vendorProfile)
      setShop(meData.shop)

      if (meData.shop) {
        setShopFormData({
          shopName: meData.shop.shopName || '',
          category: meData.shop.category || 'Clothing Brand',
          description: meData.shop.description || '',
          contactEmail: meData.shop.contactEmail || '',
          contactPhone: meData.shop.contactPhone || '',
          address: meData.shop.address || '',
          city: meData.shop.city || '',
          state: meData.shop.state || '',
          logo: meData.shop.logo || '',
          banner: meData.shop.banner || '',
          isActive: meData.shop.isActive !== false,
        })
      }

      // 2. Load stats, catalog products, orders, analytics, transactions, and payouts
      const [statsRes, prodsRes, ordersRes, analyticsRes, txnsRes, payoutsRes] = await Promise.all([
        getVendorStats().catch(() => ({ success: true, stats })),
        getVendorProducts().catch(() => ({ success: true, products: [] })),
        getVendorOrders().catch(() => ({ success: true, orders: [] })),
        getVendorAnalytics({ period: analyticsPeriod }).catch(() => ({ success: true, timeline: [], bestSellers: [] })),
        getVendorTransactions().catch(() => ({ success: true, transactions: [] })),
        getVendorPayouts().catch(() => ({ success: true, payouts: [] })),
      ])

      if (statsRes.stats) setStats(statsRes.stats)
      if (prodsRes.products) setProducts(prodsRes.products)
      if (ordersRes.orders) setOrders(ordersRes.orders)
      if (analyticsRes.timeline) setAnalyticsTimeline(analyticsRes.timeline)
      if (analyticsRes.bestSellers) setAnalyticsBestSellers(analyticsRes.bestSellers)
      if (txnsRes.transactions) setTransactions(txnsRes.transactions)
      if (payoutsRes.payouts) setPayouts(payoutsRes.payouts)
    } catch (err: any) {
      console.error('Failed to load vendor dashboard:', err)
      setError(err.message || 'Please log in to access your vendor seller dashboard.')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeAnalyticsPeriod = async (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setAnalyticsPeriod(period)
    try {
      const res = await getVendorAnalytics({ period })
      if (res.timeline) setAnalyticsTimeline(res.timeline)
      if (res.bestSellers) setAnalyticsBestSellers(res.bestSellers)
    } catch (err) {
      console.warn('Failed to switch analytics period:', err)
    }
  }

  const handleDownloadSalesReport = async () => {
    setDownloadingReport(true)
    try {
      const data = await downloadVendorSalesReport()
      if (data.salesData && data.salesData.length > 0) {
        // Build CSV string
        const headers = Object.keys(data.salesData[0]).join(',')
        const rows = data.salesData.map((row: any) =>
          Object.values(row)
            .map((val) => `"${String(val).replace(/"/g, '""')}"`)
            .join(',')
        )
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n')
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `KALA_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setSuccessMessage('Sales report downloaded successfully as CSV.')
      } else {
        alert('No sales data available to download yet.')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to download sales report.')
    } finally {
      setDownloadingReport(false)
    }
  }

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault()
    setPayoutSubmitting(true)
    try {
      const res = await requestVendorPayout({
        amount: Number(payoutAmount),
        bankDetails: payoutBankDetails,
      })
      setSuccessMessage(res.message || 'Payout requested successfully!')
      setShowPayoutModal(false)
      setPayoutAmount('')
      // Refresh stats & payouts
      const [sRes, pRes, tRes] = await Promise.all([getVendorStats(), getVendorPayouts(), getVendorTransactions()])
      if (sRes.stats) setStats(sRes.stats)
      if (pRes.payouts) setPayouts(pRes.payouts)
      if (tRes.transactions) setTransactions(tRes.transactions)
    } catch (err: any) {
      alert(err.message || 'Failed to submit payout request.')
    } finally {
      setPayoutSubmitting(false)
    }
  }

  const handleLogout = () => {
    clearAuthToken()
    navigate('/account')
  }

  // --- PRODUCT MANAGEMENT ACTIONS ---
  const handleToggleProductStatus = async (id: string) => {
    try {
      const res = await toggleVendorProductStatus(id)
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, available: res.product.available, status: res.product.status } : p))
      )
      // Refresh stats
      const statsRes = await getVendorStats().catch(() => null)
      if (statsRes?.stats) setStats(statsRes.stats)
    } catch (err: any) {
      alert(err.message || 'Failed to toggle product status.')
    }
  }

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from your catalog?`)) {
      return
    }
    try {
      await deleteVendorProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      setSuccessMessage(`Product "${name}" deleted successfully.`)
      // Refresh stats
      const statsRes = await getVendorStats().catch(() => null)
      if (statsRes?.stats) setStats(statsRes.stats)
    } catch (err: any) {
      alert(err.message || 'Failed to delete product.')
    }
  }

  const startEditProduct = (prod: MarketplaceProduct) => {
    setEditingProductId(prod.id)
    setProductFormData({
      name: prod.name || '',
      category: prod.category || 'Streetwear',
      subcategory: prod.subcategory || '',
      brand: (prod as any).brand || 'KALA',
      description: prod.description || '',
      price: String(prod.price || ''),
      mrp: prod.mrp ? String(prod.mrp) : '',
      costPrice: (prod as any).costPrice ? String((prod as any).costPrice) : '',
      weight: (prod as any).weight ? String((prod as any).weight) : '280',
      estimatedDispatchDays: (prod as any).estimatedDispatchDays ? String((prod as any).estimatedDispatchDays) : '2',
      discountPrice: prod.discountPrice ? String(prod.discountPrice) : '',
      image: prod.image || '',
      images: prod.images || (prod.image ? [prod.image] : []),
      newImageUrl: '',
      sizes: prod.sizes || ['M', 'L'],
      colors: Array.isArray(prod.colors) ? prod.colors.join(', ') : 'Black, White',
      stock: prod.stock !== undefined ? String(prod.stock) : '50',
      sku: prod.sku || '',
      shippingInfo: prod.shippingInfo || 'Standard dispatch: 2-3 business days.',
    })
    handleTabChange('add-product')
  }

  const resetProductForm = () => {
    setEditingProductId(null)
    setProductFormData({
      name: '',
      category: 'Streetwear',
      subcategory: '',
      brand: 'KALA',
      description: '',
      price: '',
      mrp: '',
      costPrice: '',
      weight: '280',
      estimatedDispatchDays: '2',
      discountPrice: '',
      image: '',
      images: [],
      newImageUrl: '',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: 'Black, White',
      stock: '50',
      sku: '',
      shippingInfo: 'Standard dispatch: 2-3 business days. Free shipping above ₹999.',
    })
  }

  const handleAddImage = (url: string) => {
    if (!url.trim()) return
    setProductFormData((prev) => {
      const updated = [...prev.images, url.trim()]
      return {
        ...prev,
        images: updated,
        image: prev.image || url.trim(),
        newImageUrl: '',
      }
    })
  }

  const handleRemoveImage = (index: number) => {
    setProductFormData((prev) => {
      const updated = prev.images.filter((_, i) => i !== index)
      return {
        ...prev,
        images: updated,
        image: updated[0] || '',
      }
    })
  }

  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be under 5MB.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleAddImage(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProductSubmit = async (targetApproval: 'DRAFT' | 'PENDING') => {
    setError(null)
    setSuccessMessage(null)

    if (!productFormData.name.trim()) {
      setError('Please provide a product name.')
      return
    }
    if (!productFormData.price || Number(productFormData.price) <= 0) {
      setError('Please provide a valid selling price.')
      return
    }
    if (!productFormData.image && productFormData.images.length === 0) {
      setError('Please provide at least one product image.')
      return
    }

    setProductFormSubmitting(true)
    try {
      const payload: any = {
        name: productFormData.name.trim(),
        category: productFormData.category.trim(),
        subcategory: productFormData.subcategory.trim(),
        brand: productFormData.brand.trim() || undefined,
        description: productFormData.description.trim(),
        price: Number(productFormData.price),
        mrp: productFormData.mrp ? Number(productFormData.mrp) : undefined,
        costPrice: productFormData.costPrice ? Number(productFormData.costPrice) : undefined,
        weight: productFormData.weight ? Number(productFormData.weight) : undefined,
        estimatedDispatchDays: productFormData.estimatedDispatchDays ? Number(productFormData.estimatedDispatchDays) : undefined,
        discountPrice: productFormData.discountPrice ? Number(productFormData.discountPrice) : undefined,
        image: productFormData.image || productFormData.images[0] || '',
        images: productFormData.images.length > 0 ? productFormData.images : [productFormData.image],
        sizes: productFormData.sizes,
        colors: productFormData.colors.split(',').map((c) => c.trim()).filter(Boolean),
        stock: Number(productFormData.stock) || 0,
        sku: productFormData.sku.trim(),
        shippingInfo: productFormData.shippingInfo.trim(),
        approvalStatus: targetApproval,
      }

      if (editingProductId) {
        await updateVendorProduct(editingProductId, payload)
        setSuccessMessage('Product updated successfully!')
      } else {
        await createVendorProduct(payload)
        setSuccessMessage(
          targetApproval === 'DRAFT'
            ? 'Product saved as draft!'
            : 'Product submitted for approval! Once verified, it will be visible in the catalog.'
        )
      }

      resetProductForm()
      // Reload products & stats
      const [pRes, sRes] = await Promise.all([getVendorProducts(), getVendorStats()])
      if (pRes.products) setProducts(pRes.products)
      if (sRes.stats) setStats(sRes.stats)
      setTimeout(() => handleTabChange('products'), 1200)
    } catch (err: any) {
      console.error('Error saving product:', err)
      setError(err.message || 'Failed to save product.')
    } finally {
      setProductFormSubmitting(false)
    }
  }

  // --- ORDER MANAGEMENT ACTIONS ---
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId)
    try {
      await updateVendorOrderStatus(orderId, { status: newStatus })
      setOrders((prev) =>
        prev.map((ord) => (ord.orderId === orderId ? { ...ord, status: newStatus as any } : ord))
      )
      setSuccessMessage(`Order #${orderId} status updated to "${newStatus}".`)
      // Refresh stats
      const sRes = await getVendorStats().catch(() => null)
      if (sRes?.stats) setStats(sRes.stats)
    } catch (err: any) {
      alert(err.message || 'Failed to update order status.')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrderForTracking) return

    try {
      await updateVendorOrderStatus(selectedOrderForTracking.orderId, {
        carrier: trackingForm.carrier,
        trackingNumber: trackingForm.trackingNumber,
        status: 'shipped',
      })
      setOrders((prev) =>
        prev.map((ord) =>
          ord.orderId === selectedOrderForTracking.orderId
            ? {
                ...ord,
                status: 'shipped',
                tracking: { carrier: trackingForm.carrier, trackingNumber: trackingForm.trackingNumber },
              }
            : ord
        )
      )
      setSuccessMessage(`Tracking details saved for Order #${selectedOrderForTracking.orderId}.`)
      setSelectedOrderForTracking(null)
    } catch (err: any) {
      alert(err.message || 'Failed to save tracking.')
    }
  }

  // --- STORE PROFILE ACTIONS ---
  const handleSaveShopProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setShopFormSubmitting(true)
    try {
      const res = await updateVendorShop(shopFormData)
      setShop(res.shop)
      setSuccessMessage('Store profile updated successfully!')
    } catch (err: any) {
      console.error('Error updating shop:', err)
      setError(err.message || 'Failed to update store profile.')
    } finally {
      setShopFormSubmitting(false)
    }
  }

  // Filtering products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !productSearch.trim() ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))

    if (!matchesSearch) return false

    if (productFilter === 'ACTIVE') return (p.approvalStatus === 'APPROVED' || !p.approvalStatus) && p.available
    if (productFilter === 'PENDING') return p.approvalStatus === 'PENDING'
    if (productFilter === 'DRAFT') return p.approvalStatus === 'DRAFT'
    if (productFilter === 'REJECTED') return p.approvalStatus === 'REJECTED'
    if (productFilter === 'LOW_STOCK') return (p.stock || 0) <= 10
    return true
  })

  // Filtering orders
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      !orderSearch.trim() ||
      ord.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
      `${ord.customer.firstName} ${ord.customer.lastName}`.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.customer.email.toLowerCase().includes(orderSearch.toLowerCase())

    if (!matchesSearch) return false

    if (orderFilter === 'PENDING') return ['pending', 'confirmed'].includes(ord.status)
    if (orderFilter === 'PROCESSING') return ord.status === 'processing'
    if (orderFilter === 'SHIPPED') return ['shipped', 'out_for_delivery'].includes(ord.status)
    if (orderFilter === 'DELIVERED') return ord.status === 'delivered'
    if (orderFilter === 'CANCELLED') return ord.status === 'cancelled'
    return true
  })

  const isApproved = vendorProfile?.status === 'APPROVED'
  const isPending = vendorProfile?.status === 'PENDING'
  const isRejected = vendorProfile?.status === 'REJECTED'

  // Loading Screen
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#D94700', marginBottom: '0.5rem' }}>
          Loading KALA Merchant Workspace...
        </div>
        <p style={{ color: '#5F6368', fontSize: '0.9rem' }}>Synchronizing your store metrics and real catalog data.</p>
      </div>
    )
  }

  // Unauthenticated screen
  if (error && !vendorProfile) {
    return (
      <div className="vendor-portal-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="marketplace-empty-state" style={{ margin: '4rem auto' }}>
          <h2 className="marketplace-empty-title">Authentication Required</h2>
          <p className="marketplace-empty-desc">{error}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/account" className="marketplace-btn-primary">
              Log In
            </Link>
            <Link to="/vendor/register" className="marketplace-btn-secondary" style={{ color: '#111', borderColor: '#111' }}>
              Register Vendor
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="vendor-portal-container">
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="vendor-sidebar">
        <div className="vendor-sidebar-header">
          <div className="vendor-sidebar-brand">
            <span>{shop?.shopName || vendorProfile?.businessName || 'KALA Seller'}</span>
          </div>
          <span
            className={`badge-status ${
              isApproved
                ? 'badge-status-approved'
                : isPending
                ? 'badge-status-pending'
                : isRejected
                ? 'badge-status-rejected'
                : 'badge-status-draft'
            }`}
          >
            {vendorProfile?.status || 'PENDING'}
          </span>
        </div>

        <ul className="vendor-sidebar-nav">
          <li>
            <button
              type="button"
              className={`vendor-nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Overview
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`vendor-nav-link ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => handleTabChange('products')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              Manage Products ({products.length})
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`vendor-nav-link ${activeTab === 'add-product' ? 'active' : ''}`}
              onClick={() => {
                resetProductForm()
                handleTabChange('add-product')
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Add New Product
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`vendor-nav-link ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => handleTabChange('orders')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Manage Orders ({orders.length})
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`vendor-nav-link ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => handleTabChange('inventory')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              Inventory Management
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`vendor-nav-link ${activeTab === 'earnings' ? 'active' : ''}`}
              onClick={() => handleTabChange('earnings')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Payments & Earnings
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`vendor-nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => handleTabChange('profile')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Store Profile & Settings
            </button>
          </li>
          {shop?.slug && (
            <li style={{ marginTop: '1rem', borderTop: '1px solid #E5E2DD', paddingTop: '0.75rem' }}>
              <Link to={`/shop/${shop.slug}`} target="_blank" rel="noopener noreferrer" className="vendor-nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                View Live Storefront &rarr;
              </Link>
            </li>
          )}
        </ul>
      </aside>

      {/* 2. MAIN DASHBOARD CONTENT */}
      <main className="vendor-main-content">
        {/* HEADER BAR */}
        <div className="vendor-header-bar">
          <div className="vendor-welcome-info">
            <h1>
              Welcome back, {shop?.shopName || vendorProfile?.businessName || 'Merchant'}
              <span
                className={`badge-status ${
                  isApproved
                    ? 'badge-status-approved'
                    : isPending
                    ? 'badge-status-pending'
                    : isRejected
                    ? 'badge-status-rejected'
                    : 'badge-status-draft'
                }`}
              >
                {vendorProfile?.status || 'PENDING'}
              </span>
            </h1>
            <p>
              {shop?.slug ? `kalaofficial.store/shop/${shop.slug}` : 'Complete your setup to activate public storefront'}
            </p>
          </div>

          <div className="vendor-header-controls">
            {/* Notifications Button */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="vendor-header-btn"
                title="Notifications"
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setShowProfileMenu(false)
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {(isPending || isRejected || stats.pendingOrders > 0) && <span className="vendor-badge-dot" />}
              </button>

              {showNotifications && (
                <div className="vendor-dropdown-menu">
                  <div className="vendor-dropdown-header">
                    <span>Notifications</span>
                    <span style={{ fontSize: '0.75rem', color: '#D94700' }}>Live Updates</span>
                  </div>
                  <div>
                    {isPending && (
                      <div className="vendor-notif-item">
                        <div style={{ color: '#D97706' }}>&#9679;</div>
                        <div>
                          <div className="vendor-notif-title">Application Under Review</div>
                          <div>KALA admins are verifying your merchant documents.</div>
                          <div className="vendor-notif-time">Pending verification</div>
                        </div>
                      </div>
                    )}
                    {isApproved && (
                      <div className="vendor-notif-item">
                        <div style={{ color: '#059669' }}>&#9679;</div>
                        <div>
                          <div className="vendor-notif-title">Partner Verified</div>
                          <div>Your account is active. You can create storefronts and publish products.</div>
                          <div className="vendor-notif-time">Permanent</div>
                        </div>
                      </div>
                    )}
                    {stats.pendingOrders > 0 && (
                      <div className="vendor-notif-item">
                        <div style={{ color: '#2563EB' }}>&#9679;</div>
                        <div>
                          <div className="vendor-notif-title">{stats.pendingOrders} Orders Pending</div>
                          <div>You have orders awaiting fulfillment and shipping.</div>
                          <div className="vendor-notif-time">Action required</div>
                        </div>
                      </div>
                    )}
                    {products.some((p) => p.approvalStatus === 'PENDING') && (
                      <div className="vendor-notif-item">
                        <div style={{ color: '#D94700' }}>&#9679;</div>
                        <div>
                          <div className="vendor-notif-title">Products Awaiting Review</div>
                          <div>Items submitted are being checked for image quality.</div>
                        </div>
                      </div>
                    )}
                    {products.some((p) => p.approvalStatus === 'REJECTED') && (
                      <div className="vendor-notif-item">
                        <div style={{ color: '#DC2626' }}>&#9679;</div>
                        <div>
                          <div className="vendor-notif-title">Product Revision Required</div>
                          <div>One or more products were not approved. Check rejection reasons.</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu Button */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="vendor-header-btn"
                title="Profile Menu"
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu)
                  setShowNotifications(false)
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>

              {showProfileMenu && (
                <div className="vendor-dropdown-menu" style={{ width: '240px' }}>
                  <div className="vendor-dropdown-header">
                    <span>{vendorProfile?.businessName || 'Seller Account'}</span>
                  </div>
                  {shop?.slug && (
                    <Link
                      to={`/shop/${shop.slug}`}
                      className="vendor-dropdown-item"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      </svg>
                      View Live Store
                    </Link>
                  )}
                  <button
                    type="button"
                    className="vendor-dropdown-item"
                    onClick={() => {
                      setShowProfileMenu(false)
                      handleTabChange('profile')
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Store Settings
                  </button>
                  <Link to="/shop" className="vendor-dropdown-item" onClick={() => setShowProfileMenu(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                    </svg>
                    KALA Shop
                  </Link>
                  <button
                    type="button"
                    className="vendor-dropdown-item"
                    style={{ color: '#DC2626', borderTop: '1px solid #F0EEEB' }}
                    onClick={handleLogout}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Feedback Banners */}
        {error && (
          <div className="vendor-callout-card" style={{ borderLeftColor: '#EF4444', marginBottom: '1.5rem' }}>
            <div className="vendor-callout-text">
              <h3 style={{ color: '#991B1B' }}>Attention Required</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="vendor-callout-card" style={{ borderLeftColor: '#10B981', marginBottom: '1.5rem' }}>
            <div className="vendor-callout-text">
              <h3 style={{ color: '#065F46' }}>Success</h3>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {/* PENDING NOTIFICATION CALLOUT */}
        {isPending && (
          <div className="vendor-callout-card" style={{ borderLeftColor: '#F59E0B' }}>
            <div className="vendor-callout-text">
              <h3 style={{ color: '#92400E' }}>Application In Review</h3>
              <p>
                Your merchant application for <strong>{vendorProfile?.businessName}</strong> is currently pending
                KALA Administrator review. You can prepare your product drafts and store profile now. They will go live
                immediately upon verification.
              </p>
            </div>
            <span className="badge-status badge-status-pending">Status: PENDING</span>
          </div>
        )}

        {/* 2. 8 KEY REAL DATABASE STATISTICS CARDS */}
        <div className="vendor-stats-grid-8">
          <div className="vendor-stat-card">
            <div className="vendor-stat-header">
              <span className="vendor-stat-label">Total Products</span>
              <div className="vendor-stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
            </div>
            <div className="vendor-stat-num">{stats.totalProducts}</div>
            <div className="vendor-stat-note" style={{ color: '#5F6368' }}>
              {stats.draftProducts} drafts &middot; {stats.pendingProducts} pending
            </div>
          </div>

          <div className="vendor-stat-card">
            <div className="vendor-stat-header">
              <span className="vendor-stat-label">Active Products</span>
              <div className="vendor-stat-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
            </div>
            <div className="vendor-stat-num" style={{ color: '#059669' }}>
              {stats.activeProducts}
            </div>
            <div className="vendor-stat-note" style={{ color: '#059669' }}>
              Live in KALA Storefront
            </div>
          </div>

          <div className="vendor-stat-card">
            <div className="vendor-stat-header">
              <span className="vendor-stat-label">Total Orders</span>
              <div className="vendor-stat-icon" style={{ background: '#DBEAFE', color: '#1E40AF' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
            </div>
            <div className="vendor-stat-num">{stats.totalOrders}</div>
            <div className="vendor-stat-note" style={{ color: '#5F6368' }}>
              All-time customer orders
            </div>
          </div>

          <div className="vendor-stat-card">
            <div className="vendor-stat-header">
              <span className="vendor-stat-label">Pending Orders</span>
              <div className="vendor-stat-icon" style={{ background: '#FEF3C7', color: '#B45309' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>
            <div className="vendor-stat-num" style={{ color: stats.pendingOrders > 0 ? '#D94700' : '#111' }}>
              {stats.pendingOrders}
            </div>
            <div className="vendor-stat-note" style={{ color: stats.pendingOrders > 0 ? '#D94700' : '#5F6368' }}>
              Requires fulfillment
            </div>
          </div>

          <div className="vendor-stat-card">
            <div className="vendor-stat-header">
              <span className="vendor-stat-label">Products Sold</span>
              <div className="vendor-stat-icon" style={{ background: '#E0E7FF', color: '#4338CA' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
            </div>
            <div className="vendor-stat-num">{stats.productsSold ?? 0}</div>
            <div className="vendor-stat-note" style={{ color: '#5F6368' }}>
              Units shipped to buyers
            </div>
          </div>

          <div className="vendor-stat-card">
            <div className="vendor-stat-header">
              <span className="vendor-stat-label">Gross Sales</span>
              <div className="vendor-stat-icon" style={{ background: '#F3E8FF', color: '#7E22CE' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
            </div>
            <div className="vendor-stat-num">₹{(stats.grossSales ?? stats.totalEarnings ?? 0).toLocaleString('en-IN')}</div>
            <div className="vendor-stat-note" style={{ color: '#5F6368' }}>
              Total item merchandise value
            </div>
          </div>

          <div className="vendor-stat-card">
            <div className="vendor-stat-header">
              <span className="vendor-stat-label">Net Earnings</span>
              <div className="vendor-stat-icon" style={{ background: '#ECFDF5', color: '#047857' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
            </div>
            <div className="vendor-stat-num" style={{ color: '#047857' }}>
              ₹{(stats.netEarnings ?? (stats.totalEarnings * 0.95)).toLocaleString('en-IN')}
            </div>
            <div className="vendor-stat-note" style={{ color: '#047857' }}>
              After {stats.commissionRate ?? 5}% platform fee
            </div>
          </div>

          <div className="vendor-stat-card">
            <div className="vendor-stat-header">
              <span className="vendor-stat-label">Pending Payouts</span>
              <div className="vendor-stat-icon" style={{ background: '#FFFBEB', color: '#D97706' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 14 14" />
                </svg>
              </div>
            </div>
            <div className="vendor-stat-num" style={{ color: (stats.pendingPayouts ?? 0) > 0 ? '#D97706' : '#111' }}>
              ₹{(stats.pendingPayouts ?? 0).toLocaleString('en-IN')}
            </div>
            <div className="vendor-stat-note" style={{ color: '#5F6368' }}>
              In bank settlement queue
            </div>
          </div>
        </div>

        {/* 4. QUICK ACTIONS TOOLBAR */}
        <div className="vendor-quick-actions-bar">
          <button
            type="button"
            className="vendor-action-tile"
            onClick={() => {
              resetProductForm()
              handleTabChange('add-product')
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Add Product
          </button>

          <button type="button" className="vendor-action-tile" onClick={() => handleTabChange('products')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            Manage Products
          </button>

          <button type="button" className="vendor-action-tile" onClick={() => handleTabChange('orders')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Manage Orders
          </button>

          <button type="button" className="vendor-action-tile" onClick={() => handleTabChange('inventory')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            Inventory
          </button>

          <button type="button" className="vendor-action-tile" onClick={() => handleTabChange('earnings')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Earnings
          </button>

          <button type="button" className="vendor-action-tile" onClick={() => handleTabChange('profile')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Store Settings
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {/* Quick Prompt to setup Storefront if Approved without shop */}
            {isApproved && !shop && (
              <div className="vendor-callout-card" style={{ marginBottom: '2rem' }}>
                <div className="vendor-callout-text">
                  <h3>Your Account is Approved! Create Your Storefront</h3>
                  <p>
                    Set up your branded shop URL, upload your banner and logo, and begin receiving public orders.
                  </p>
                </div>
                <Link to="/vendor/shop/create" className="marketplace-btn-primary">
                  Setup Storefront Now
                </Link>
              </div>
            )}

            {/* Recent Orders Overview */}
            <div className="vendor-table-card" style={{ marginBottom: '2rem' }}>
              <div className="vendor-table-header">
                <div>
                  <div className="vendor-table-title">Recent Customer Orders</div>
                  <p style={{ color: '#5F6368', fontSize: '0.85rem' }}>Latest purchases containing your products</p>
                </div>
                <button
                  type="button"
                  className="btn-action-sm"
                  onClick={() => handleTabChange('orders')}
                >
                  View All Orders &rarr;
                </button>
              </div>

              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <p style={{ color: '#5F6368', fontSize: '0.95rem' }}>No orders placed yet.</p>
                  <p style={{ color: '#9CA3AF', fontSize: '0.82rem', marginTop: '0.25rem' }}>
                    Orders will appear here as soon as buyers purchase your products on KALA Marketplace.
                  </p>
                </div>
              ) : (
                <div className="vendor-table-wrap">
                  <table className="vendor-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.orderId}>
                          <td style={{ fontWeight: 700 }}>#{ord.orderId}</td>
                          <td>
                            {ord.customer.firstName} {ord.customer.lastName}
                          </td>
                          <td>{ord.items.reduce((acc, it) => acc + it.quantity, 0)} items</td>
                          <td style={{ fontWeight: 700 }}>₹{ord.vendorTotal.toLocaleString('en-IN')}</td>
                          <td>
                            <span className={`badge-status badge-status-${ord.status}`}>{ord.status}</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-action-sm"
                              onClick={() => handleTabChange('orders')}
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Products Overview */}
            <div className="vendor-table-card">
              <div className="vendor-table-header">
                <div>
                  <div className="vendor-table-title">Catalog Showcase</div>
                  <p style={{ color: '#5F6368', fontSize: '0.85rem' }}>Active and draft items in your seller collection</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn-action-sm"
                    style={{ backgroundColor: '#111', color: '#FFF' }}
                    onClick={() => {
                      resetProductForm()
                      handleTabChange('add-product')
                    }}
                  >
                    + Add Product
                  </button>
                  <button type="button" className="btn-action-sm" onClick={() => handleTabChange('products')}>
                    View All ({products.length})
                  </button>
                </div>
              </div>

              {products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                  <p style={{ color: '#5F6368', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
                    You have not added any products yet.
                  </p>
                  <button
                    type="button"
                    className="marketplace-btn-primary"
                    onClick={() => {
                      resetProductForm()
                      handleTabChange('add-product')
                    }}
                  >
                    Add First Product
                  </button>
                </div>
              ) : (
                <div className="vendor-table-wrap">
                  <table className="vendor-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Approval</th>
                        <th>Active</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slice(0, 5).map((p) => (
                        <tr key={p.id}>
                          <td>
                            <div className="product-row-info">
                              <img src={getProductImage(p.image)} alt={p.name} className="product-thumb" />
                              <div>
                                <div style={{ fontWeight: 600 }}>{p.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#5F6368' }}>SKU: {p.sku || p.id}</div>
                              </div>
                            </div>
                          </td>
                          <td>{p.category}</td>
                          <td>₹{p.price.toLocaleString('en-IN')}</td>
                          <td>
                            <span
                              style={{
                                color: (p.stock || 0) <= 5 ? '#DC2626' : (p.stock || 0) <= 15 ? '#D97706' : '#111',
                                fontWeight: 600,
                              }}
                            >
                              {p.stock !== undefined ? p.stock : 50}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge-status badge-status-${(p.approvalStatus || 'APPROVED').toLowerCase()}`}
                            >
                              {p.approvalStatus || 'APPROVED'}
                            </span>
                          </td>
                          <td>
                            <label className="vendor-switch">
                              <input
                                type="checkbox"
                                checked={Boolean(p.available)}
                                onChange={() => handleToggleProductStatus(p.id)}
                              />
                              <span className="vendor-slider" />
                            </label>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button
                                type="button"
                                className="btn-action-sm"
                                onClick={() => startEditProduct(p)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn-action-sm btn-action-delete"
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                              >
                                Del
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2 & 5: PRODUCT & INVENTORY MANAGEMENT */}
        {(activeTab === 'products' || activeTab === 'inventory') && (
          <div className="vendor-table-card">
            <div className="vendor-table-header">
              <div>
                <div className="vendor-table-title">
                  {activeTab === 'inventory' ? 'Inventory & Stock Management' : 'Product Catalog Management'}
                </div>
                <p style={{ color: '#5F6368', fontSize: '0.85rem' }}>
                  {filteredProducts.length} of {products.length} products displayed
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', border: '1px solid #E5E2DD', borderRadius: '6px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    style={{
                      padding: '0.4rem 0.65rem',
                      background: viewMode === 'table' ? '#111' : '#FFF',
                      color: viewMode === 'table' ? '#FFF' : '#111',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => setViewMode('table')}
                    title="Table View"
                  >
                    &#9776;
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: '0.4rem 0.65rem',
                      background: viewMode === 'grid' ? '#111' : '#FFF',
                      color: viewMode === 'grid' ? '#FFF' : '#111',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    &#9638;
                  </button>
                </div>
                <button
                  type="button"
                  className="btn-action-sm"
                  style={{ backgroundColor: '#D94700', color: '#FFF', borderColor: '#D94700' }}
                  onClick={() => {
                    resetProductForm()
                    handleTabChange('add-product')
                  }}
                >
                  + Add New Product
                </button>
              </div>
            </div>

            {/* Toolbar: Search and Filter Chips */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #E5E2DD' }}>
              <div className="vendor-toolbar">
                <div className="vendor-search-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by title, SKU, or product ID..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>

                <div className="vendor-filter-chips">
                  <button
                    type="button"
                    className={`vendor-filter-chip ${productFilter === 'ALL' ? 'active' : ''}`}
                    onClick={() => setProductFilter('ALL')}
                  >
                    All ({products.length})
                  </button>
                  <button
                    type="button"
                    className={`vendor-filter-chip ${productFilter === 'ACTIVE' ? 'active' : ''}`}
                    onClick={() => setProductFilter('ACTIVE')}
                  >
                    Active ({stats.activeProducts})
                  </button>
                  <button
                    type="button"
                    className={`vendor-filter-chip ${productFilter === 'PENDING' ? 'active' : ''}`}
                    onClick={() => setProductFilter('PENDING')}
                  >
                    Pending ({stats.pendingProducts})
                  </button>
                  <button
                    type="button"
                    className={`vendor-filter-chip ${productFilter === 'DRAFT' ? 'active' : ''}`}
                    onClick={() => setProductFilter('DRAFT')}
                  >
                    Drafts ({stats.draftProducts})
                  </button>
                  <button
                    type="button"
                    className={`vendor-filter-chip ${productFilter === 'REJECTED' ? 'active' : ''}`}
                    onClick={() => setProductFilter('REJECTED')}
                  >
                    Rejected ({stats.rejectedProducts})
                  </button>
                  <button
                    type="button"
                    className={`vendor-filter-chip ${productFilter === 'LOW_STOCK' ? 'active' : ''}`}
                    onClick={() => setProductFilter('LOW_STOCK')}
                  >
                    Low Stock (&le; 10)
                  </button>
                </div>
              </div>
            </div>

            {/* Product List Content */}
            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <p style={{ color: '#5F6368', fontSize: '1rem', marginBottom: '1.25rem' }}>
                  No products matched your criteria.
                </p>
                <button
                  type="button"
                  className="marketplace-btn-primary"
                  onClick={() => {
                    setProductSearch('')
                    setProductFilter('ALL')
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : viewMode === 'table' ? (
              <div className="vendor-table-wrap">
                <table className="vendor-table">
                  <thead>
                    <tr>
                      <th>Product Info</th>
                      <th>Category</th>
                      <th>Price & MRP</th>
                      <th>Stock Quantity</th>
                      <th>Approval Status</th>
                      <th>Storefront Visibility</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="product-row-info">
                            <img src={getProductImage(p.image)} alt={p.name} className="product-thumb" />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{p.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#5F6368' }}>
                                SKU: {p.sku || p.id} &middot; ID: {p.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{p.category}</span>
                          {p.subcategory && (
                            <div style={{ fontSize: '0.75rem', color: '#5F6368' }}>{p.subcategory}</div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>₹{p.price.toLocaleString('en-IN')}</div>
                          {p.mrp && p.mrp > p.price && (
                            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
                              MRP: ₹{p.mrp.toLocaleString('en-IN')}
                            </div>
                          )}
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color:
                                (p.stock || 0) === 0
                                  ? '#DC2626'
                                  : (p.stock || 0) <= 10
                                  ? '#D97706'
                                  : '#059669',
                            }}
                          >
                            {p.stock !== undefined ? p.stock : 50} in stock
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                            <span
                              className={`badge-status badge-status-${(p.approvalStatus || 'APPROVED').toLowerCase()}`}
                            >
                              {p.approvalStatus || 'APPROVED'}
                            </span>
                            {p.approvalStatus === 'REJECTED' && p.rejectionReason && (
                              <button
                                type="button"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#DC2626',
                                  fontSize: '0.72rem',
                                  textDecoration: 'underline',
                                  cursor: 'pointer',
                                  padding: 0,
                                }}
                                onClick={() =>
                                  setViewingRejection({ name: p.name, reason: p.rejectionReason || 'No details provided.' })
                                }
                              >
                                View Reason
                              </button>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label className="vendor-switch">
                              <input
                                type="checkbox"
                                checked={Boolean(p.available)}
                                onChange={() => handleToggleProductStatus(p.id)}
                              />
                              <span className="vendor-slider" />
                            </label>
                            <span style={{ fontSize: '0.78rem', color: p.available ? '#059669' : '#6B7280', fontWeight: 600 }}>
                              {p.available ? 'Active' : 'Off'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'nowrap' }}>
                            <button
                              type="button"
                              className="btn-action-sm"
                              title="Edit product"
                              onClick={() => startEditProduct(p)}
                            >
                              Edit
                            </button>
                            <Link
                              to={`/product/${p.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-action-sm"
                              title="View customer product page"
                            >
                              View
                            </Link>
                            <button
                              type="button"
                              className="btn-action-sm btn-action-delete"
                              title="Delete product"
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                            >
                              Del
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Grid View */
              <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E5E2DD',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '1', background: '#F4F3EF' }}>
                      <img
                        src={getProductImage(p.image)}
                        alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span
                        className={`badge-status badge-status-${(p.approvalStatus || 'APPROVED').toLowerCase()}`}
                        style={{ position: 'absolute', top: '8px', left: '8px' }}
                      >
                        {p.approvalStatus || 'APPROVED'}
                      </span>
                    </div>
                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '0.75rem', color: '#5F6368', textTransform: 'uppercase' }}>{p.category}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0.2rem 0 0.5rem' }}>{p.name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 'auto', marginBottom: '0.75rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>₹{p.price.toLocaleString('en-IN')}</span>
                        <span style={{ fontSize: '0.8rem', color: (p.stock || 0) <= 10 ? '#D97706' : '#059669', fontWeight: 600 }}>
                          Stock: {p.stock !== undefined ? p.stock : 50}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #F0EEEB', paddingTop: '0.75rem' }}>
                        <button
                          type="button"
                          className="btn-action-sm"
                          style={{ flex: 1, justifyContent: 'center' }}
                          onClick={() => startEditProduct(p)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-action-sm btn-action-delete"
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                        >
                          Del
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ADD / EDIT PRODUCT FORM */}
        {activeTab === 'add-product' && (
          <div className="vendor-table-card">
            <div className="vendor-table-header">
              <div>
                <div className="vendor-table-title">
                  {editingProductId ? `Edit Product: ${productFormData.name}` : 'Add New Product to Storefront'}
                </div>
                <p style={{ color: '#5F6368', fontSize: '0.85rem' }}>
                  Upload high-resolution photography, configure sizes, stock and pricing.
                </p>
              </div>
              <button
                type="button"
                className="btn-action-sm"
                onClick={() => {
                  resetProductForm()
                  handleTabChange('products')
                }}
              >
                &larr; Back to Catalog
              </button>
            </div>

            <div style={{ padding: '1.75rem clamp(1rem, 3vw, 2.5rem)' }}>
              <div className="vendor-form-grid">
                {/* 1. Basic Information */}
                <div className="vendor-form-group full-width">
                  <label className="vendor-form-label">
                    Product Title <span>*</span>
                  </label>
                  <input
                    type="text"
                    className="vendor-form-input"
                    placeholder="e.g. Heavyweight Oversized Vintage Tee (240 GSM)"
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                  />
                </div>

                <div className="vendor-form-group">
                  <label className="vendor-form-label">
                    Category <span>*</span>
                  </label>
                  <select
                    className="vendor-form-select"
                    value={productFormData.category}
                    onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="vendor-form-group">
                  <label className="vendor-form-label">Subcategory / Collection</label>
                  <input
                    type="text"
                    className="vendor-form-input"
                    placeholder="e.g. Oversized Tees, Graphic Hoodies, Acid Wash"
                    value={productFormData.subcategory}
                    onChange={(e) => setProductFormData({ ...productFormData, subcategory: e.target.value })}
                  />
                </div>

                <div className="vendor-form-group">
                  <label className="vendor-form-label">Brand / Label Name</label>
                  <input
                    type="text"
                    className="vendor-form-input"
                    placeholder="e.g. KALA, Urban Vibe, etc."
                    value={productFormData.brand}
                    onChange={(e) => setProductFormData({ ...productFormData, brand: e.target.value })}
                  />
                </div>

                <div className="vendor-form-group full-width">
                  <label className="vendor-form-label">Product Description</label>
                  <textarea
                    className="vendor-form-textarea"
                    placeholder="Describe fabric weight, feel, fit, printing method, and wash instructions..."
                    rows={4}
                    value={productFormData.description}
                    onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                  />
                </div>

                {/* 2. Image Gallery & Uploads */}
                <div className="vendor-form-group full-width" style={{ borderTop: '1px solid #E5E2DD', paddingTop: '1.25rem' }}>
                  <label className="vendor-form-label">
                    Product Images (Multi-Image Upload) <span>*</span>
                  </label>
                  <p style={{ fontSize: '0.82rem', color: '#5F6368', marginBottom: '0.75rem' }}>
                    Upload images from your device or paste direct image URLs. First image is used as primary catalog thumbnail.
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="vendor-form-input"
                      placeholder="Paste image URL (https://...)..."
                      style={{ flex: 1, minWidth: '240px' }}
                      value={productFormData.newImageUrl}
                      onChange={(e) => setProductFormData({ ...productFormData, newImageUrl: e.target.value })}
                    />
                    <button
                      type="button"
                      className="btn-action-sm"
                      style={{ height: '42px', padding: '0 1rem' }}
                      onClick={() => handleAddImage(productFormData.newImageUrl)}
                    >
                      Add URL
                    </button>
                    <label
                      className="btn-action-sm"
                      style={{
                        height: '42px',
                        padding: '0 1rem',
                        cursor: 'pointer',
                        backgroundColor: '#111',
                        color: '#FFF',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      <span>Upload from Device</span>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLocalImageUpload} />
                    </label>
                  </div>

                  {/* Images preview gallery */}
                  <div className="vendor-gallery-grid">
                    {productFormData.images.map((imgUrl, idx) => (
                      <div key={idx} className="vendor-gallery-thumb">
                        <img src={imgUrl} alt={`Preview ${idx + 1}`} />
                        {idx === 0 && <span className="vendor-gallery-primary-pill">Primary</span>}
                        <button
                          type="button"
                          className="vendor-gallery-del"
                          title="Remove image"
                          onClick={() => handleRemoveImage(idx)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Pricing & Inventory */}
                <div className="vendor-form-group">
                  <label className="vendor-form-label">
                    Selling Price (₹) <span>*</span>
                  </label>
                  <input
                    type="number"
                    className="vendor-form-input"
                    placeholder="999"
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                  />
                </div>

                <div className="vendor-form-group">
                  <label className="vendor-form-label">MRP (₹ Original List Price)</label>
                  <input
                    type="number"
                    className="vendor-form-input"
                    placeholder="1499"
                    value={productFormData.mrp}
                    onChange={(e) => setProductFormData({ ...productFormData, mrp: e.target.value })}
                  />
                </div>

                <div className="vendor-form-group">
                  <label className="vendor-form-label">Stock Quantity</label>
                  <input
                    type="number"
                    className="vendor-form-input"
                    placeholder="50"
                    value={productFormData.stock}
                    onChange={(e) => setProductFormData({ ...productFormData, stock: e.target.value })}
                  />
                </div>

                <div className="vendor-form-group">
                  <label className="vendor-form-label">SKU Code</label>
                  <input
                    type="text"
                    className="vendor-form-input"
                    placeholder="e.g. KALA-TSHIRT-BLK-01"
                    value={productFormData.sku}
                    onChange={(e) => setProductFormData({ ...productFormData, sku: e.target.value })}
                  />
                </div>

                <div className="vendor-form-group">
                  <label className="vendor-form-label">Cost Price (₹ Private vendor cost)</label>
                  <input
                    type="number"
                    className="vendor-form-input"
                    placeholder="450"
                    value={productFormData.costPrice}
                    onChange={(e) => setProductFormData({ ...productFormData, costPrice: e.target.value })}
                  />
                </div>

                <div className="vendor-form-group">
                  <label className="vendor-form-label">Package Weight (Grams)</label>
                  <input
                    type="number"
                    className="vendor-form-input"
                    placeholder="280"
                    value={productFormData.weight}
                    onChange={(e) => setProductFormData({ ...productFormData, weight: e.target.value })}
                  />
                </div>

                <div className="vendor-form-group">
                  <label className="vendor-form-label">Estimated Dispatch (Days)</label>
                  <input
                    type="number"
                    className="vendor-form-input"
                    placeholder="2"
                    value={productFormData.estimatedDispatchDays}
                    onChange={(e) => setProductFormData({ ...productFormData, estimatedDispatchDays: e.target.value })}
                  />
                </div>

                {/* 4. Variants: Sizes & Colors */}
                <div className="vendor-form-group full-width" style={{ borderTop: '1px solid #E5E2DD', paddingTop: '1.25rem' }}>
                  <label className="vendor-form-label">Available Size Variants</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                    {AVAILABLE_SIZES.map((sz) => {
                      const isSelected = productFormData.sizes.includes(sz)
                      return (
                        <button
                          key={sz}
                          type="button"
                          className={`variant-chip ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            setProductFormData((prev) => ({
                              ...prev,
                              sizes: isSelected ? prev.sizes.filter((s) => s !== sz) : [...prev.sizes, sz],
                            }))
                          }}
                        >
                          {sz}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="vendor-form-group full-width">
                  <label className="vendor-form-label">Colour Variants (comma-separated)</label>
                  <input
                    type="text"
                    className="vendor-form-input"
                    placeholder="e.g. Acid Wash Black, Sage Green, Bone White"
                    value={productFormData.colors}
                    onChange={(e) => setProductFormData({ ...productFormData, colors: e.target.value })}
                  />
                </div>

                <div className="vendor-form-group full-width">
                  <label className="vendor-form-label">Shipping & Dispatch Information</label>
                  <input
                    type="text"
                    className="vendor-form-input"
                    placeholder="e.g. Dispatched in 48 hours. Free standard delivery across India."
                    value={productFormData.shippingInfo}
                    onChange={(e) => setProductFormData({ ...productFormData, shippingInfo: e.target.value })}
                  />
                </div>
              </div>

              {/* Form Buttons: Save Draft vs Submit for Approval */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '1rem',
                  marginTop: '2rem',
                  borderTop: '1px solid #E5E2DD',
                  paddingTop: '1.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  className="btn-action-sm"
                  style={{ padding: '0.85rem 1.75rem', fontSize: '0.92rem' }}
                  disabled={productFormSubmitting}
                  onClick={() => handleProductSubmit('DRAFT')}
                >
                  {productFormSubmitting ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  type="button"
                  className="marketplace-btn-primary"
                  style={{ padding: '0.85rem 2rem' }}
                  disabled={productFormSubmitting}
                  onClick={() => handleProductSubmit('PENDING')}
                >
                  {productFormSubmitting
                    ? 'Submitting...'
                    : editingProductId
                    ? 'Save & Submit Changes'
                    : 'Submit for Approval'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ORDER MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="vendor-table-card">
            <div className="vendor-table-header">
              <div>
                <div className="vendor-table-title">Merchant Order Fulfillment</div>
                <p style={{ color: '#5F6368', fontSize: '0.85rem' }}>
                  Track customer orders, manage shipments, update tracking numbers
                </p>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{filteredOrders.length} Orders</span>
            </div>

            {/* Orders Toolbar */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #E5E2DD' }}>
              <div className="vendor-toolbar">
                <div className="vendor-search-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by Order ID, customer name, email..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>

                <div className="vendor-filter-chips">
                  <button
                    type="button"
                    className={`vendor-filter-chip ${orderFilter === 'ALL' ? 'active' : ''}`}
                    onClick={() => setOrderFilter('ALL')}
                  >
                    All ({orders.length})
                  </button>
                  <button
                    type="button"
                    className={`vendor-filter-chip ${orderFilter === 'PENDING' ? 'active' : ''}`}
                    onClick={() => setOrderFilter('PENDING')}
                  >
                    New / Pending
                  </button>
                  <button
                    type="button"
                    className={`vendor-filter-chip ${orderFilter === 'PROCESSING' ? 'active' : ''}`}
                    onClick={() => setOrderFilter('PROCESSING')}
                  >
                    Processing
                  </button>
                  <button
                    type="button"
                    className={`vendor-filter-chip ${orderFilter === 'SHIPPED' ? 'active' : ''}`}
                    onClick={() => setOrderFilter('SHIPPED')}
                  >
                    Shipped
                  </button>
                  <button
                    type="button"
                    className={`vendor-filter-chip ${orderFilter === 'DELIVERED' ? 'active' : ''}`}
                    onClick={() => setOrderFilter('DELIVERED')}
                  >
                    Delivered
                  </button>
                  <button
                    type="button"
                    className={`vendor-filter-chip ${orderFilter === 'CANCELLED' ? 'active' : ''}`}
                    onClick={() => setOrderFilter('CANCELLED')}
                  >
                    Cancelled
                  </button>
                </div>
              </div>
            </div>

            {/* Orders Cards List */}
            <div style={{ padding: '1.5rem' }}>
              {filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                  <p style={{ color: '#5F6368', fontSize: '1rem' }}>No orders found.</p>
                </div>
              ) : (
                filteredOrders.map((ord) => (
                  <div key={ord.orderId} className="vendor-order-card">
                    {/* Top Row: Order ID, Date, Status */}
                    <div className="vendor-order-top-row">
                      <div className="vendor-order-id-block">
                        <span className="vendor-order-id">Order #{ord.orderId}</span>
                        <span className="vendor-order-date">
                          Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span className={`badge-status badge-status-${ord.status}`}>{ord.status}</span>
                        <select
                          className="vendor-form-select"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem' }}
                          value={ord.status}
                          disabled={updatingOrderId === ord.orderId}
                          onChange={(e) => handleUpdateOrderStatus(ord.orderId, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Customer & Shipping Details */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1rem',
                        fontSize: '0.85rem',
                        background: '#FAF9F6',
                        padding: '0.85rem 1.15rem',
                        borderRadius: '8px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#111' }}>Customer Contact</div>
                        <div>
                          {ord.customer.firstName} {ord.customer.lastName}
                        </div>
                        <div>{ord.customer.email}</div>
                        <div>Phone: {ord.customer.phone || 'N/A'}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#111' }}>Shipping Destination</div>
                        <div>{ord.shippingAddress.address}</div>
                        <div>
                          {ord.shippingAddress.city}, {ord.shippingAddress.state} - {ord.shippingAddress.pincode}
                        </div>
                        {ord.shippingAddress.landmark && <div>Landmark: {ord.shippingAddress.landmark}</div>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#111' }}>Logistics / Tracking</div>
                        {ord.tracking?.trackingNumber ? (
                          <div>
                            <div>Carrier: {ord.tracking.carrier || 'Standard'}</div>
                            <div>AWB: {ord.tracking.trackingNumber}</div>
                          </div>
                        ) : (
                          <div style={{ color: '#9CA3AF' }}>No tracking entered yet</div>
                        )}
                        <button
                          type="button"
                          className="btn-action-sm"
                          style={{ marginTop: '0.4rem' }}
                          onClick={() => {
                            setSelectedOrderForTracking(ord)
                            setTrackingForm({
                              carrier: ord.tracking?.carrier || 'Delhivery',
                              trackingNumber: ord.tracking?.trackingNumber || '',
                            })
                          }}
                        >
                          {ord.tracking?.trackingNumber ? 'Edit Tracking' : '+ Add Tracking'}
                        </button>
                      </div>
                    </div>

                    {/* Ordered Items belonging to this vendor */}
                    <div className="vendor-order-items-list">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="vendor-order-item-row">
                          <div className="vendor-order-item-left">
                            <img src={getProductImage(item.image)} alt={item.name} className="vendor-order-item-thumb" />
                            <div>
                              <div style={{ fontWeight: 600 }}>{item.name}</div>
                              <div style={{ fontSize: '0.78rem', color: '#5F6368' }}>
                                Size: {item.size} {item.color ? `· Color: ${item.color}` : ''} · Qty: {item.quantity}
                              </div>
                            </div>
                          </div>
                          <div style={{ fontWeight: 700 }}>₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}</div>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="vendor-order-footer">
                      <span style={{ fontSize: '0.85rem', color: '#5F6368' }}>
                        {ord.items.reduce((acc, it) => acc + it.quantity, 0)} Items for your store
                      </span>
                      <div style={{ fontSize: '1rem', fontWeight: 800 }}>
                        Your Order Revenue: ₹{ord.vendorTotal.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 6: PAYMENTS & EARNINGS */}
        {activeTab === 'earnings' && (
          <div>
            {/* Header with Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111', margin: 0 }}>Financial Overview & Settlements</h2>
                <p style={{ color: '#5F6368', fontSize: '0.88rem', margin: '0.25rem 0 0' }}>
                  Auditable transaction ledger, commission deductions, and automated bank payouts
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-action-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#FFFFFF' }}
                  onClick={handleDownloadSalesReport}
                  disabled={downloadingReport}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {downloadingReport ? 'Generating...' : 'Export Sales (CSV)'}
                </button>
                <button
                  type="button"
                  className="marketplace-btn-primary"
                  style={{ padding: '0.55rem 1.25rem', fontSize: '0.88rem' }}
                  onClick={() => setShowPayoutModal(true)}
                >
                  + Request Payout
                </button>
              </div>
            </div>

            {/* Financial Metrics Summary */}
            <div className="vendor-stats-grid-8" style={{ marginBottom: '2rem' }}>
              <div className="vendor-stat-card">
                <span className="vendor-stat-label">Gross Revenue</span>
                <div className="vendor-stat-num">₹{(stats.grossSales ?? stats.totalEarnings ?? 0).toLocaleString('en-IN')}</div>
                <div className="vendor-stat-note" style={{ color: '#5F6368' }}>
                  From {stats.totalOrders} total sales
                </div>
              </div>

              <div className="vendor-stat-card">
                <span className="vendor-stat-label">Platform Fee ({stats.commissionRate ?? 5}%)</span>
                <div className="vendor-stat-num" style={{ color: '#5F6368' }}>
                  ₹{(stats.commissionDeducted ?? (stats.totalEarnings * 0.05)).toFixed(2)}
                </div>
                <div className="vendor-stat-note" style={{ color: '#5F6368' }}>
                  Marketplace service fee
                </div>
              </div>

              <div className="vendor-stat-card">
                <span className="vendor-stat-label">Net Lifetime Earnings</span>
                <div className="vendor-stat-num" style={{ color: '#047857' }}>
                  ₹{(stats.netEarnings ?? (stats.totalEarnings * 0.95)).toFixed(2)}
                </div>
                <div className="vendor-stat-note" style={{ color: '#047857' }}>
                  All-time vendor share
                </div>
              </div>

              <div className="vendor-stat-card">
                <span className="vendor-stat-label">Available for Payout</span>
                <div className="vendor-stat-num" style={{ color: '#D94700' }}>
                  ₹{(stats.availablePayout ?? ((stats.netEarnings ?? (stats.totalEarnings * 0.95)) - (stats.pendingPayouts ?? 0))).toFixed(2)}
                </div>
                <div className="vendor-stat-note" style={{ color: '#D94700', fontWeight: 600 }}>
                  Ready to withdraw
                </div>
              </div>

              <div className="vendor-stat-card">
                <span className="vendor-stat-label">Pending Payouts</span>
                <div className="vendor-stat-num" style={{ color: '#D97706' }}>
                  ₹{(stats.pendingPayouts ?? 0).toFixed(2)}
                </div>
                <div className="vendor-stat-note" style={{ color: '#5F6368' }}>
                  Processing transfer
                </div>
              </div>

              <div className="vendor-stat-card">
                <span className="vendor-stat-label">Completed Payouts</span>
                <div className="vendor-stat-num" style={{ color: '#111' }}>
                  ₹{(stats.completedPayouts ?? 0).toFixed(2)}
                </div>
                <div className="vendor-stat-note" style={{ color: '#059669' }}>
                  Settled to bank
                </div>
              </div>
            </div>

            {/* Revenue Analytics Timeline Chart */}
            <div className="vendor-chart-card">
              <div className="vendor-chart-header">
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#111' }}>Sales Revenue Timeline</h3>
                  <p style={{ color: '#6B7280', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>
                    Time-bucketed revenue metrics from real database orders
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', background: '#F4F3EF', padding: '3px', borderRadius: '8px' }}>
                  {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`vendor-filter-chip ${analyticsPeriod === p ? 'active' : ''}`}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', textTransform: 'capitalize' }}
                      onClick={() => handleChangeAnalyticsPeriod(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {analyticsTimeline.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6B7280' }}>
                  <p>No revenue data recorded for this time range yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '220px', overflowX: 'auto', padding: '1rem 0' }}>
                  {(() => {
                    const maxVal = Math.max(...analyticsTimeline.map((t) => t.revenue), 100)
                    return analyticsTimeline.map((item, idx) => {
                      const fillPct = Math.max((item.revenue / maxVal) * 100, 6)
                      return (
                        <div key={idx} style={{ flex: 1, minWidth: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                          <span className="chart-bar-val">₹{item.revenue.toLocaleString('en-IN')}</span>
                          <div
                            className="chart-bar-fill"
                            style={{
                              width: '100%',
                              maxWidth: '36px',
                              height: `${fillPct}%`,
                              background: '#111',
                              borderRadius: '4px 4px 0 0',
                              transition: 'all 0.3s ease',
                            }}
                            title={`${item.label}: ₹${item.revenue} (${item.orders} orders)`}
                          />
                          <span className="chart-bar-lbl">{item.label}</span>
                          <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>{item.orders} ord</span>
                        </div>
                      )
                    })
                  })()}
                </div>
              )}
            </div>

            {/* Best Sellers & Financial Ledger Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {/* Best Selling Products */}
              <div className="vendor-table-card" style={{ margin: 0 }}>
                <div className="vendor-table-header">
                  <div>
                    <div className="vendor-table-title">Top Performing Products</div>
                    <p style={{ color: '#5F6368', fontSize: '0.82rem' }}>Ranked by customer volume</p>
                  </div>
                </div>

                {analyticsBestSellers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#6B7280' }}>
                    <p>No product sales recorded yet.</p>
                  </div>
                ) : (
                  <div className="vendor-table-wrap">
                    <table className="vendor-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Product Name</th>
                          <th>Units Sold</th>
                          <th>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsBestSellers.slice(0, 5).map((prod, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 700, color: idx === 0 ? '#D94700' : '#111' }}>#{idx + 1}</td>
                            <td style={{ fontWeight: 600 }}>{prod.name}</td>
                            <td>{prod.unitsSold} units</td>
                            <td style={{ fontWeight: 700, color: '#047857' }}>₹{prod.revenue.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Payout History */}
              <div className="vendor-table-card" style={{ margin: 0 }}>
                <div className="vendor-table-header">
                  <div>
                    <div className="vendor-table-title">Payout Withdrawals</div>
                    <p style={{ color: '#5F6368', fontSize: '0.82rem' }}>History of settlements to your bank</p>
                  </div>
                  <button
                    type="button"
                    className="btn-action-sm"
                    onClick={() => setShowPayoutModal(true)}
                  >
                    + New
                  </button>
                </div>

                {payouts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#6B7280' }}>
                    <p>No payout requests made yet.</p>
                  </div>
                ) : (
                  <div className="vendor-table-wrap">
                    <table className="vendor-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Ref #</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payouts.slice(0, 5).map((pay) => (
                          <tr key={pay.payoutId || pay._id}>
                            <td style={{ fontSize: '0.82rem' }}>{new Date(pay.createdAt).toLocaleDateString('en-IN')}</td>
                            <td style={{ fontWeight: 700 }}>₹{pay.amount.toLocaleString('en-IN')}</td>
                            <td>
                              <span
                                className={`badge-status ${
                                  pay.status === 'PAID'
                                    ? 'badge-status-approved'
                                    : pay.status === 'PROCESSING' || pay.status === 'PENDING'
                                    ? 'badge-status-pending'
                                    : 'badge-status-rejected'
                                }`}
                              >
                                {pay.status}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.78rem', color: '#6B7280' }}>{pay.referenceNumber || 'Pending'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Auditable Financial Transactions Ledger */}
            <div className="vendor-table-card">
              <div className="vendor-table-header">
                <div>
                  <div className="vendor-table-title">Auditable Financial Ledger</div>
                  <p style={{ color: '#5F6368', fontSize: '0.85rem' }}>
                    Immutable ledger of all sales credits, platform commission deductions, and payout debits
                  </p>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                  <p style={{ color: '#5F6368', fontSize: '0.95rem' }}>No financial ledger entries recorded yet.</p>
                  <p style={{ color: '#9CA3AF', fontSize: '0.82rem', marginTop: '0.25rem' }}>
                    Transactions will be logged automatically when customers purchase items from your store.
                  </p>
                </div>
              ) : (
                <div className="vendor-table-wrap">
                  <table className="vendor-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Balance After</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((txn) => {
                        const isCredit = ['ORDER_SALE', 'ADJUSTMENT'].includes(txn.type) && txn.amount > 0
                        return (
                          <tr key={txn.transactionId || txn._id}>
                            <td style={{ fontSize: '0.82rem', color: '#5F6368' }}>
                              {new Date(txn.createdAt).toLocaleString('en-IN', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </td>
                            <td>
                              <span
                                className={`badge-status ${
                                  txn.type === 'ORDER_SALE'
                                    ? 'badge-txn-sale'
                                    : txn.type === 'PAYOUT'
                                    ? 'badge-txn-payout'
                                    : txn.type === 'COMMISSION_FEE'
                                    ? 'badge-txn-fee'
                                    : 'badge-txn-adj'
                                }`}
                              >
                                {txn.type.replace('_', ' ')}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.88rem' }}>{txn.description}</td>
                            <td
                              style={{
                                fontWeight: 700,
                                color: isCredit ? '#047857' : '#DC2626',
                              }}
                            >
                              {isCredit ? '+' : ''}₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td style={{ fontWeight: 600 }}>₹{txn.balanceAfter.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td>
                              <span className="badge-status badge-status-approved">
                                COMPLETED
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: STORE PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <div className="vendor-table-card">
            <div className="vendor-table-header">
              <div>
                <div className="vendor-table-title">Storefront Profile & Business Settings</div>
                <p style={{ color: '#5F6368', fontSize: '0.85rem' }}>
                  Configure the public storefront appearance buyers see at /shop/:slug
                </p>
              </div>
              {shop?.slug && (
                <Link
                  to={`/shop/${shop.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-action-sm"
                  style={{ backgroundColor: '#111', color: '#FFF' }}
                >
                  View Public Store &rarr;
                </Link>
              )}
            </div>

            <form onSubmit={handleSaveShopProfile} style={{ padding: '1.75rem clamp(1rem, 3vw, 2.5rem)' }}>
              <div className="vendor-form-grid">
                <div className="vendor-form-group">
                  <label className="vendor-form-label">
                    Store Brand Name <span>*</span>
                  </label>
                  <input
                    type="text"
                    className="vendor-form-input"
                    value={shopFormData.shopName}
                    onChange={(e) => setShopFormData({ ...shopFormData, shopName: e.target.value })}
                  />
                </div>

                <div className="vendor-form-group">
                  <label className="vendor-form-label">
                    Primary Category <span>*</span>
                  </label>
                  <select
                    className="vendor-form-select"
                    value={shopFormData.category}
                    onChange={(e) => setShopFormData({ ...shopFormData, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="vendor-form-group full-width">
                  <label className="vendor-form-label">Store Bio & Brand Description</label>
                  <textarea
                    className="vendor-form-textarea"
                    rows={3}
                    placeholder="Tell buyers about your craftsmanship, printing quality, origin, and design philosophy..."
                    value={shopFormData.description}
                    onChange={(e) => setShopFormData({ ...shopFormData, description: e.target.value })}
                  />
                </div>

                <div className="vendor-form-group">
                  <label className="vendor-form-label">
                    Customer Support Email <span>*</span>
                  </label>
                  <input
                    type="email"
                    className="vendor-form-input"
                    value={shopFormData.contactEmail}
                    onChange={(e) => setShopFormData({ ...shopFormData, contactEmail: e.target.value })}
                  />
                </div>

                <div className="vendor-form-group">
                  <label className="vendor-form-label">
                    Contact Phone <span>*</span>
                  </label>
                  <input
                    type="tel"
                    className="vendor-form-input"
                    value={shopFormData.contactPhone}
                    onChange={(e) => setShopFormData({ ...shopFormData, contactPhone: e.target.value })}
                  />
                </div>

                <div className="vendor-form-group">
                  <label className="vendor-form-label">
                    City <span>*</span>
                  </label>
                  <input
                    type="text"
                    className="vendor-form-input"
                    value={shopFormData.city}
                    onChange={(e) => setShopFormData({ ...shopFormData, city: e.target.value })}
                  />
                </div>

                <div className="vendor-form-group">
                  <label className="vendor-form-label">
                    State <span>*</span>
                  </label>
                  <input
                    type="text"
                    className="vendor-form-input"
                    value={shopFormData.state}
                    onChange={(e) => setShopFormData({ ...shopFormData, state: e.target.value })}
                  />
                </div>

                <div className="vendor-form-group full-width">
                  <label className="vendor-form-label">Workshop / Business Address</label>
                  <input
                    type="text"
                    className="vendor-form-input"
                    value={shopFormData.address}
                    onChange={(e) => setShopFormData({ ...shopFormData, address: e.target.value })}
                  />
                </div>

                <div className="vendor-form-group">
                  <label className="vendor-form-label">Store Logo URL</label>
                  <input
                    type="text"
                    className="vendor-form-input"
                    placeholder="https://.../logo.png"
                    value={shopFormData.logo}
                    onChange={(e) => setShopFormData({ ...shopFormData, logo: e.target.value })}
                  />
                  {shopFormData.logo && (
                    <div style={{ marginTop: '0.5rem', width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #E5E2DD' }}>
                      <img src={shopFormData.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div className="vendor-form-group">
                  <label className="vendor-form-label">Storefront Banner Cover URL</label>
                  <input
                    type="text"
                    className="vendor-form-input"
                    placeholder="https://.../banner.jpg"
                    value={shopFormData.banner}
                    onChange={(e) => setShopFormData({ ...shopFormData, banner: e.target.value })}
                  />
                  {shopFormData.banner && (
                    <div style={{ marginTop: '0.5rem', width: '100%', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #E5E2DD' }}>
                      <img src={shopFormData.banner} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div className="vendor-form-group full-width" style={{ borderTop: '1px solid #E5E2DD', paddingTop: '1.25rem' }}>
                  <label className="vendor-form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <label className="vendor-switch">
                      <input
                        type="checkbox"
                        checked={shopFormData.isActive}
                        onChange={(e) => setShopFormData({ ...shopFormData, isActive: e.target.checked })}
                      />
                      <span className="vendor-slider" />
                    </label>
                    <span>Storefront Public Status ({shopFormData.isActive ? 'Active and Discoverable' : 'Temporarily Paused'})</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid #E5E2DD', paddingTop: '1.25rem' }}>
                <button
                  type="submit"
                  className="marketplace-btn-primary"
                  disabled={shopFormSubmitting}
                >
                  {shopFormSubmitting ? 'Saving Profile...' : 'Save Store Settings'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* MODAL 1: ADD / EDIT TRACKING DETAILS */}
      {selectedOrderForTracking && (
        <div className="vendor-modal-backdrop" onClick={() => setSelectedOrderForTracking(null)}>
          <div className="vendor-modal-window" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="vendor-modal-header">
              <h2>Shipment Tracking Details</h2>
              <button
                type="button"
                className="vendor-modal-close-btn"
                onClick={() => setSelectedOrderForTracking(null)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveTracking}>
              <div className="vendor-modal-body">
                <p style={{ fontSize: '0.88rem', color: '#5F6368', marginBottom: '1.25rem' }}>
                  Update tracking for Order #{selectedOrderForTracking.orderId}. Customer will see these logistics details in their timeline.
                </p>

                <div className="vendor-form-group" style={{ marginBottom: '1rem' }}>
                  <label className="vendor-form-label">Courier / Logistics Carrier</label>
                  <input
                    type="text"
                    className="vendor-form-input"
                    placeholder="e.g. Delhivery, BlueDart, DTDC, India Post"
                    value={trackingForm.carrier}
                    onChange={(e) => setTrackingForm({ ...trackingForm, carrier: e.target.value })}
                  />
                </div>

                <div className="vendor-form-group">
                  <label className="vendor-form-label">AWB / Tracking Number</label>
                  <input
                    type="text"
                    className="vendor-form-input"
                    placeholder="e.g. AWB-9821873192"
                    value={trackingForm.trackingNumber}
                    onChange={(e) => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="vendor-modal-footer">
                <button
                  type="button"
                  className="btn-action-sm"
                  onClick={() => setSelectedOrderForTracking(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="marketplace-btn-primary">
                  Save & Mark Shipped
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW REJECTION REASON */}
      {viewingRejection && (
        <div className="vendor-modal-backdrop" onClick={() => setViewingRejection(null)}>
          <div className="vendor-modal-window" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="vendor-modal-header">
              <h2>Rejection Explanation</h2>
              <button
                type="button"
                className="vendor-modal-close-btn"
                onClick={() => setViewingRejection(null)}
              >
                &times;
              </button>
            </div>
            <div className="vendor-modal-body">
              <h4 style={{ marginBottom: '0.5rem', color: '#111' }}>{viewingRejection.name}</h4>
              <p style={{ color: '#DC2626', fontSize: '0.92rem', lineHeight: 1.5, background: '#FEE2E2', padding: '0.85rem', borderRadius: '6px' }}>
                {viewingRejection.reason}
              </p>
              <p style={{ fontSize: '0.82rem', color: '#5F6368', marginTop: '1rem' }}>
                You can edit this product to address the issues and click &ldquo;Submit for Approval&rdquo; to re-queue it for administrator review.
              </p>
            </div>
            <div className="vendor-modal-footer">
              <button
                type="button"
                className="marketplace-btn-primary"
                onClick={() => setViewingRejection(null)}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REQUEST SETTLEMENT PAYOUT */}
      {showPayoutModal && (
        <div className="vendor-modal-backdrop" onClick={() => setShowPayoutModal(false)}>
          <div className="vendor-modal-window" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="vendor-modal-header">
              <h2>Request Settlement Payout</h2>
              <button
                type="button"
                className="vendor-modal-close-btn"
                onClick={() => setShowPayoutModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleRequestPayout}>
              <div className="vendor-modal-body">
                <div style={{ background: '#F4F3EF', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Available Settlement Balance
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#047857', marginTop: '0.2rem' }}>
                    ₹{(stats.availablePayout ?? ((stats.netEarnings ?? (stats.totalEarnings * 0.95)) - (stats.pendingPayouts ?? 0))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
                    Minimum payout threshold: ₹100
                  </div>
                </div>

                <div className="vendor-form-group" style={{ marginBottom: '1rem' }}>
                  <label className="vendor-form-label">
                    Withdrawal Amount (₹) <span>*</span>
                  </label>
                  <input
                    type="number"
                    className="vendor-form-input"
                    placeholder="Enter amount to withdraw..."
                    min="100"
                    max={stats.availablePayout ?? ((stats.netEarnings ?? (stats.totalEarnings * 0.95)) - (stats.pendingPayouts ?? 0))}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    required
                  />
                </div>

                <div style={{ borderTop: '1px solid #E5E2DD', paddingTop: '1rem', marginTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: '#111' }}>
                    Bank Account Information
                  </h4>

                  <div className="vendor-form-group" style={{ marginBottom: '0.85rem' }}>
                    <label className="vendor-form-label">Beneficiary Account Name <span>*</span></label>
                    <input
                      type="text"
                      className="vendor-form-input"
                      placeholder="Full name as per bank account"
                      value={payoutBankDetails.accountHolderName}
                      onChange={(e) => setPayoutBankDetails({ ...payoutBankDetails, accountHolderName: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div className="vendor-form-group">
                      <label className="vendor-form-label">Bank Account Number <span>*</span></label>
                      <input
                        type="text"
                        className="vendor-form-input"
                        placeholder="e.g. 918273645123"
                        value={payoutBankDetails.accountNumber}
                        onChange={(e) => setPayoutBankDetails({ ...payoutBankDetails, accountNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="vendor-form-group">
                      <label className="vendor-form-label">IFSC Code <span>*</span></label>
                      <input
                        type="text"
                        className="vendor-form-input"
                        placeholder="e.g. HDFC0001234"
                        value={payoutBankDetails.ifscCode}
                        onChange={(e) => setPayoutBankDetails({ ...payoutBankDetails, ifscCode: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="vendor-form-group">
                      <label className="vendor-form-label">Bank Name</label>
                      <input
                        type="text"
                        className="vendor-form-input"
                        placeholder="e.g. HDFC Bank, ICICI Bank"
                        value={payoutBankDetails.bankName}
                        onChange={(e) => setPayoutBankDetails({ ...payoutBankDetails, bankName: e.target.value })}
                      />
                    </div>
                    <div className="vendor-form-group">
                      <label className="vendor-form-label">UPI ID (Optional)</label>
                      <input
                        type="text"
                        className="vendor-form-input"
                        placeholder="e.g. merchant@okhdfcbank"
                        value={payoutBankDetails.upiId}
                        onChange={(e) => setPayoutBankDetails({ ...payoutBankDetails, upiId: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="vendor-modal-footer">
                <button
                  type="button"
                  className="btn-action-sm"
                  onClick={() => setShowPayoutModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="marketplace-btn-primary"
                  disabled={payoutSubmitting}
                >
                  {payoutSubmitting ? 'Submitting Request...' : 'Confirm Payout Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorDashboard
