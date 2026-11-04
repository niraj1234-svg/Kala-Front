import mongoose, { Document, Schema } from 'mongoose'

export interface IPlatformSettings extends Document {
  key: string
  commissionRate: number // e.g. 5 for 5%
  payoutMinimumAmount: number // minimum balance required for payout, e.g. 1000
  payoutProcessingDays: number
  autoApproveVerifiedVendors: boolean
  maintenanceMode: boolean
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
}

const PlatformSettingsSchema = new Schema<IPlatformSettings>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'default_settings',
      trim: true,
    },
    commissionRate: {
      type: Number,
      required: true,
      default: 5,
      min: 0,
      max: 100,
    },
    payoutMinimumAmount: {
      type: Number,
      default: 500,
      min: 0,
    },
    payoutProcessingDays: {
      type: Number,
      default: 7,
      min: 1,
    },
    autoApproveVerifiedVendors: {
      type: Boolean,
      default: false,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

export const PlatformSettings = mongoose.model<IPlatformSettings>(
  'PlatformSettings',
  PlatformSettingsSchema
)
export default PlatformSettings

