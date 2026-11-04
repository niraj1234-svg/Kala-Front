import mongoose, { Document, Schema } from 'mongoose'

export type InventoryAction = 'ORDER_REDUCTION' | 'CANCEL_RESTORATION' | 'MANUAL_RESTOCK' | 'AUDIT_ADJUSTMENT'

export interface IInventoryLog extends Document {
  productId: string
  vendorId?: string
  action: InventoryAction
  change: number // negative for sales, positive for restock/restoration
  stockBefore: number
  stockAfter: number
  orderId?: string
  reason?: string
  createdAt: Date
}

const InventoryLogSchema = new Schema<IInventoryLog>(
  {
    productId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    vendorId: {
      type: String,
      trim: true,
      index: true,
    },
    action: {
      type: String,
      enum: ['ORDER_REDUCTION', 'CANCEL_RESTORATION', 'MANUAL_RESTOCK', 'AUDIT_ADJUSTMENT'],
      required: true,
      index: true,
    },
    change: {
      type: Number,
      required: true,
    },
    stockBefore: {
      type: Number,
      required: true,
    },
    stockAfter: {
      type: Number,
      required: true,
    },
    orderId: {
      type: String,
      trim: true,
      index: true,
    },
    reason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

export const InventoryLog = mongoose.model<IInventoryLog>('InventoryLog', InventoryLogSchema)
export default InventoryLog

