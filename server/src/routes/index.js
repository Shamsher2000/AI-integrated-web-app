import { Router } from 'express'
import { authRouter } from './auth.routes.js'
import { chatRouter } from './chat.routes.js'
import { healthRouter } from './health.routes.js'
import { profileRouter } from './profile.routes.js'

const router = Router()

router.use('/health', healthRouter)
router.use('/auth', authRouter)
router.use('/chats', chatRouter)
router.use('/profile', profileRouter)

export const apiRouter = router
