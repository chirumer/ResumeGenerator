import { promises as fs } from "fs"
import path from "path"
import { ProjectsArraySchema, type Project } from "@/lib/schemas/project"
import type { ProjectWithContent } from "@/types/project"

const DATA_DIR = path.join(process.cwd(), "src", "data")

class ProjectRepository {
  private static instance: ProjectRepository
  private cachedProjects: ProjectWithContent[] | null = null

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
    const resumePath = path.join(
      DATA_DIR,
      "resume_points",
      project.resume_points
    )

    const [descriptionContent, resumePointsContent] = await Promise.all([
      fs.readFile(descPath, "utf-8").catch(() => ""),
      fs.readFile(resumePath, "utf-8").catch(() => ""),
    ])

    return {
      ...project,
      id: this.slugify(project.project_name),
      descriptionContent,
      resumePointsContent,
    }
  }

  /**
   * Convert project name to URL-safe slug
   */
  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  /**
   * Get a single project by ID
   */
  async getProjectById(id: string): Promise<ProjectWithContent | undefined> {
    const projects = await this.getAllProjects()
    return projects.find((p) => p.id === id)
  }

  /**
   * Get all unique tags from all projects
   */
  async getAllTags(): Promise<string[]> {
    const projects = await this.getAllProjects()
    const tagSet = new Set<string>()
    projects.forEach((p) => p.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
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
   * Clear cache (useful for development)
   */
  clearCache(): void {
    this.cachedProjects = null
  }
}

export const projectRepository = ProjectRepository.getInstance()
