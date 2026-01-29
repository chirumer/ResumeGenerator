import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { projectsRouter } from './projects.js'
import { workExperiencesRouter } from './workExperiences.js'
import { resumeRouter } from './resume.js'
import { entriesRouter } from './entries.js'

const app = new Hono()

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}))

// Route handlers
app.route('/api/projects', projectsRouter)
app.route('/api/work-experiences', workExperiencesRouter)
app.route('/api/resume', resumeRouter)
app.route('/api/entries', entriesRouter)

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

export default app
