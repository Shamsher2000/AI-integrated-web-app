import { Router } from 'express'
import {
  clearChat,
  deleteChat,
  getChat,
  listChats,
  sendMessage,
  streamMessage,
} from '../controllers/chat.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  chatDetailSchema,
  listChatsSchema,
  sendMessageSchema,
} from '../validations/chat.validation.js'

const router = Router()

router.use(requireAuth)

router.get('/', validate(listChatsSchema), listChats)
router.get('/:chatId', validate(chatDetailSchema), getChat)
router.post('/message', validate(sendMessageSchema), sendMessage)
router.post('/message/stream', validate(sendMessageSchema), streamMessage)
router.post('/:chatId/clear', validate(chatDetailSchema), clearChat)
router.delete('/:chatId', validate(chatDetailSchema), deleteChat)

export const chatRouter = router
