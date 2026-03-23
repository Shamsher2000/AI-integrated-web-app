import { z } from 'zod'

const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(30)
  .regex(/^[a-z0-9._-]+$/, 'Username can contain letters, numbers, dots, underscores, and dashes')

export const registerSchema = z.object({
  body: z.object({
    username: usernameSchema,
    email: z.string().trim().email('Please provide a valid email address'),
    password: z.string().min(6).max(72),
    avatar: z.object({
      type: z.enum(['preset']).optional(),
      value: z.string().optional(),
    }).optional(),
    preferences: z.object({
      theme: z.enum(['light', 'dark', 'system']).default('system').optional(),
    }).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
})

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Please provide a valid email address'),
    password: z.string().min(6).max(72),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
})
