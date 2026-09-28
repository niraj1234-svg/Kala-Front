import mongoose, { Document, Schema } from 'mongoose'

export interface IOtpVerification extends Document {
  target: string
  type: 'phone' | 'email'
  otpHash: string
  expiresAt: Date
  attempts: number
  resendAvailableAt: Date
  verified: boolean
  verificationToken?: string
  verifiedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const OtpVerificationSchema = new Schema<IOtpVerification>(
  {
    target: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['phone', 'email'],
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    attempts: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    resendAvailableAt: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      required: true,
      default: false,
    },
    verificationToken: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// TTL Index: automatically delete records 1 hour after creation to keep collection lean
OtpVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 })

export const OtpVerification = mongoose.model<IOtpVerification>(
  'OtpVerification',
  OtpVerificationSchema
)
