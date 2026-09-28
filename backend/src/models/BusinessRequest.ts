import mongoose, { Document, Schema } from 'mongoose'

export type BusinessRequestStatus =
  | 'pending'
  | 'confirmed'
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
  contactMethod?: string
  meetingDate?: string
  meetingTime?: string
  meetingLocation?: string
  apparelCategory?: string
  color?: string
  customization?: string
  approxQuantity?: string
  requirement?: string
  artworkData?: string
  bulkOrderDetails?: {
    category?: string
    color?: string
    sizes?: Record<string, number>
    printPosition?: string
    estimatedTotal?: number
    artworkName?: string
  }
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
    contactMethod: {
      type: String,
      trim: true,
    },
    meetingDate: {
      type: String,
      trim: true,
    },
    meetingTime: {
      type: String,
      trim: true,
    },
    meetingLocation: {
      type: String,
      trim: true,
    },
    apparelCategory: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    customization: {
      type: String,
      trim: true,
    },
    approxQuantity: {
      type: String,
      trim: true,
    },
    requirement: {
      type: String,
      trim: true,
    },
    artworkData: {
      type: String,
      trim: true,
    },
    bulkOrderDetails: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    status: {
      type: String,
      required: true,
      enum: [
        'pending',
        'confirmed',
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
