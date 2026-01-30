import type { WorkExperience } from "@resume-generator/shared-types"

export interface WorkExperienceWithContent extends WorkExperience {
  descriptionContent: string
  resumePointsByCategory: Map<string, string>
  selectedCategory: string
  resumePointsContent: string
}
