import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    searchText: {
      type: String,
      default: '',
    },
    lastMessagePreview: {
      type: String,
      default: '',
      maxlength: 280,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

chatSchema.index({ owner: 1, lastMessageAt: -1 })
chatSchema.index({ title: 'text', searchText: 'text' })

export const Chat = mongoose.model('Chat', chatSchema)
