import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { generalRepository } from '../repositories/generalRepository.js'

const app = new Hono()

// GET /api/general - Get general information
app.get('/', async (c) => {
  try {
    const general = await generalRepository.getGeneralInfo()
    return c.json(general)
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch general information' },
      500
    )
  }
})

// POST /api/general - Update general information
const UpdateGeneralSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  links: z.array(z.object({
    type: z.string(),
    url: z.string(),
    label: z.string(),
  })).optional(),
  skills: z.object({
    languages: z.string().optional(),
    frameworks: z.string().optional(),
    tools: z.string().optional(),
    libraries: z.string().optional(),
  }).optional(),
})

app.post('/', zValidator('json', UpdateGeneralSchema), async (c) => {
  const data = c.req.valid('json')

  try {
    // Type assertion to handle the zod optional fields inference
    const updated = await generalRepository.updateGeneralInfo(data as any)
    return c.json({ success: true, data: updated })
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to update general information' },
      500
    )
  }
})

export { app as generalRouter }
