import mongoose, { Document, Schema } from 'mongoose'

export type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

export interface IVendorProfile extends Document {
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
  createdAt: Date
  updatedAt: Date
}

const VendorProfileSchema = new Schema<IVendorProfile>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
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
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING',
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

export const VendorProfile = mongoose.model<IVendorProfile>('VendorProfile', VendorProfileSchema)
export default VendorProfile
