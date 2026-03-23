import { asyncHandler } from '../utils/asyncHandler.js'

export const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user.toSafeObject(),
    },
  })
})

export const updateProfile = asyncHandler(async (req, res) => {
  const { username, bio, theme, avatar } = req.validated.body

  // Update username if provided
  if (username) {
    req.user.username = username
  }

  // Update bio if provided (including empty string)
  if (bio !== undefined) {
    req.user.bio = bio
  }

  // Update theme if provided
  if (theme) {
    req.user.preferences.theme = theme
  }

  // Update avatar if provided
  if (avatar) {
    if (avatar.type) {
      req.user.avatar.type = avatar.type
    }
    if (avatar.value !== undefined) {
      req.user.avatar.value = avatar.value
    }
  }

  await req.user.save()

  res.json({
    success: true,
    message: 'Profile updated',
    data: {
      user: req.user.toSafeObject(),
    },
  })
})
