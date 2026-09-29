import mongoose, { Document, Schema } from 'mongoose'

export interface ICustomArtworkCoordinates {
  x?: number
  y?: number
  width?: number
  height?: number
  rotation?: number
  scale?: number
}

export interface ICustomDesignDetails {
  frontText?: string
  backText?: string
  frontPosition?: { x?: number; y?: number }
  backPosition?: { x?: number; y?: number }
  frontFontSize?: number
  backFontSize?: number
  price?: number
  apparelType?: string
  color?: string
  position?: 'front' | 'back' | 'left' | 'right' | string
  artworkUrl?: string
  previewUrl?: string
  frontPreviewUrl?: string
  backPreviewUrl?: string
  frontArtworkUrl?: string
  backArtworkUrl?: string
  requirementDetails?: string
  artwork?: ICustomArtworkCoordinates
  frontArtwork?: {
    x?: number
    y?: number
    scale?: number
    fileName?: string
  }
  backArtwork?: {
    x?: number
    y?: number
    scale?: number
    fileName?: string
  }
}

export interface IOrderItem {
  productId: string
  name: string
  image: string
  size: string
  color?: string
  quantity: number
  price: number
  customization?: ICustomDesignDetails
}

export interface ICustomer {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface IShippingAddress {
  address: string
  city: string
  state: string
  pincode: string
  landmark?: string
}

export interface IOrderCoupon {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  discountAmount: number
}

export interface IPricing {
  subtotal: number
  discount?: number
  shipping: number
  total: number
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export interface ITracking {
  trackingNumber?: string
  carrier?: string
  updatedAt?: Date
}

export interface IOrderStatusHistory {
  status: OrderStatus
  changedAt: Date
  note?: string
  changedBy?: string
}

export interface IOrderPayment {
  method?: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  status?: 'pending' | 'paid' | 'failed'
  paidAt?: Date
}

export interface IOrderBundle {
  type: string
  name: string
  price: number
  slotCount: number
}

export interface IOrder extends Document {
  orderId: string
  userId?: string
  customerName?: string
  customer: ICustomer
  contactVerified?: boolean
  verifiedContactType?: 'phone' | 'email'
  verifiedContactTarget?: string
  shippingAddress: IShippingAddress
  items: IOrderItem[]
  pricing: IPricing
  bundle?: IOrderBundle
  coupon?: IOrderCoupon
  payment?: IOrderPayment
  status: OrderStatus
  tracking?: ITracking
  statusHistory?: IOrderStatusHistory[]
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    customization: {
      type: {
        frontText: { type: String, trim: true, maxlength: 100 },
        backText: { type: String, trim: true, maxlength: 100 },
        frontPosition: {
          x: { type: Number },
          y: { type: Number },
        },
        backPosition: {
          x: { type: Number },
          y: { type: Number },
        },
        frontFontSize: { type: Number, default: 32 },
        backFontSize: { type: Number, default: 32 },
        price: { type: Number, default: 0 },
        apparelType: { type: String, trim: true },
        color: { type: String, trim: true },
        position: { type: String, trim: true },
        artworkUrl: { type: String },
        previewUrl: { type: String },
        frontPreviewUrl: { type: String },
        backPreviewUrl: { type: String },
        frontArtworkUrl: { type: String },
        backArtworkUrl: { type: String },
        requirementDetails: { type: String, trim: true },
        artwork: {
          x: { type: Number },
          y: { type: Number },
          width: { type: Number },
          height: { type: Number },
          rotation: { type: Number },
          scale: { type: Number },
        },
        frontArtwork: {
          x: { type: Number },
          y: { type: Number },
          scale: { type: Number },
          fileName: { type: String },
        },
        backArtwork: {
          x: { type: Number },
          y: { type: Number },
          scale: { type: Number },
          fileName: { type: String },
        },
      },
      required: false,
      _id: false,
    },
  },
  { _id: false }
)

const CustomerSchema = new Schema<ICustomer>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
)

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
)

const PricingSchema = new Schema<IPricing>(
  {
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    shipping: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
)

const BundleSchema = new Schema(
  {
    type: { type: String, trim: true },
    name: { type: String, trim: true },
    price: { type: Number, min: 0 },
    slotCount: { type: Number, min: 1 },
  },
  { _id: false }
)

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    userId: {
      type: String,
      required: false,
      trim: true,
      index: true,
    },
    customerName: {
      type: String,
      trim: true,
    },
    customer: {
      type: CustomerSchema,
      required: true,
    },
    contactVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verifiedContactType: {
      type: String,
      enum: ['phone', 'email'],
    },
    verifiedContactTarget: {
      type: String,
      trim: true,
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [
        (val: IOrderItem[]) => val.length > 0,
        'Order must contain at least one item',
      ],
    },
    pricing: {
      type: PricingSchema,
      required: true,
    },
    bundle: {
      type: BundleSchema,
      default: undefined,
    },
    coupon: {
      type: {
        code: { type: String, required: true, trim: true, uppercase: true },
        discountType: { type: String, required: true, enum: ['percentage', 'fixed'] },
        discountValue: { type: Number, required: true, min: 0 },
        discountAmount: { type: Number, required: true, min: 0 },
      },
      required: false,
      _id: false,
    },
    payment: {
      type: {
        method: { type: String, default: 'razorpay' },
        razorpayOrderId: { type: String, trim: true },
        razorpayPaymentId: { type: String, trim: true },
        razorpaySignature: { type: String, trim: true },
        status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
        paidAt: { type: Date },
      },
      required: false,
      _id: false,
    },
    status: {
      type: String,
      required: true,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'packed',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
      index: true,
    },
    tracking: {
      type: {
        trackingNumber: { type: String, trim: true, default: '' },
        carrier: { type: String, trim: true, default: '' },
        updatedAt: { type: Date, default: Date.now },
      },
      required: false,
      _id: false,
    },
    statusHistory: {
      type: [
        {
          status: {
            type: String,
            required: true,
            enum: [
              'pending',
              'confirmed',
              'processing',
              'packed',
              'shipped',
              'out_for_delivery',
              'delivered',
              'cancelled',
            ],
          },
          changedAt: {
            type: Date,
            default: Date.now,
          },
          note: {
            type: String,
            trim: true,
            default: '',
          },
          changedBy: {
            type: String,
            trim: true,
            default: 'Admin',
          },
        },
      ],
      required: false,
      _id: false,
    },
  },
  {
    timestamps: true,
  }
)

// Index definitions for high-performance order retrieval
OrderSchema.index({ 'coupon.code': 1 })
OrderSchema.index({ 'payment.razorpayPaymentId': 1 })
OrderSchema.index({ 'payment.razorpayOrderId': 1 })
OrderSchema.index({ createdAt: -1 })

export const Order = mongoose.model<IOrder>('Order', OrderSchema)
export default Order
