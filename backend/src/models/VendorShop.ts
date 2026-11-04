import mongoose, { Document, Schema } from 'mongoose'

export interface IVendorShop extends Document {
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
  createdAt: Date
  updatedAt: Date
}

const VendorShopSchema = new Schema<IVendorShop>(
  {
    vendorId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    shopName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    logo: {
      type: String,
      default: '',
      trim: true,
    },
    banner: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: 'General',
    },
    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      default: '',
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
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

export const VendorShop = mongoose.model<IVendorShop>('VendorShop', VendorShopSchema)
export default VendorShop
