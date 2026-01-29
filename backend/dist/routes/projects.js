import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { projectRepository } from '../repositories/projectRepository.js';
const app = new Hono();
// GET /api/projects - List all projects
app.get('/', async (c) => {
    try {
        const projects = await projectRepository.getAllProjects();
        return c.json({
            projects: projects.map(p => ({
                id: p.id,
                project_name: p.project_name,
                description: p.descriptionContent,
                github: p.github,
                categories: p.categories.map(cat => ({
                    category_name: cat.category_name,
                    resume_points: p.resumePointsByCategory.get(cat.category_name) || '',
                })),
                archived: p.archived,
                user_notes: p.user_notes,
            }))
        });
    }
    catch (error) {
        return c.json({ error: error instanceof Error ? error.message : 'Failed to fetch projects' }, 500);
    }
});
// POST /api/projects/notes - Update project note
const NoteSchema = z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    note: z.string(),
});
app.post('/notes', zValidator('json', NoteSchema), async (c) => {
    const { projectId, note } = c.req.valid('json');
    try {
        await projectRepository.updateProjectNote(projectId, note);
        return c.json({ success: true });
    }
    catch (error) {
        return c.json({ error: error instanceof Error ? error.message : 'Failed to update note' }, 500);
    }
});
// POST /api/projects/archive - Toggle archive status
const ArchiveSchema = z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    archived: z.boolean(),
});
app.post('/archive', zValidator('json', ArchiveSchema), async (c) => {
    const { projectId, archived } = c.req.valid('json');
    try {
        await projectRepository.updateProjectArchived(projectId, archived);
        return c.json({ success: true, message: `Project ${archived ? 'archived' : 'unarchived'} successfully` });
    }
    catch (error) {
        return c.json({ error: error instanceof Error ? error.message : 'Failed to update archive status' }, 500);
    }
});
export { app as projectsRouter };
