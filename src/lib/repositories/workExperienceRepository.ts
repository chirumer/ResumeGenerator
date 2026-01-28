import { promises as fs } from "fs"
import path from "path"
import { WorkExperiencesArraySchema, type WorkExperienceSchemaType } from "@/lib/schemas/workExperience"
import type { WorkExperienceWithContent } from "@/types/workExperience"

const DATA_DIR = path.join(process.cwd(), "src", "data", "work_experiences")

class WorkExperienceRepository {
  private static instance: WorkExperienceRepository
  private cachedWorkExperiences: WorkExperienceWithContent[] | null = null

  private constructor() {}

  static getInstance(): WorkExperienceRepository {
    if (!WorkExperienceRepository.instance) {
      WorkExperienceRepository.instance = new WorkExperienceRepository()
    }
    return WorkExperienceRepository.instance
  }

  /**
   * Get all work experiences with their content loaded
   */
  async getAllWorkExperiences(): Promise<WorkExperienceWithContent[]> {
    if (this.cachedWorkExperiences) {
      return this.cachedWorkExperiences
    }

    // Read and parse work_experiences.json
    const experiencesPath = path.join(DATA_DIR, "work_experiences.json")
    const experiencesJson = await fs.readFile(experiencesPath, "utf-8")
    const rawExperiences = JSON.parse(experiencesJson)

    // Validate with Zod
    const experiences = WorkExperiencesArraySchema.parse(rawExperiences)

    // Load content for each experience in parallel
    const experiencesWithContent = await Promise.all(
      experiences.map(async (experience) => this.loadExperienceContent(experience))
    )

    this.cachedWorkExperiences = experiencesWithContent
    return experiencesWithContent
  }

  /**
   * Load description and resume points content for a work experience
   */
  private async loadExperienceContent(
    experience: WorkExperienceSchemaType
  ): Promise<WorkExperienceWithContent> {
    const descPath = path.join(
      DATA_DIR,
      "experience_descriptions",
      experience.description_file
    )

    const descriptionContent = await fs.readFile(descPath, "utf-8").catch(() => "")

    // Load resume points for ALL categories
    const resumePointsByCategory = new Map<string, string>()
    for (const category of experience.categories) {
      const resumePath = path.join(
        DATA_DIR,
        "resume_points",
        category.category_name,
        category.resume_points_file
      )
      const content = await fs.readFile(resumePath, "utf-8").catch(() => "")
      resumePointsByCategory.set(category.category_name, content)
    }

    const defaultCategory = experience.categories[0]?.category_name || "default"

    return {
      ...experience,
      descriptionContent,
      resumePointsByCategory,
      selectedCategory: defaultCategory,
      resumePointsContent: resumePointsByCategory.get(defaultCategory) || "",
    }
  }

  /**
   * Get a single work experience by ID
   */
  async getWorkExperienceById(id: string): Promise<WorkExperienceWithContent | undefined> {
    const experiences = await this.getAllWorkExperiences()
    return experiences.find((e) => e.id === id)
  }

  /**
   * Get all unique categories from all work experiences
   */
  async getAllCategories(): Promise<string[]> {
    const experiences = await this.getAllWorkExperiences()
    const categorySet = new Set<string>()
    experiences.forEach((e) =>
      e.categories.forEach((c) => categorySet.add(c.category_name))
    )
    return Array.from(categorySet).sort()
  }

  /**
   * Get work experiences by IDs (preserves order)
   */
  async getWorkExperiencesByIds(ids: string[]): Promise<WorkExperienceWithContent[]> {
    const experiences = await this.getAllWorkExperiences()
    const experienceMap = new Map(experiences.map((e) => [e.id, e]))
    return ids
      .map((id) => experienceMap.get(id))
      .filter((e): e is WorkExperienceWithContent => e !== undefined)
  }

  /**
   * Update the user note for a specific work experience
   */
  async updateWorkExperienceNote(experienceId: string, note: string): Promise<void> {
    const experiencesPath = path.join(DATA_DIR, "work_experiences.json")

    // Read the raw JSON
    const experiencesJson = await fs.readFile(experiencesPath, "utf-8")
    const rawExperiences = JSON.parse(experiencesJson)

    // Find the experience by ID
    const experienceIndex = rawExperiences.findIndex((e: any) => e.id === experienceId)

    if (experienceIndex === -1) {
      throw new Error(`Work experience with ID ${experienceId} not found`)
    }

    // Update the note
    rawExperiences[experienceIndex].user_notes = note

    // Write back to file
    await fs.writeFile(experiencesPath, JSON.stringify(rawExperiences, null, 2), "utf-8")

    // Update cache if it exists
    if (this.cachedWorkExperiences) {
      const cachedIndex = this.cachedWorkExperiences.findIndex(e => e.id === experienceId)
      if (cachedIndex !== -1) {
        this.cachedWorkExperiences[cachedIndex] = {
          ...this.cachedWorkExperiences[cachedIndex],
          user_notes: note
        }
      }
    }
  }

  /**
   * Update the archived status for a specific work experience
   */
  async updateWorkExperienceArchived(experienceId: string, archived: boolean): Promise<void> {
    const experiencesPath = path.join(DATA_DIR, "work_experiences.json")

    // Read the raw JSON
    const experiencesJson = await fs.readFile(experiencesPath, "utf-8")
    const rawExperiences = JSON.parse(experiencesJson)

    // Find the experience by ID
    const experienceIndex = rawExperiences.findIndex((e: any) => e.id === experienceId)

    if (experienceIndex === -1) {
      throw new Error(`Work experience with ID ${experienceId} not found`)
    }

    // Update the archived status
    rawExperiences[experienceIndex].archived = archived

    // Write back to file
    await fs.writeFile(experiencesPath, JSON.stringify(rawExperiences, null, 2), "utf-8")

    // Update cache if it exists
    if (this.cachedWorkExperiences) {
      const cachedIndex = this.cachedWorkExperiences.findIndex(e => e.id === experienceId)
      if (cachedIndex !== -1) {
        this.cachedWorkExperiences[cachedIndex] = {
          ...this.cachedWorkExperiences[cachedIndex],
          archived
        }
      }
    }
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache(): void {
    this.cachedWorkExperiences = null
  }
}

export const workExperienceRepository = WorkExperienceRepository.getInstance()
