import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const avatarSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['preset', 'upload', 'url'],
      default: 'preset',
    },
    value: {
      type: String,
      default: 'spark',
    },
  },
  { _id: false },
)

const preferencesSchema = new mongoose.Schema(
  {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
  },
  { _id: false },
)

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    avatar: {
      type: avatarSchema,
      default: () => ({}),
    },
    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },
    bio: {
      type: String,
      default: '',
      maxlength: 240,
    },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
  },
)

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash)
}

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    username: this.username,
    email: this.email || '',
    role: this.role,
    avatar: this.avatar,
    preferences: this.preferences,
    bio: this.bio,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

export const User = mongoose.model('User', userSchema)
