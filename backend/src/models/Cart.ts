import mongoose, { Document, Schema } from 'mongoose'

export interface ICartItem {
  _id?: mongoose.Types.ObjectId
  productId: string
  name: string
  image: string
  price: number
  size: string
  quantity: number
  customization?: {
    backText?: string
    price?: number
  }
}

export interface ICart extends Document {
  userId: string
  items: ICartItem[]
  createdAt: Date
  updatedAt: Date
}

const CartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 1,
    },
    customization: {
      type: {
        backText: { type: String, trim: true, maxlength: 30 },
        price: { type: Number, default: 0 },
      },
      required: false,
      _id: false,
    },
  },
  {
    _id: true,
  }
)

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

export const Cart = mongoose.model<ICart>('Cart', CartSchema)
