import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { workExperienceRepository } from '../repositories/workExperienceRepository.js'

const app = new Hono()

// GET /api/work-experiences - List all work experiences
app.get('/', async (c) => {
  try {
    const workExperiences = await workExperienceRepository.getAllWorkExperiences()
    return c.json({
      workExperiences: workExperiences.map(we => ({
        id: we.id,
        company: we.company,
        role: we.role,
        location: we.location,
        startDate: we.startDate,
        endDate: we.endDate,
        description: we.descriptionContent,
        categories: we.categories.map(cat => ({
          category_name: cat.category_name,
          resume_points: we.resumePointsByCategory.get(cat.category_name) || '',
        })),
        tags: we.tags,
        archived: we.archived,
        user_notes: we.user_notes,
      }))
    })
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch work experiences' },
      500
    )
  }
})

// POST /api/work-experiences/notes - Update work experience note
const NoteSchema = z.object({
  workExperienceId: z.string().min(1, 'Work experience ID is required'),
  note: z.string(),
})

app.post('/notes', zValidator('json', NoteSchema), async (c) => {
  const { workExperienceId, note } = c.req.valid('json')

  try {
    await workExperienceRepository.updateWorkExperienceNote(workExperienceId, note)
    return c.json({ success: true })
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to update note' },
      500
    )
  }
})

// POST /api/work-experiences/archive - Toggle archive status
const ArchiveSchema = z.object({
  workExperienceId: z.string().min(1, 'Work experience ID is required'),
  archived: z.boolean(),
})

app.post('/archive', zValidator('json', ArchiveSchema), async (c) => {
  const { workExperienceId, archived } = c.req.valid('json')

  try {
    await workExperienceRepository.updateWorkExperienceArchived(workExperienceId, archived)
    return c.json({ success: true, message: `Work experience ${archived ? 'archived' : 'unarchived'} successfully` })
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to update archive status' },
      500
    )
  }
})

export { app as workExperiencesRouter }
