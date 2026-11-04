import mongoose, { Document, Schema } from 'mongoose'

export interface ISubOrderItem {
  productId: string
  name: string
  image: string
  size: string
  color?: string
  quantity: number
  price: number
  customization?: any
}

export interface ISubOrder extends Document {
  subOrderId: string
  orderId: string
  vendorId: string
  shopId?: string
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
  items: ISubOrderItem[]
  subtotal: number
  commissionRate: number
  commissionAmount: number
  netEarnings: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  payoutStatus: 'pending' | 'available' | 'requested' | 'paid'
  tracking?: {
    carrier?: string
    trackingNumber?: string
    updatedAt?: Date
  }
  statusHistory?: {
    status: string
    changedAt: Date
    note?: string
    changedBy?: string
  }[]
  createdAt: Date
  updatedAt: Date
}

const SubOrderSchema = new Schema<ISubOrder>(
  {
    subOrderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    vendorId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    shopId: {
      type: String,
      trim: true,
      index: true,
    },
    customer: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, default: '', trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
    },
    shippingAddress: {
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
      landmark: { type: String, trim: true },
    },
    items: [
      {
        productId: { type: String, required: true, trim: true },
        name: { type: String, required: true, trim: true },
        image: { type: String, default: '', trim: true },
        size: { type: String, required: true, trim: true },
        color: { type: String, trim: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        customization: { type: Schema.Types.Mixed },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    commissionRate: {
      type: Number,
      required: true,
      default: 5,
      min: 0,
    },
    commissionAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    netEarnings: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
      index: true,
    },
    payoutStatus: {
      type: String,
      enum: ['pending', 'available', 'requested', 'paid'],
      default: 'pending',
      index: true,
    },
    tracking: {
      carrier: { type: String, trim: true },
      trackingNumber: { type: String, trim: true },
      updatedAt: { type: Date },
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        note: { type: String, trim: true },
        changedBy: { type: String, trim: true },
      },
    ],
  },
  {
    timestamps: true,
  }
)

export const SubOrder = mongoose.model<ISubOrder>('SubOrder', SubOrderSchema)
export default SubOrder

