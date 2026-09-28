import mongoose, { Document, Schema } from 'mongoose'

export interface IVisitor extends Document {
  visitorId: string
  firstSeenAt: Date
  lastSeenAt: Date
  userAgent?: string
  device?: string
  browser?: string
  os?: string
  ip?: string
  referrer?: string
  location?: string
  emailSent: boolean
  emailSentAt?: Date
  createdAt: Date
  updatedAt: Date
}

const VisitorSchema = new Schema<IVisitor>(
  {
    visitorId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    firstSeenAt: {
      type: Date,
      default: Date.now,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    userAgent: {
      type: String,
      trim: true,
      default: '',
    },
    device: {
      type: String,
      trim: true,
      default: 'Desktop',
    },
    browser: {
      type: String,
      trim: true,
      default: '',
    },
    os: {
      type: String,
      trim: true,
      default: '',
    },
    ip: {
      type: String,
      trim: true,
      default: '',
    },
    referrer: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    emailSent: {
      type: Boolean,
      default: false,
      index: true,
    },
    emailSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

export const Visitor = mongoose.model<IVisitor>('Visitor', VisitorSchema)
export default Visitor
