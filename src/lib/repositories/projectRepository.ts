import { promises as fs } from "fs"
import path from "path"
import { ProjectsArraySchema, type Project } from "@/lib/schemas/project"
import type { ProjectWithContent } from "@/types/project"

const DATA_DIR = path.join(process.cwd(), "src", "data", "projects")

class ProjectRepository {
  private static instance: ProjectRepository
  private cachedProjects: ProjectWithContent[] | null = null
  private idCounter = new Map<string, number>()  // Track ID collisions

  private constructor() {}

  static getInstance(): ProjectRepository {
    if (!ProjectRepository.instance) {
      ProjectRepository.instance = new ProjectRepository()
    }
    return ProjectRepository.instance
  }

  /**
   * Get all projects with their content loaded
   */
  async getAllProjects(): Promise<ProjectWithContent[]> {
    if (this.cachedProjects) {
      return this.cachedProjects
    }

    // Reset ID counter for consistent ID generation
    this.idCounter.clear()

    // Read and parse projects.json
    const projectsPath = path.join(DATA_DIR, "projects.json")
    const projectsJson = await fs.readFile(projectsPath, "utf-8")
    const rawProjects = JSON.parse(projectsJson)

    // Validate with Zod
    const projects = ProjectsArraySchema.parse(rawProjects)

    // Load content for each project in parallel
    const projectsWithContent = await Promise.all(
      projects.map(async (project) => this.loadProjectContent(project))
    )

    this.cachedProjects = projectsWithContent
    return projectsWithContent
  }

  /**
   * Load description and resume points content for a project
   */
  private async loadProjectContent(
    project: Project
  ): Promise<ProjectWithContent> {
    const descPath = path.join(
      DATA_DIR,
      "project_descriptions",
      project.description_file
    )

    const descriptionContent = await fs.readFile(descPath, "utf-8").catch(() => "")

    // Load resume points for ALL categories
    const resumePointsByCategory = new Map<string, string>()
    for (const category of project.categories) {
      const resumePath = path.join(
        DATA_DIR,
        "resume_points",
        category.category_name,
        category.resume_points_file
      )
      const content = await fs.readFile(resumePath, "utf-8").catch(() => "")
      resumePointsByCategory.set(category.category_name, content)
    }

    // Generate unique ID with collision handling
    const baseId = this.slugify(project.project_name)
    const count = this.idCounter.get(baseId) ?? 0
    this.idCounter.set(baseId, count + 1)
    const uniqueId = count > 0 ? `${baseId}-${count}` : baseId

    const defaultCategory = project.categories[0]?.category_name || "default"

    return {
      ...project,
      id: uniqueId,
      descriptionContent,
      resumePointsByCategory,
      selectedCategory: defaultCategory,
      resumePointsContent: resumePointsByCategory.get(defaultCategory) || "",
    }
  }

