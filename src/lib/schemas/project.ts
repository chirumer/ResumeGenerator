import { z } from "zod"

// GitHub sub-schema
export const GitHubSchema = z.object({
  url: z.string().url(),
  commit_count: z.number().int().nonnegative(),
})

// Project schema matching projects.json structure
export const ProjectSchema = z.object({
  project_name: z.string().min(1),
  description_file: z.string().endsWith(".md"),
  github: GitHubSchema,
  resume_points: z.string().endsWith(".md"),
  tags: z.array(z.string()),
  user_notes: z.string().default(""),
  archived: z.boolean().default(false),
})

// Array of projects
export const ProjectsArraySchema = z.array(ProjectSchema)

// Inferred types
export type Project = z.infer<typeof ProjectSchema>
export type GitHub = z.infer<typeof GitHubSchema>
