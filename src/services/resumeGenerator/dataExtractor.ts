import { readFile } from "fs/promises"
import { join } from "path"

// Types for resume data
export interface ResumeWorkExperience {
  company: string
  role: string
  location: string
  startDate: string // Formatted as "Jan. 2020"
  endDate: string | null // "Present" or formatted as "Jan. 2023"
  resumePoints: string[]
}

export interface ResumeProject {
  name: string
  techStack: string
  resumePoints: string[]
}

// Load and parse work experiences JSON
async function loadWorkExperiences() {
  const filePath = join(
    process.cwd(),
    "src",
    "data",
    "work_experiences",
    "work_experiences.json"
  )
  const content = await readFile(filePath, "utf-8")
  return JSON.parse(content) as Array<{
    id: string
    company: string
    role: string
    location?: string
    startDate: string
    endDate: string | null
    categories: Array<{ category_name: string; resume_points_file: string }>
    tags?: string[]
  }>
}

// Load and parse projects JSON
async function loadProjects() {
  const filePath = join(
    process.cwd(),
    "src",
    "data",
    "projects",
    "projects.json"
  )
  const content = await readFile(filePath, "utf-8")
  return JSON.parse(content) as Array<{
    project_name: string
    description_file: string
    categories: Array<{ category_name: string; resume_points_file: string }>
    tags?: string[]
  }>
}

// Parse resume points from markdown file content
function parseResumePoints(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.substring(2)) // Remove the "- " prefix
    .filter((point) => point.length > 0)
}

// Read resume points for a work experience
async function readWorkExperienceResumePoints(
  category: string,
  resumePointsFile: string
): Promise<string[]> {
  const filePath = join(
    process.cwd(),
    "src",
    "data",
    "work_experiences",
    "resume_points",
    category,
    resumePointsFile
  )
  try {
    const content = await readFile(filePath, "utf-8")
    return parseResumePoints(content)
  } catch (error) {
    console.error(`Failed to read resume points for ${resumePointsFile}:`, error)
    return []
  }
}

// Read resume points for a project
async function readProjectResumePoints(
  category: string,
  resumePointsFile: string
): Promise<string[]> {
  const filePath = join(
    process.cwd(),
    "src",
    "data",
    "projects",
    "resume_points",
    category,
    resumePointsFile
  )
  try {
    const content = await readFile(filePath, "utf-8")
    return parseResumePoints(content)
  } catch (error) {
    console.error(`Failed to read resume points for ${resumePointsFile}:`, error)
    return []
  }
}

// Format date for LaTeX resume
function formatDate(dateString: string | null): string {
  if (!dateString) return "Present"

  const date = new Date(dateString)
  const month = date.toLocaleDateString("en-US", { month: "short" })
  const year = date.getFullYear()

  return `${month}. ${year}`
}

// Slugify project name for file lookup
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()
}

// Get work experiences for resume
export async function getWorkExperienceForResume(
  ids: string[],
  categories: string[]
): Promise<ResumeWorkExperience[]> {
  const allExperiences = await loadWorkExperiences()
  const results: ResumeWorkExperience[] = []

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]
    const category = categories[i]

    const experience = allExperiences.find((exp) => exp.id === id)

    if (!experience) {
      console.warn(`Work experience not found: ${id}`)
      continue
    }

    // Find the resume points file for the selected category
    const categoryData = experience.categories.find(
      (cat) => cat.category_name === category
    )

    if (!categoryData) {
      console.warn(
        `Category ${category} not found for work experience ${id}, using first available category`
      )
      // Use first available category as fallback
      const firstCategory = experience.categories[0]
      if (firstCategory) {
        const resumePoints = await readWorkExperienceResumePoints(
          firstCategory.category_name,
          firstCategory.resume_points_file
        )

        results.push({
          company: experience.company,
          role: experience.role,
          location: experience.location || "",
          startDate: formatDate(experience.startDate),
          endDate: formatDate(experience.endDate),
          resumePoints,
        })
      }
      continue
    }

    const resumePoints = await readWorkExperienceResumePoints(
      category,
      categoryData.resume_points_file
    )

    results.push({
      company: experience.company,
      role: experience.role,
      location: experience.location || "",
      startDate: formatDate(experience.startDate),
      endDate: formatDate(experience.endDate),
      resumePoints,
    })
  }

  return results
}

// Get projects for resume
export async function getProjectsForResume(
  ids: string[],
  categories: string[]
): Promise<ResumeProject[]> {
  const allProjects = await loadProjects()
  const results: ResumeProject[] = []

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]
    const category = categories[i]

    const project = allProjects.find((proj) => {
      // Extract the base name from description_file (remove .md extension)
      const descriptionBase = proj.description_file.replace(/\.md$/, "")
      // Also try slugifying the project name as a fallback
      const projectSlug = slugify(proj.project_name)
      return descriptionBase === id || projectSlug === id || proj.project_name === id
    })

    if (!project) {
      console.warn(`Project not found: ${id}`)
      continue
    }

    // Find the resume points file for the selected category
    const categoryData = project.categories.find(
      (cat) => cat.category_name === category
    )

    if (!categoryData) {
      console.warn(
        `Category ${category} not found for project ${id}, using first available category`
      )
      // Use first available category as fallback
      const firstCategory = project.categories[0]
      if (firstCategory) {
        const resumePoints = await readProjectResumePoints(
          firstCategory.category_name,
          firstCategory.resume_points_file
        )

        results.push({
          name: project.project_name,
          techStack: project.tags?.join(", ") ?? "",
          resumePoints,
        })
      }
      continue
    }

    const resumePoints = await readProjectResumePoints(
      category,
      categoryData.resume_points_file
    )

    results.push({
      name: project.project_name,
      techStack: (project.tags || []).join(", "),
      resumePoints,
    })
  }

  return results
}
