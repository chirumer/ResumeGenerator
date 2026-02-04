import { z } from "zod"

// Link sub-schema for profile links
export const GeneralLinkSchema = z.object({
  type: z.string().min(1),
  url: z.string().min(1),
  label: z.string().min(1),
})

// Skills sub-schema
export const GeneralSkillsSchema = z.object({
  languages: z.string().default(""),
  frameworks: z.string().default(""),
  tools: z.string().default(""),
  libraries: z.string().default(""),
})

// General info schema matching general.json structure
export const GeneralSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  location: z.string().default(""),
  links: z.array(GeneralLinkSchema).default([]),
  skills: GeneralSkillsSchema.default({
    languages: "",
    frameworks: "",
    tools: "",
    libraries: "",
  }),
})

// Inferred type
export type General = z.infer<typeof GeneralSchema>
export type GeneralLink = z.infer<typeof GeneralLinkSchema>
export type GeneralSkills = z.infer<typeof GeneralSkillsSchema>