  /**
   * Convert project name to URL-safe slug
   * Preserves underscores to avoid collisions (e.g., "Employee-Management" vs "Employee_Management")
   */
  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")           // spaces to hyphens
      .replace(/[^a-z0-9_-]+/g, "-")   // other non-alphanumeric to hyphens
      .replace(/^-|-$/g, "")           // trim leading/trailing hyphens
  }

  /**
   * Get a single project by ID
   */
  async getProjectById(id: string): Promise<ProjectWithContent | undefined> {
    const projects = await this.getAllProjects()
    return projects.find((p) => p.id === id)
  }

  /**
   * Get all unique categories from all projects
   */
  async getAllCategories(): Promise<string[]> {
    const projects = await this.getAllProjects()
    const categorySet = new Set<string>()
    projects.forEach((p) =>
      p.categories.forEach((c) => categorySet.add(c.category_name))
    )
    return Array.from(categorySet).sort()
  }

  /**
   * Get projects by IDs (preserves order)
   */
  async getProjectsByIds(ids: string[]): Promise<ProjectWithContent[]> {
    const projects = await this.getAllProjects()
    const projectMap = new Map(projects.map((p) => [p.id, p]))
    return ids
      .map((id) => projectMap.get(id))
      .filter((p): p is ProjectWithContent => p !== undefined)
  }

  /**
   * Update the user note for a specific project
   */
  async updateProjectNote(projectId: string, note: string): Promise<void> {
    const projectsPath = path.join(DATA_DIR, "projects.json")

    // Ensure we have the latest data
    // We intentionally don't use getAllProjects() here to avoid reading content files unnecessarily
    // and to ensure we're working with the raw JSON structure for writing.
    const projectsJson = await fs.readFile(projectsPath, "utf-8")
    const rawProjects = JSON.parse(projectsJson)

    // We need to find the project. Since the raw JSON doesn't have IDs (slugs),
    // we need to match by slugifying the project_name.
    const projectIndex = rawProjects.findIndex((p: any) => this.slugify(p.project_name) === projectId)

    if (projectIndex === -1) {
      throw new Error(`Project with ID ${projectId} not found`)
    }

    // Update the note
    rawProjects[projectIndex].user_notes = note

    // Write back to file
    await fs.writeFile(projectsPath, JSON.stringify(rawProjects, null, 2), "utf-8")

    // Update cache if it exists
    if (this.cachedProjects) {
      const cachedProjectIndex = this.cachedProjects.findIndex(p => p.id === projectId)
      if (cachedProjectIndex !== -1) {
        this.cachedProjects[cachedProjectIndex] = {
            ...this.cachedProjects[cachedProjectIndex],
            user_notes: note
        }
      }
    }
  }

  /**
   * Update the archived status for a specific project
   */
  async updateProjectArchived(projectId: string, archived: boolean): Promise<void> {
    const projectsPath = path.join(DATA_DIR, "projects.json")

    // Read the raw JSON
    const projectsJson = await fs.readFile(projectsPath, "utf-8")
    const rawProjects = JSON.parse(projectsJson)

    // Find the project by slugified name
    const projectIndex = rawProjects.findIndex((p: any) => this.slugify(p.project_name) === projectId)

    if (projectIndex === -1) {
      throw new Error(`Project with ID ${projectId} not found`)
    }

    // Update the archived status
    rawProjects[projectIndex].archived = archived

    // Write back to file
    await fs.writeFile(projectsPath, JSON.stringify(rawProjects, null, 2), "utf-8")

    // Update cache if it exists
    if (this.cachedProjects) {
      const cachedProjectIndex = this.cachedProjects.findIndex(p => p.id === projectId)
      if (cachedProjectIndex !== -1) {
        this.cachedProjects[cachedProjectIndex] = {
            ...this.cachedProjects[cachedProjectIndex],
            archived
        }
      }
    }
  }

  /**
   * Create a new project
   */
  async createProject(data: {
    project_name: string
    description: string
    github: { url: string; commit_count: number }
    categories: Array<{ category_name: string; resume_points: string }>
  }): Promise<string> {
    const projectsPath = path.join(DATA_DIR, "projects.json")

    // Read existing projects
    const projectsJson = await fs.readFile(projectsPath, "utf-8")
    const rawProjects = JSON.parse(projectsJson)

    // Generate slug and filenames
    const slug = this.slugify(data.project_name)
    const descriptionFile = `${slug}.md`

    // Create description file
    const descDir = path.join(DATA_DIR, "project_descriptions")
    await fs.mkdir(descDir, { recursive: true })
    await fs.writeFile(path.join(descDir, descriptionFile), data.description, "utf-8")

    // Create resume points files for each category
    const categoriesWithFiles = []
    for (const category of data.categories) {
      const categorySlug = this.slugify(category.category_name)
      const resumePointsFile = `${slug}-${categorySlug}.md`

      // Create category directory if it doesn't exist
      const categoryDir = path.join(DATA_DIR, "resume_points", categorySlug)
      await fs.mkdir(categoryDir, { recursive: true })

      // Write resume points
      await fs.writeFile(path.join(categoryDir, resumePointsFile), category.resume_points, "utf-8")

      categoriesWithFiles.push({
        category_name: category.category_name,
        resume_points_file: resumePointsFile,
      })
    }

    // Create new project object
    const newProject = {
      project_name: data.project_name,
      description_file: descriptionFile,
      github: data.github,
      categories: categoriesWithFiles,
      user_notes: "",
      archived: false,
    }

    // Add to projects array
    rawProjects.push(newProject)

    // Write back to file
    await fs.writeFile(projectsPath, JSON.stringify(rawProjects, null, 2), "utf-8")

    // Clear cache to force reload
    this.clearCache()

    return slug
  }

  /**
   * Update an existing project
   */
  async updateProject(
    projectId: string,
    data: {
      project_name?: string
      description?: string
      github?: { url: string; commit_count: number }
      categories?: Array<{ category_name: string; resume_points: string }>
    }
  ): Promise<void> {
    const projectsPath = path.join(DATA_DIR, "projects.json")

    // Read existing projects
    const projectsJson = await fs.readFile(projectsPath, "utf-8")
    const rawProjects = JSON.parse(projectsJson)

    // Find the project by slugified name
    const projectIndex = rawProjects.findIndex((p: any) => this.slugify(p.project_name) === projectId)

    if (projectIndex === -1) {
      throw new Error(`Project with ID ${projectId} not found`)
    }

    const project = rawProjects[projectIndex]
    const isRenaming = data.project_name && data.project_name !== project.project_name
    const newSlug = isRenaming ? this.slugify(data.project_name!) : projectId

    // Update description if provided
    if (data.description !== undefined) {
      const descDir = path.join(DATA_DIR, "project_descriptions")
      const oldDescPath = path.join(descDir, project.description_file)

      // If renaming, we need to move the file
      if (isRenaming) {
        const newDescriptionFile = `${newSlug}.md`
        const newDescPath = path.join(descDir, newDescriptionFile)
        await fs.rename(oldDescPath, newDescPath).catch(async () => {
          // If rename fails (files don't match), create new file
          await fs.writeFile(newDescPath, data.description!, "utf-8")
        })
        project.description_file = newDescriptionFile
      } else {
        await fs.writeFile(oldDescPath, data.description!, "utf-8")
      }
    }

    // Update GitHub if provided
    if (data.github) {
      project.github = data.github
    }

    // Update categories if provided
    if (data.categories) {
      const categoriesWithFiles = []

      for (const category of data.categories) {
        const categorySlug = this.slugify(category.category_name)

        // For renamed projects, use new slug in filename
        const filePrefix = isRenaming ? newSlug : projectId

        // Try to find existing resume points file for this category
        const existingCategory = project.categories.find(
          (c: any) => this.slugify(c.category_name) === categorySlug
        )

        let resumePointsFile: string
        if (existingCategory && !isRenaming) {
          // Reuse existing file
          resumePointsFile = existingCategory.resume_points_file
        } else {
          // Create new file
          resumePointsFile = `${filePrefix}-${categorySlug}.md`
        }

        // Create/update resume points file
        const categoryDir = path.join(DATA_DIR, "resume_points", categorySlug)
        await fs.mkdir(categoryDir, { recursive: true })
        await fs.writeFile(path.join(categoryDir, resumePointsFile), category.resume_points, "utf-8")

        categoriesWithFiles.push({
          category_name: category.category_name,
          resume_points_file: resumePointsFile,
        })
      }

      project.categories = categoriesWithFiles
    }

    // Update project name if provided
    if (data.project_name) {
      project.project_name = data.project_name
    }

    // Write back to file
    await fs.writeFile(projectsPath, JSON.stringify(rawProjects, null, 2), "utf-8")

    // Clear cache to force reload
    this.clearCache()
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    const projectsPath = path.join(DATA_DIR, "projects.json")

    // Read existing projects
    const projectsJson = await fs.readFile(projectsPath, "utf-8")
    const rawProjects = JSON.parse(projectsJson)

    // Find the project by slugified name
    const projectIndex = rawProjects.findIndex((p: any) => this.slugify(p.project_name) === projectId)

    if (projectIndex === -1) {
      throw new Error(`Project with ID ${projectId} not found`)
    }

    const project = rawProjects[projectIndex]

    // Delete description file
    const descPath = path.join(DATA_DIR, "project_descriptions", project.description_file)
    await fs.unlink(descPath).catch(() => {
      // File might not exist, ignore error
    })

    // Delete resume points files
    for (const category of project.categories) {
      const categorySlug = this.slugify(category.category_name)
      const resumePath = path.join(
        DATA_DIR,
        "resume_points",
        categorySlug,
        category.resume_points_file
      )
      await fs.unlink(resumePath).catch(() => {
        // File might not exist, ignore error
      })

      // Try to remove category directory if empty
      const categoryDir = path.join(DATA_DIR, "resume_points", categorySlug)
      fs.rmdir(categoryDir).catch(() => {
        // Directory not empty or doesn't exist, ignore error
      })
    }

    // Remove project from array
    rawProjects.splice(projectIndex, 1)

    // Write back to file
    await fs.writeFile(projectsPath, JSON.stringify(rawProjects, null, 2), "utf-8")

    // Clear cache to force reload
    this.clearCache()
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache(): void {
    this.cachedProjects = null
    this.idCounter.clear()
  }
}

export const projectRepository = ProjectRepository.getInstance()
