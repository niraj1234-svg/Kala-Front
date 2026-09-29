import mongoose, { Document, Schema } from 'mongoose'

export interface ICartArtworkCoordinates {
  x?: number
  y?: number
  width?: number
  height?: number
  rotation?: number
  scale?: number
}

export interface ICartCustomDesign {
  frontText?: string
  backText?: string
  frontPosition?: { x?: number; y?: number }
  backPosition?: { x?: number; y?: number }
  frontFontSize?: number
  backFontSize?: number
  price?: number
  apparelType?: string
  color?: string
  position?: 'front' | 'back' | 'left' | 'right' | string
  artworkUrl?: string
  previewUrl?: string
  frontPreviewUrl?: string
  backPreviewUrl?: string
  frontArtworkUrl?: string
  backArtworkUrl?: string
  requirementDetails?: string
  artwork?: ICartArtworkCoordinates
  frontArtwork?: {
    x?: number
    y?: number
    scale?: number
    fileName?: string
  }
  backArtwork?: {
    x?: number
    y?: number
    scale?: number
    fileName?: string
  }
}

export interface ICartItem {
  _id?: mongoose.Types.ObjectId
  productId: string
  name: string
  image: string
  price: number
  size: string
  quantity: number
  customization?: ICartCustomDesign
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
      max: 10000,
      default: 1,
    },
    customization: {
      type: {
        frontText: { type: String, trim: true, maxlength: 100 },
        backText: { type: String, trim: true, maxlength: 100 },
        frontPosition: {
          x: { type: Number },
          y: { type: Number },
        },
        backPosition: {
          x: { type: Number },
          y: { type: Number },
        },
        frontFontSize: { type: Number, default: 32 },
        backFontSize: { type: Number, default: 32 },
        price: { type: Number, default: 0 },
        apparelType: { type: String, trim: true },
        color: { type: String, trim: true },
        position: { type: String, trim: true },
        artworkUrl: { type: String },
        previewUrl: { type: String },
        frontPreviewUrl: { type: String },
        backPreviewUrl: { type: String },
        frontArtworkUrl: { type: String },
        backArtworkUrl: { type: String },
        requirementDetails: { type: String, trim: true },
        artwork: {
          x: { type: Number },
          y: { type: Number },
          width: { type: Number },
          height: { type: Number },
          rotation: { type: Number },
          scale: { type: Number },
        },
        frontArtwork: {
          x: { type: Number },
          y: { type: Number },
          scale: { type: Number },
          fileName: { type: String },
        },
        backArtwork: {
          x: { type: Number },
          y: { type: Number },
          scale: { type: Number },
          fileName: { type: String },
        },
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
