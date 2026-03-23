import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
)

messageSchema.index({ chat: 1, createdAt: 1 })

export const Message = mongoose.model('Message', messageSchema)
