import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { LatexResumeGenerator } from '../services/LatexResumeGenerator.js'
import { LatexSourceResumeGenerator } from '../services/LatexSourceResumeGenerator.js'
import { DisabledResumeGenerator } from '../services/DisabledResumeGenerator.js'
import { projectRepository } from '../repositories/projectRepository.js'
import { workExperienceRepository } from '../repositories/workExperienceRepository.js'
import { generalRepository } from '../repositories/generalRepository.js'

const app = new Hono()

const ResumeRequestSchema = z.object({
  format: z.enum(['pdf', 'latex', 'gdocs', 'docx']),
  projectIds: z.array(z.string()).optional(),
  projectCategories: z.array(z.string()).optional(),
  workExperienceIds: z.array(z.string()).optional(),
  workExperienceCategories: z.array(z.string()).optional(),
})

app.post('/', zValidator('json', ResumeRequestSchema), async (c) => {
  const data = c.req.valid('json')

  // Normalize data for generator - ensure arrays are defined
  const generatorOptions = {
    format: data.format,
    projectIds: data.projectIds ?? [],
    projectCategories: data.projectCategories ?? [],
    workExperienceIds: data.workExperienceIds ?? [],
    workExperienceCategories: data.workExperienceCategories ?? [],
  }

  // Select generator based on format
  const generator =
    data.format === 'pdf'
      ? new LatexResumeGenerator()
      : data.format === 'latex'
      ? new LatexSourceResumeGenerator()
      : new DisabledResumeGenerator(data.format.toUpperCase())

  // Validate if generation is possible
  const canGenerate = generator.canGenerate(generatorOptions)
  if (!canGenerate.valid) {
    return c.json({ error: canGenerate.reason }, 400)
  }

  // Generate resume
  const result = await generator.generate(generatorOptions, {
    projectRepository,
    workExperienceRepository,
    generalRepository,
  })

  if (!result.success) {
    return c.json({ error: result.error }, 500)
  }

  // Handle different response types
  if (result.data instanceof Blob) {
    const buffer = await result.data.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)

    const contentType = result.filename?.endsWith('.tex')
      ? 'application/x-tex'
      : 'application/pdf'

    return new Response(uint8Array, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${result.filename || 'resume.pdf'}"`,
      },
    })
  }

  // For string responses (like Google Docs URL)
  return c.json({ url: result.data })
})

export { app as resumeRouter }
