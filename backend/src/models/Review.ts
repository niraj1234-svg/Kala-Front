import mongoose, { Document, Schema } from 'mongoose'

export type ReviewStatus = 'pending' | 'approved' | 'hidden'

export interface IReview extends Document {
  productId: string
  userId: string
  customerName: string
  customerEmail?: string
  rating: number
  review: string
  status: ReviewStatus
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    customerEmail: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      select: false, // Hidden by default from standard queries to protect customer privacy
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer between 1 and 5.',
      },
    },
    review: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'Review must be at least 3 characters long.'],
      maxlength: [1000, 'Review cannot exceed 1000 characters.'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'hidden'],
      default: 'approved',
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound unique index: Exactly one review per customer per product
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true })

// Secondary indexes for public lookups, customer history, and admin moderation
ReviewSchema.index({ productId: 1, status: 1, createdAt: -1 })
ReviewSchema.index({ userId: 1, createdAt: -1 })
ReviewSchema.index({ status: 1, createdAt: -1 })

export const Review = mongoose.model<IReview>('Review', ReviewSchema)
export default Review
