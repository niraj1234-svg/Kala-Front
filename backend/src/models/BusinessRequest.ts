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
  apparelTypes?: string[]
  quantity: string
  estimatedQuantity?: string
  requiredBy?: string
  brandingRequirements: string
  discussionTopics?: string[]
  details?: string
  projectDetails?: string
  preferredMeetingMethod?: string
  preferredMeetingTime?: string
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
    apparelTypes: {
      type: [String],
      default: [],
    },
    quantity: {
      type: String,
      required: true,
      trim: true,
      default: '51–100',
    },
    estimatedQuantity: {
      type: String,
      trim: true,
    },
    requiredBy: {
      type: String,
      trim: true,
      default: 'To be discussed in meeting',
    },
    brandingRequirements: {
      type: String,
      required: true,
      trim: true,
      default: 'Logo',
    },
    discussionTopics: {
      type: [String],
      default: [],
    },
    details: {
      type: String,
      trim: true,
      default: '',
    },
    projectDetails: {
      type: String,
      trim: true,
      default: '',
    },
    preferredMeetingMethod: {
      type: String,
      trim: true,
      default: 'Phone Call',
    },
    preferredMeetingTime: {
      type: String,
      trim: true,
      default: 'Anytime',
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
