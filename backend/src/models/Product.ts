import mongoose, { Document, Schema } from 'mongoose'

export interface IProductVariant {
  color: string
  colorName: string
  image: string
}

export interface IProduct extends Document {
  id: string
  name: string
  category: string
  price: number
  discountPrice?: number
  image: string
  images?: string[]
  description: string
  available: boolean
  badge?: string
  variants?: IProductVariant[]
  freeShipping?: boolean
  customPrintTextEnabled?: boolean
  customPrintTextPrice?: number
  vendorId?: string
  shopId?: string
  sizes?: string[]
  colors?: string[]
  stock?: number
  sku?: string
  status?: 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED' | 'RESTRICTED'
  approvalStatus?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason?: string
  mrp?: number
  costPrice?: number
  brand?: string
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
  }
  estimatedDispatchDays?: number
  variantStock?: {
    size?: string
    color?: string
    stock: number
    sku?: string
  }[]
  subcategory?: string
  shippingInfo?: string
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    images: [{ type: String, trim: true }],
    description: {
      type: String,
      required: true,
      trim: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    badge: {
      type: String,
      trim: true,
    },
    vendorId: {
      type: String,
      trim: true,
      index: true,
    },
    shopId: {
      type: String,
      trim: true,
      index: true,
    },
    sizes: [{ type: String, trim: true }],
    colors: [{ type: String, trim: true }],
    stock: {
      type: Number,
      default: 50,
      min: 0,
    },
    sku: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED', 'RESTRICTED'],
      default: 'ACTIVE',
      index: true,
    },
    approvalStatus: {
      type: String,
      enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'],
      default: 'APPROVED',
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    mrp: {
      type: Number,
      min: 0,
    },
    costPrice: {
      type: Number,
      min: 0,
    },
    brand: {
      type: String,
      trim: true,
      default: 'KALA',
    },
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
    estimatedDispatchDays: {
      type: Number,
      default: 2,
      min: 0,
    },
    variantStock: [
      {
        size: { type: String, trim: true },
        color: { type: String, trim: true },
        stock: { type: Number, default: 0, min: 0 },
        sku: { type: String, trim: true },
      },
    ],
    subcategory: {
      type: String,
      trim: true,
    },
    shippingInfo: {
      type: String,
      trim: true,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    customPrintTextEnabled: {
      type: Boolean,
      default: false,
    },
    customPrintTextPrice: {
      type: Number,
      default: 25,
    },
    variants: [
      {
        color: { type: String, trim: true },
        colorName: { type: String, trim: true },
        image: { type: String, trim: true },
      },
    ],
  },
  {
    timestamps: true,
  }
)

export const Product = mongoose.model<IProduct>('Product', ProductSchema)
export default Product
