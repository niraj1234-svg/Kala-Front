import mongoose, { Document, Schema } from 'mongoose'

export type CustomRequestStatus =
  | 'pending'
  | 'contacted'
  | 'quoted'
  | 'approved'
  | 'completed'
  | 'cancelled'

export interface ICustomRequest extends Document {
  requestId: string
  name: string
  email: string
  phone: string
  apparelType: string
  quantity: number
  sizeRange: string
  printingType: string
  description: string
  additionalRequirements?: string
  fileName?: string
  status: CustomRequestStatus
  createdAt: Date
  updatedAt: Date
}

const CustomRequestSchema = new Schema<ICustomRequest>(
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
    apparelType: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    sizeRange: {
      type: String,
      required: true,
      trim: true,
      default: 'Mixed Sizes (S–XXL)',
    },
    printingType: {
      type: String,
      required: true,
      trim: true,
      default: 'Screen Printing',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    additionalRequirements: {
      type: String,
      trim: true,
      default: '',
    },
    fileName: {
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

export const CustomRequest = mongoose.model<ICustomRequest>(
  'CustomRequest',
  CustomRequestSchema
)
export default CustomRequest
