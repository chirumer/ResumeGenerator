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
   * Create a new work experience
   */
  async createWorkExperience(data: {
    company: string
    role: string
    location?: string
    startDate: string
    endDate: string | null
    description: string
    categories: Array<{ category_name: string; resume_points: string }>
    tags: string[]
  }): Promise<string> {
    const experiencesPath = path.join(DATA_DIR, "work_experiences.json")

    // Read existing work experiences
    const experiencesJson = await fs.readFile(experiencesPath, "utf-8")
    const rawExperiences = JSON.parse(experiencesJson)

    // Generate unique ID
    const baseId = `${this.slugify(data.company)}-${this.slugify(data.role)}`
    let id = baseId
    let counter = 1

    // Ensure ID is unique
    while (rawExperiences.some((e: any) => e.id === id)) {
      id = `${baseId}-${counter}`
      counter++
    }

    // Generate description filename
    const descriptionFile = `${id}.md`

    // Create description file
    const descDir = path.join(DATA_DIR, "experience_descriptions")
    await fs.mkdir(descDir, { recursive: true })
    await fs.writeFile(path.join(descDir, descriptionFile), data.description, "utf-8")

    // Create resume points files for each category
    const categoriesWithFiles = []
    for (const category of data.categories) {
      const categorySlug = this.slugify(category.category_name)
      const resumePointsFile = `${id}-${categorySlug}.md`

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

    // Create new work experience object
    const newExperience = {
      id,
      company: data.company,
      role: data.role,
      location: data.location || "",
      startDate: data.startDate,
      endDate: data.endDate,
      description_file: descriptionFile,
      categories: categoriesWithFiles,
      tags: data.tags,
      user_notes: "",
      archived: false,
    }

    // Add to experiences array
    rawExperiences.push(newExperience)

    // Write back to file
    await fs.writeFile(experiencesPath, JSON.stringify(rawExperiences, null, 2), "utf-8")

    // Clear cache to force reload
    this.clearCache()

    return id
  }

  /**
   * Update an existing work experience
   */
  async updateWorkExperience(
    experienceId: string,
    data: {
      company?: string
      role?: string
      location?: string
      startDate?: string
      endDate?: string | null
      description?: string
      categories?: Array<{ category_name: string; resume_points: string }>
      tags?: string[]
    }
  ): Promise<void> {
    const experiencesPath = path.join(DATA_DIR, "work_experiences.json")

    // Read existing work experiences
    const experiencesJson = await fs.readFile(experiencesPath, "utf-8")
    const rawExperiences = JSON.parse(experiencesJson)

    // Find the experience by ID
    const experienceIndex = rawExperiences.findIndex((e: any) => e.id === experienceId)

    if (experienceIndex === -1) {
      throw new Error(`Work experience with ID ${experienceId} not found`)
    }

    const experience = rawExperiences[experienceIndex]

    // Update description if provided
    if (data.description !== undefined) {
      const descPath = path.join(DATA_DIR, "experience_descriptions", experience.description_file)
      await fs.writeFile(descPath, data.description, "utf-8")
    }

    // Update basic fields if provided
    if (data.company) experience.company = data.company
    if (data.role) experience.role = data.role
    if (data.location !== undefined) experience.location = data.location
    if (data.startDate) experience.startDate = data.startDate
    if (data.endDate !== undefined) experience.endDate = data.endDate
    if (data.tags) experience.tags = data.tags

    // Update categories if provided
    if (data.categories) {
      const categoriesWithFiles = []

      for (const category of data.categories) {
        const categorySlug = this.slugify(category.category_name)

        // Try to find existing resume points file for this category
        const existingCategory = experience.categories.find(
          (c: any) => this.slugify(c.category_name) === categorySlug
        )

        let resumePointsFile: string
        if (existingCategory) {
          // Reuse existing file
          resumePointsFile = existingCategory.resume_points_file
        } else {
          // Create new file
          resumePointsFile = `${experienceId}-${categorySlug}.md`
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

      experience.categories = categoriesWithFiles
    }

    // Write back to file
    await fs.writeFile(experiencesPath, JSON.stringify(rawExperiences, null, 2), "utf-8")

    // Clear cache to force reload
    this.clearCache()
  }

  /**
   * Delete a work experience
   */
  async deleteWorkExperience(experienceId: string): Promise<void> {
    const experiencesPath = path.join(DATA_DIR, "work_experiences.json")

    // Read existing work experiences
    const experiencesJson = await fs.readFile(experiencesPath, "utf-8")
    const rawExperiences = JSON.parse(experiencesJson)

    // Find the experience by ID
    const experienceIndex = rawExperiences.findIndex((e: any) => e.id === experienceId)

    if (experienceIndex === -1) {
      throw new Error(`Work experience with ID ${experienceId} not found`)
    }

    const experience = rawExperiences[experienceIndex]

    // Delete description file
    const descPath = path.join(DATA_DIR, "experience_descriptions", experience.description_file)
    await fs.unlink(descPath).catch(() => {
      // File might not exist, ignore error
    })

    // Delete resume points files
    for (const category of experience.categories) {
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

    // Remove experience from array
    rawExperiences.splice(experienceIndex, 1)

    // Write back to file
    await fs.writeFile(experiencesPath, JSON.stringify(rawExperiences, null, 2), "utf-8")

    // Clear cache to force reload
    this.clearCache()
  }

  /**
   * Convert a string to URL-safe slug
   */
  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache(): void {
    this.cachedWorkExperiences = null
  }
}

export const workExperienceRepository = WorkExperienceRepository.getInstance()
