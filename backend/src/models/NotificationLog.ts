import mongoose, { Document, Schema } from 'mongoose'

export type NotificationType =
  | 'first_visit'
  | 'admin_order'
  | 'customer_confirmation'
  | 'customer_status_update'

export interface INotificationLog extends Document {
  notificationKey: string // unique compound key e.g. "customer_confirmation:KALA-20260916-HKX79Z" or "first_visit:vis_abc123"
  type: NotificationType
  orderId?: string
  visitorId?: string
  recipient: string
  status: 'sent' | 'failed' | 'skipped'
  providerMessageId?: string
  error?: string
  sentAt: Date
  createdAt: Date
  updatedAt: Date
}

const NotificationLogSchema = new Schema<INotificationLog>(
  {
    notificationKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'first_visit',
        'admin_order',
        'customer_confirmation',
        'customer_status_update',
      ],
      index: true,
    },
    orderId: {
      type: String,
      trim: true,
      index: true,
    },
    visitorId: {
      type: String,
      trim: true,
      index: true,
    },
    recipient: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['sent', 'failed', 'skipped'],
      default: 'sent',
    },
    providerMessageId: {
      type: String,
      trim: true,
      default: '',
    },
    error: {
      type: String,
      trim: true,
      default: '',
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

export const NotificationLog = mongoose.model<INotificationLog>(
  'NotificationLog',
  NotificationLogSchema
)
export default NotificationLog
