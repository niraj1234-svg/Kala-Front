import mongoose, { Document, Schema } from 'mongoose'

export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'REJECTED'

export interface IPayout extends Document {
  payoutId: string
  vendorId: string
  amount: number
  status: PayoutStatus
  bankDetails?: {
    accountHolderName?: string
    accountNumber?: string
    ifscCode?: string
    bankName?: string
    upiId?: string
  }
  adminNotes?: string
  processedAt?: Date
  processedBy?: string
  referenceNumber?: string
  createdAt: Date
  updatedAt: Date
}

const PayoutSchema = new Schema<IPayout>(
  {
    payoutId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    vendorId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'PAID', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    bankDetails: {
      accountHolderName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ifscCode: { type: String, trim: true },
      bankName: { type: String, trim: true },
      upiId: { type: String, trim: true },
    },
    adminNotes: {
      type: String,
      trim: true,
      default: '',
    },
    processedAt: {
      type: Date,
    },
    processedBy: {
      type: String,
      trim: true,
    },
    referenceNumber: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

export const Payout = mongoose.model<IPayout>('Payout', PayoutSchema)
export default Payout

