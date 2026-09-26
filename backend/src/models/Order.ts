import mongoose, { Document, Schema } from 'mongoose'

export interface IOrderItem {
  productId: string
  name: string
  image: string
  size: string
  quantity: number
  price: number
  customization?: {
    backText?: string
    price?: number
  }
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
  | 'shipped'
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
}

export interface IOrderPayment {
  method?: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  status?: 'pending' | 'paid' | 'failed'
  paidAt?: Date
}

export interface IOrder extends Document {
  orderId: string
  userId?: string
  customer: ICustomer
  shippingAddress: IShippingAddress
  items: IOrderItem[]
  pricing: IPricing
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
        backText: { type: String, trim: true, maxlength: 30 },
        price: { type: Number, default: 0 },
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
    customer: {
      type: CustomerSchema,
      required: true,
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
        'shipped',
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
              'shipped',
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

// Index on coupon.code for fast per-customer and coupon usage queries
OrderSchema.index({ 'coupon.code': 1 })

export const Order = mongoose.model<IOrder>('Order', OrderSchema)
export default Order
