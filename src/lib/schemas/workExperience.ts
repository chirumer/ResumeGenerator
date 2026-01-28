import { z } from "zod"

// Category sub-schema (reuse same structure as projects)
export const WorkExperienceCategorySchema = z.object({
  category_name: z.string().min(1),
  resume_points_file: z.string().endsWith(".md"),
})

// Work Experience schema matching work_experiences.json structure
export const WorkExperienceSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  role: z.string().min(1),
  startDate: z.string(), // ISO date string
  endDate: z.string().nullable().default(null),
  description_file: z.string().endsWith(".md"),
  categories: z.array(WorkExperienceCategorySchema).min(1),
  tags: z.array(z.string()),
  archived: z.boolean().default(false),
  user_notes: z.string().default(""),
})

// Array of work experiences
export const WorkExperiencesArraySchema = z.array(WorkExperienceSchema)

// Inferred type
export type WorkExperienceSchemaType = z.infer<typeof WorkExperienceSchema>
