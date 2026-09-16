import mongoose, { Document, Schema } from 'mongoose'

export type BusinessRequestStatus =
  | 'pending'
  | 'contacted'
  | 'quoted'
  | 'approved'
  | 'completed'
  | 'cancelled'

export interface IBusinessRequest extends Document {
  requestId: string
  name: string
  organization: string
  email: string
  phone: string
  organizationType: string
  apparelRequired: string
  quantity: string
  requiredBy: string
  brandingRequirements: string
  details?: string
  status: BusinessRequestStatus
  createdAt: Date
  updatedAt: Date
}

const BusinessRequestSchema = new Schema<IBusinessRequest>(
  {
    requestId: {
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
    organization: {
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
    organizationType: {
      type: String,
      required: true,
      trim: true,
      default: 'Company',
    },
    apparelRequired: {
      type: String,
      required: true,
      trim: true,
      default: 'T-Shirts',
    },
    quantity: {
      type: String,
      required: true,
      trim: true,
      default: '51–100',
    },
    requiredBy: {
      type: String,
      required: true,
      trim: true,
    },
    brandingRequirements: {
      type: String,
      required: true,
      trim: true,
      default: 'Logo',
    },
    details: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      required: true,
      enum: [
        'pending',
        'contacted',
        'quoted',
        'approved',
        'completed',
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

export const BusinessRequest = mongoose.model<IBusinessRequest>(
  'BusinessRequest',
  BusinessRequestSchema
)

export default BusinessRequest
