import mongoose, { Document, Schema } from 'mongoose'

export interface IOrderItem {
  productId: string
  name: string
  image: string
  size: string
  quantity: number
  price: number
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

export interface IPricing {
  subtotal: number
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

export interface IOrder extends Document {
  orderId: string
  customer: ICustomer
  shippingAddress: IShippingAddress
  items: IOrderItem[]
  pricing: IPricing
  status: OrderStatus
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
  },
  {
    timestamps: true,
  }
)

export const Order = mongoose.model<IOrder>('Order', OrderSchema)
export default Order
