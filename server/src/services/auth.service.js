import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { signAccessToken } from '../utils/token.js'

export const registerUser = async ({
  username,
  email,
  password,
  avatar,
  preferences,
}) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email })

  if (existingUser) {
    throw new ApiError(409, 'A user with this email already exists')
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await User.create({
    username,
    email,
    passwordHash,
    avatar: avatar || { type: 'preset', value: 'spark' },
    // Set user theme preference (defaults to 'system' for first-time users)
    preferences: preferences || { theme: 'system' },
  })

  return {
    token: signAccessToken(user._id.toString()),
    user: user.toSafeObject(),
  }
}

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email })

  if (!user) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const isValid = await user.comparePassword(password)
  if (!isValid) {
    throw new ApiError(401, 'Invalid email or password')
  }

  user.lastLoginAt = new Date()
  await user.save()

  return {
    token: signAccessToken(user._id.toString()),
    user: user.toSafeObject(),
  }
}
