export interface WorkExperienceCategory {
  category_name: string
  resume_points_file: string
}

export interface WorkExperience {
  id: string
  company: string
  role: string
  startDate: string // ISO date string
  endDate?: string | null // optional, null if current role
  description_file: string
  categories: WorkExperienceCategory[]
  tags: string[]
  archived: boolean
  user_notes: string
}

export interface WorkExperienceWithContent extends WorkExperience {
  descriptionContent: string
  resumePointsByCategory: Map<string, string>
  selectedCategory: string
  resumePointsContent: string
}
