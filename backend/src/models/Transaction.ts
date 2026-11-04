import mongoose, { Document, Schema } from 'mongoose'

export type TransactionType = 'ORDER_SALE' | 'COMMISSION_FEE' | 'REFUND_DEDUCTION' | 'PAYOUT' | 'ADJUSTMENT'

export interface ITransaction extends Document {
  transactionId: string
  vendorId: string
  orderId?: string
  subOrderId?: string
  payoutId?: string
  type: TransactionType
  amount: number // Positive for credits, negative for debits
  balanceAfter: number
  description: string
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema = new Schema<ITransaction>(
  {
    transactionId: {
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
    orderId: {
      type: String,
      trim: true,
      index: true,
    },
    subOrderId: {
      type: String,
      trim: true,
      index: true,
    },
    payoutId: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['ORDER_SALE', 'COMMISSION_FEE', 'REFUND_DEDUCTION', 'PAYOUT', 'ADJUSTMENT'],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema)
export default Transaction

