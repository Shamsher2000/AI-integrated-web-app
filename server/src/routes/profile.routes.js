import { Router } from 'express'
import {
  getProfile,
  updateProfile,
} from '../controllers/profile.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { updateProfileSchema } from '../validations/profile.validation.js'

const router = Router()

router.use(requireAuth)

router.get('/', getProfile)
router.patch('/', validate(updateProfileSchema), updateProfile)

export const profileRouter = router
