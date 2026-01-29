import type { ProjectWithContent } from "@/types/project"
import type { WorkExperienceWithContent } from "@/types/workExperience"
import type { Project } from "@/lib/schemas/project"
import type { WorkExperienceSchemaType } from "@/lib/schemas/workExperience"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Response types from the backend
interface ProjectsResponse {
  projects: Array<{
    id: string
    project_name: string
    description: string
    github: { url: string; commit_count: number }
    categories: Array<{ category_name: string; resume_points: string }>
    archived: boolean
    user_notes: string
  }>
}

interface WorkExperiencesResponse {
  workExperiences: Array<{
    id: string
    company: string
    role: string
    location?: string
    startDate: string
    endDate: string | null
    description: string
    categories: Array<{ category_name: string; resume_points: string }>
    tags: string[]
    archived: boolean
    user_notes: string
  }>
}

interface SuccessResponse {
  success: boolean
  message?: string
  id?: string
}

interface ErrorResponse {
  error: string
  details?: string
}

// Helper to handle fetch responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ErrorResponse = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || error.details || 'Request failed')
  }
  return response.json()
}

// Convert backend project response to frontend ProjectWithContent
function toProjectWithContent(data: ProjectsResponse['projects'][0]): ProjectWithContent {
  const resumePointsByCategory = new Map<string, string>()
  const categories: Project['categories'] = []

  data.categories.forEach(cat => {
    resumePointsByCategory.set(cat.category_name, cat.resume_points)
    // Add a placeholder resume_points_file since frontend expects it
    categories.push({
      category_name: cat.category_name,
      resume_points_file: `${cat.category_name}.md`,
    })
  })

  const defaultCategory = data.categories[0]?.category_name || 'default'

  return {
    id: data.id,
    project_name: data.project_name,
    description_file: '', // Not needed in frontend
    github: data.github,
    categories,
    user_notes: data.user_notes,
    archived: data.archived,
    descriptionContent: data.description,
    resumePointsByCategory,
    selectedCategory: defaultCategory,
    resumePointsContent: resumePointsByCategory.get(defaultCategory) || '',
  }
}

// Convert backend work experience response to frontend WorkExperienceWithContent
function toWorkExperienceWithContent(data: WorkExperiencesResponse['workExperiences'][0]): WorkExperienceWithContent {
  const resumePointsByCategory = new Map<string, string>()
  const categories: WorkExperienceSchemaType['categories'] = []

  data.categories.forEach(cat => {
    resumePointsByCategory.set(cat.category_name, cat.resume_points)
    // Add a placeholder resume_points_file since frontend expects it
    categories.push({
      category_name: cat.category_name,
      resume_points_file: `${cat.category_name}.md`,
    })
  })

  const defaultCategory = data.categories[0]?.category_name || 'default'

  return {
    id: data.id,
    company: data.company,
    role: data.role,
    location: data.location,
    startDate: data.startDate,
    endDate: data.endDate,
    description_file: '', // Not needed in frontend
    categories,
    tags: data.tags,
    archived: data.archived,
    user_notes: data.user_notes,
    descriptionContent: data.description,
    resumePointsByCategory,
    selectedCategory: defaultCategory,
    resumePointsContent: resumePointsByCategory.get(defaultCategory) || '',
  }
}

export const apiClient = {
  // ========== Projects ==========
  getProjects: async (): Promise<ProjectWithContent[]> => {
    const response = await fetch(`${API_BASE}/api/projects`)
    const data = await handleResponse<ProjectsResponse>(response)
    return data.projects.map(toProjectWithContent)
  },

  updateProjectNote: async (projectId: string, note: string): Promise<void> => {
    await fetch(`${API_BASE}/api/projects/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, note }),
    }).then(res => handleResponse<SuccessResponse>(res))
  },

  toggleProjectArchived: async (projectId: string, archived: boolean): Promise<void> => {
    await fetch(`${API_BASE}/api/projects/archive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, archived }),
    }).then(res => handleResponse<SuccessResponse>(res))
  },

  // ========== Work Experiences ==========
  getWorkExperiences: async (): Promise<WorkExperienceWithContent[]> => {
    const response = await fetch(`${API_BASE}/api/work-experiences`)
    const data = await handleResponse<WorkExperiencesResponse>(response)
    return data.workExperiences.map(toWorkExperienceWithContent)
  },

  updateWorkExperienceNote: async (workExperienceId: string, note: string): Promise<void> => {
    await fetch(`${API_BASE}/api/work-experiences/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workExperienceId, note }),
    }).then(res => handleResponse<SuccessResponse>(res))
  },

  toggleWorkExperienceArchived: async (workExperienceId: string, archived: boolean): Promise<void> => {
    await fetch(`${API_BASE}/api/work-experiences/archive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workExperienceId, archived }),
    }).then(res => handleResponse<SuccessResponse>(res))
  },

  // ========== Unified CRUD ==========
  createEntry: async (section: 'projects' | 'work-experiences', data: unknown): Promise<string> => {
    const response = await fetch(`${API_BASE}/api/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, operation: 'create', data }),
    })
    const result = await handleResponse<SuccessResponse & { id?: string }>(response)
    if (!result.id) throw new Error('No ID returned from server')
    return result.id
  },

  updateEntry: async (section: 'projects' | 'work-experiences', entryId: string, data: unknown): Promise<void> => {
    await fetch(`${API_BASE}/api/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, operation: 'update', entryId, data }),
    }).then(res => handleResponse<SuccessResponse>(res))
  },

  deleteEntry: async (section: 'projects' | 'work-experiences', entryId: string): Promise<void> => {
    await fetch(`${API_BASE}/api/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, operation: 'delete', entryId }),
    }).then(res => handleResponse<SuccessResponse>(res))
  },

  // ========== Resume Generation ==========
  generateResume: async (data: {
    format: 'pdf' | 'gdocs' | 'docx'
    projectIds?: string[]
    projectCategories?: string[]
    workExperienceIds?: string[]
    workExperienceCategories?: string[]
  }): Promise<Blob | string> => {
    const response = await fetch(`${API_BASE}/api/resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error: ErrorResponse = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || 'Resume generation failed')
    }

    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/pdf')) {
      return await response.blob()
    }

    const result = await response.json() as { url?: string }
    return result.url || ''
  },
}
