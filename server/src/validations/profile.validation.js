import { z } from 'zod'

export const updateProfileSchema = z.object({
  body: z.object({
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3)
      .max(30)
      .regex(/^[a-z0-9._-]+$/, 'Username can contain letters, numbers, dots, underscores, and dashes')
      .optional(),
    bio: z.string().max(240).optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
    avatar: z.object({
      type: z.enum(['preset', 'upload', 'url']).optional(),
      value: z.string().optional(),
    }).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
})
