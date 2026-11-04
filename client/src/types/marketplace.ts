export type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'NONE'

export interface VendorProfile {
  _id?: string
  userId: string
  businessName: string
  category: string
  description?: string
  email: string
  phone: string
  address?: string
  city: string
  state: string
  status: VendorStatus
  adminNotes?: string
  createdAt?: string
  updatedAt?: string
}

export interface VendorShop {
  _id?: string
  vendorId: string
  shopName: string
  slug: string
  logo?: string
  banner?: string
  description?: string
  category: string
  contactEmail: string
  contactPhone: string
  address?: string
  city: string
  state: string
  isActive: boolean
  productCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface MarketplaceProduct {
  id: string
  name: string
  category: string
  subcategory?: string
  price: number
  discountPrice?: number
  mrp?: number
  image: string
  images?: string[]
  description: string
  available: boolean
  badge?: string
  vendorId?: string
  shopId?: string
  stock?: number
  sku?: string
  sizes?: string[]
  colors?: string[]
  shippingInfo?: string
  status?: 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED' | 'RESTRICTED'
  approvalStatus?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason?: string
  shop?: {
    shopName: string
    slug: string
    logo?: string
    city?: string
    state?: string
  } | null
  createdAt?: string
}

export interface VendorStats {
  totalProducts: number
  activeProducts: number
  pendingProducts: number
  draftProducts: number
  rejectedProducts: number
  totalOrders: number
  pendingOrders: number
  productsSold?: number
  grossSales?: number
  commissionRate?: number
  commissionDeducted?: number
  netEarnings?: number
  pendingPayouts?: number
  availablePayout?: number
  completedPayouts?: number
  totalEarnings: number
}

export interface VendorAnalyticsTimeline {
  label: string
  date: string
  revenue: number
  net: number
  orders: number
  units: number
}

export interface VendorBestSeller {
  id: string
  name: string
  image: string
  unitsSold: number
  revenue: number
}

export interface VendorTransaction {
  _id?: string
  transactionId: string
  vendorId: string
  orderId?: string
  subOrderId?: string
  payoutId?: string
  type: 'ORDER_SALE' | 'COMMISSION_FEE' | 'REFUND_DEDUCTION' | 'PAYOUT' | 'ADJUSTMENT'
  amount: number
  balanceAfter: number
  description: string
  createdAt: string
}

export interface VendorPayout {
  _id?: string
  payoutId: string
  amount: number
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'REJECTED'
  bankDetails?: {
    accountHolderName?: string
    accountNumber?: string
    ifscCode?: string
    bankName?: string
    upiId?: string
  }
  adminNotes?: string
  processedAt?: string
  referenceNumber?: string
  createdAt: string
}

export interface VendorOrderItem {
  productId: string
  name: string
  image: string
  size: string
  color?: string
  quantity: number
  price: number
  customization?: any
}

export interface VendorOrder {
  orderId: string
  createdAt: string
  updatedAt?: string
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'packed'
    | 'shipped'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  shippingAddress: {
    address: string
    city: string
    state: string
    pincode: string
    landmark?: string
  }
  items: VendorOrderItem[]
  vendorTotal: number
  tracking?: {
    trackingNumber?: string
    carrier?: string
    updatedAt?: string
  }
}

export interface EnrichedVendorApplication extends VendorProfile {
  shop?: VendorShop | null
  user?: {
    firstName: string
    lastName: string
    email: string
    phone: string
  } | null
  productCount?: number
}
