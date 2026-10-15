import mongoose, { Document, Schema } from 'mongoose'
import crypto from 'crypto'

export type DesignathonRegistrationStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'payment_failed'
  | 'cancelled'

export type DesignathonPaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'

export type DesignathonEmailStatus =
  | 'not_sent'
  | 'pending'
  | 'sent'
  | 'failed'

export interface IDesignathonAuditEntry {
  action: string
  timestamp: Date
  actor: string
  details?: Record<string, any>
}

export interface IDesignathonRegistration extends Document {
  registrationId: string
  eventId: string
  fullName: string
  email: string
  whatsappNumber: string
  collegeName: string
  department: string
  currentYearSemester: string
  participation: 'individual'
  feeRupees: number
  feePaise: number
  currency: string
  registrationStatus: DesignathonRegistrationStatus
  paymentStatus: DesignathonPaymentStatus
  refundPolicyAcknowledged: boolean
  termsAcknowledged: boolean
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  paymentVerifiedAt?: Date
  verifiedAmountPaise?: number
  emailStatus: DesignathonEmailStatus
  emailSentAt?: Date
  emailFailureReason?: string
  emailAttempts: number
  userId?: string
  auditHistory: IDesignathonAuditEntry[]
  createdAt: Date
  updatedAt: Date
}

const AuditEntrySchema = new Schema<IDesignathonAuditEntry>(
  {
    action: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now },
    actor: { type: String, required: true, trim: true },
    details: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
)

const DesignathonRegistrationSchema = new Schema<IDesignathonRegistration>(
  {
    registrationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    eventId: {
      type: String,
      required: true,
      default: 'kala-designathon-ggv-2026',
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    whatsappNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    collegeName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },
    department: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    currentYearSemester: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 60,
    },
    participation: {
      type: String,
      required: true,
      enum: ['individual'],
      default: 'individual',
    },
    feeRupees: {
      type: Number,
      required: true,
      default: 49,
      min: 49,
      max: 49,
    },
    feePaise: {
      type: Number,
      required: true,
      default: 4900,
      min: 4900,
      max: 4900,
    },
    currency: {
      type: String,
      required: true,
      default: 'INR',
    },
    registrationStatus: {
      type: String,
      required: true,
      enum: ['pending_payment', 'confirmed', 'payment_failed', 'cancelled'],
      default: 'pending_payment',
      index: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    refundPolicyAcknowledged: {
      type: Boolean,
      required: true,
      default: true,
    },
    termsAcknowledged: {
      type: Boolean,
      required: true,
      default: true,
    },
    razorpayOrderId: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    razorpaySignature: {
      type: String,
      trim: true,
    },
    paymentVerifiedAt: {
      type: Date,
    },
    verifiedAmountPaise: {
      type: Number,
    },
    emailStatus: {
      type: String,
      required: true,
      enum: ['not_sent', 'pending', 'sent', 'failed'],
      default: 'not_sent',
      index: true,
    },
    emailSentAt: {
      type: Date,
    },
    emailFailureReason: {
      type: String,
      trim: true,
    },
    emailAttempts: {
      type: Number,
      default: 0,
    },
    userId: {
      type: String,
      trim: true,
      index: true,
    },
    auditHistory: {
      type: [AuditEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

/**
 * MongoDB Indexes:
 * 1. registrationId is globally unique
 * 2. Partial unique index on (email, eventId) ONLY for paymentStatus: 'paid'.
 *    Prevents duplicate successful registrations for the same normalized email and event,
 *    while allowing retry attempts if an earlier pending registration was not completed.
 */
DesignathonRegistrationSchema.index(
  { email: 1, eventId: 1 },
  {
    unique: true,
    partialFilterExpression: { paymentStatus: 'paid' },
    name: 'unique_confirmed_registration_per_email_event',
  }
)

DesignathonRegistrationSchema.index({ createdAt: -1 })
DesignathonRegistrationSchema.index({ registrationStatus: 1, paymentStatus: 1 })

/**
 * Generates a human-readable unique Registration ID
 * Format: KALA-DSN-XXXXXX (e.g., KALA-DSN-7R3M9P)
 */
export function generateRegistrationId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // Base32 unambiguous charset
  let suffix = ''
  const randomBytes = crypto.randomBytes(6)
  for (let i = 0; i < 6; i++) {
    suffix += chars[randomBytes[i] % chars.length]
  }
  return `KALA-DSN-${suffix}`
}

export const DesignathonRegistration = mongoose.model<IDesignathonRegistration>(
  'DesignathonRegistration',
  DesignathonRegistrationSchema
)

export default DesignathonRegistration
