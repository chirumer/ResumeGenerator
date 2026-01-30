import { serve } from '@hono/node-server';
import app from './routes/index.js';
const port = parseInt(process.env.PORT || '3001');
console.log(`Starting Resume Generator Backend API...`);
console.log(`Server running on port ${port}`);
console.log(`Health check: http://localhost:${port}/health`);
console.log(`API endpoints:`);
console.log(`  - GET  http://localhost:${port}/api/projects`);
console.log(`  - GET  http://localhost:${port}/api/work-experiences`);
console.log(`  - POST http://localhost:${port}/api/entries`);
console.log(`  - POST http://localhost:${port}/api/resume`);
serve({
    fetch: app.fetch,
    port,
});
