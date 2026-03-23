import { loginUser, registerUser } from '../services/auth.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.validated.body)
  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: result,
  })
})

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.validated.body)
  res.json({
    success: true,
    message: 'Login successful',
    data: result,
  })
})

export const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user.toSafeObject(),
    },
  })
})
