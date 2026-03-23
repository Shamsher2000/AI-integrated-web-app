import { z } from 'zod'

const historyMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().trim().min(1).max(6000),
})

export const listChatsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    search: z.string().trim().optional(),
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(50).optional(),
  }),
})

export const chatDetailSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    chatId: z.string().trim().min(1),
  }),
  query: z.object({}).optional(),
})

export const sendMessageSchema = z.object({
  body: z.object({
    chatId: z.string().trim().optional(),
    content: z.string().trim().min(1).max(6000),
    temporary: z.boolean().optional().default(false),
    history: z.array(historyMessageSchema).max(30).optional().default([]),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
})
