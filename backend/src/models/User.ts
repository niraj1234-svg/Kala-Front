import mongoose, { Document, Schema } from 'mongoose'

export type UserRole = 'customer' | 'admin'

export interface IUser extends Document {
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  passwordHash: string
  role?: UserRole
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
      required: false,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

export const User = mongoose.model<IUser>('User', UserSchema)

export default User
