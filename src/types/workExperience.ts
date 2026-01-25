export interface WorkExperience {
  id: string
  company: string
  role: string
  startDate: string // ISO date string
  endDate?: string | null // optional, null if current role
  description: string
  tags: string[]
  archived: boolean
  user_notes: string
}

export interface WorkExperienceWithContent extends WorkExperience {}
