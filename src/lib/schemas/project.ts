import { z } from "zod"

// GitHub sub-schema
export const GitHubSchema = z.object({
  url: z.string().url(),
  commit_count: z.number().int().nonnegative(),
})

// Category sub-schema
export const CategorySchema = z.object({
  category_name: z.string().min(1),
  resume_points_file: z.string().endsWith(".md"),
})

// Project schema matching projects.json structure
export const ProjectSchema = z.object({
  project_name: z.string().min(1),
  description_file: z.string().endsWith(".md"),
  github: GitHubSchema,
  categories: z.array(CategorySchema).min(1),
  user_notes: z.string().default(""),
  archived: z.boolean().default(false),
})

// Array of projects
export const ProjectsArraySchema = z.array(ProjectSchema)

// Inferred types
export type Project = z.infer<typeof ProjectSchema>
export type GitHub = z.infer<typeof GitHubSchema>
