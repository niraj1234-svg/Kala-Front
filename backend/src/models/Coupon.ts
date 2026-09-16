import mongoose, { Document, Schema } from 'mongoose'

export type DiscountType = 'percentage' | 'fixed'

export type CouponStatus =
  | 'disabled'
  | 'scheduled'
  | 'active'
  | 'expired'
  | 'exhausted'

export interface ICoupon extends Document {
  code: string
  description?: string
  discountType: DiscountType
  discountValue: number
  minimumOrderValue: number
  maximumDiscount?: number | null
  startDate: Date
  expiryDate: Date
  usageLimit?: number | null
  perCustomerLimit?: number | null
  usageCount: number
  active: boolean
  createdAt: Date
  updatedAt: Date
  status?: CouponStatus
}

export const COUPON_CODE_REGEX = /^[A-Z0-9_-]{3,30}$/

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
      validate: {
        validator: (v: string) => COUPON_CODE_REGEX.test(v),
        message:
          'Coupon code must be 3-30 uppercase alphanumeric characters, hyphens, or underscores.',
      },
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    discountType: {
      type: String,
      required: true,
      enum: ['percentage', 'fixed'],
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minimumOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    maximumDiscount: {
      type: Number,
      default: null,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: null,
      min: 1,
    },
    perCustomerLimit: {
      type: Number,
      default: null,
      min: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

/**
 * Validates date ranges and discount logic prior to document validation.
 */
CouponSchema.pre('validate', function (next) {
  if (this.startDate && this.expiryDate && this.startDate >= this.expiryDate) {
    this.invalidate('expiryDate', 'Expiry date must be after start date.')
  }

  if (this.discountType === 'percentage') {
    if (this.discountValue <= 0 || this.discountValue > 100) {
      this.invalidate(
        'discountValue',
        'Percentage discount must be between 1 and 100.'
      )
    }
  } else if (this.discountType === 'fixed') {
    if (this.discountValue <= 0) {
      this.invalidate(
        'discountValue',
        'Fixed discount value must be greater than 0.'
      )
    }
  }

  next()
})

/**
 * Calculates dynamic coupon operational status.
 */
export function calculateCouponStatus(
  coupon: {
    active: boolean
    startDate: Date | string
    expiryDate: Date | string
    usageLimit?: number | null
    usageCount: number
  },
  now: Date = new Date()
): CouponStatus {
  if (!coupon.active) return 'disabled'

  const start = new Date(coupon.startDate)
  const expiry = new Date(coupon.expiryDate)

  if (now < start) return 'scheduled'
  if (now > expiry) return 'expired'
  if (
    typeof coupon.usageLimit === 'number' &&
    coupon.usageLimit > 0 &&
    coupon.usageCount >= coupon.usageLimit
  ) {
    return 'exhausted'
  }

  return 'active'
}

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema)

export default Coupon
