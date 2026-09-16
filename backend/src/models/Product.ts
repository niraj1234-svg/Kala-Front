import mongoose, { Document, Schema } from 'mongoose'

export interface IProduct extends Document {
  id: string
  name: string
  category: 'Streetwear' | 'Gaming' | 'Gymwear'
  price: number
  image: string
  description: string
  available: boolean
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Streetwear', 'Gaming', 'Gymwear'],
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

export const Product = mongoose.model<IProduct>('Product', ProductSchema)
export default Product
