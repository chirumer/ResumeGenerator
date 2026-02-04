import { promises as fs } from "fs"
import path from "path"
import { GeneralSchema, type General } from "@resume-generator/shared-types"

// ESM: use import.meta.dirname instead of __dirname
const __dirname = import.meta.dirname ?? process.cwd()
const DATA_DIR = path.join(__dirname, "..", "..", "data", "general")
const GENERAL_FILE = path.join(DATA_DIR, "general.json")

class GeneralRepository {
  private static instance: GeneralRepository
  private cachedGeneral: General | null = null

  private constructor() {}

  static getInstance(): GeneralRepository {
    if (!GeneralRepository.instance) {
      GeneralRepository.instance = new GeneralRepository()
    }
    return GeneralRepository.instance
  }

  /**
   * Get general information
   */
  async getGeneralInfo(): Promise<General> {
    if (this.cachedGeneral) {
      return this.cachedGeneral
    }

    // Read and parse general.json
    const generalJson = await fs.readFile(GENERAL_FILE, "utf-8")
    const rawGeneral = JSON.parse(generalJson)

    // Validate with Zod
    const general = GeneralSchema.parse(rawGeneral)

    this.cachedGeneral = general
    return general
  }

  /**
   * Update general information
   */
  async updateGeneralInfo(data: Partial<General> & {
    skills?: Partial<General["skills"]>
  }): Promise<General> {
    // Read existing data
    const generalJson = await fs.readFile(GENERAL_FILE, "utf-8")
    const rawGeneral = JSON.parse(generalJson)

    // Merge with new data
    const updatedGeneral = {
      ...rawGeneral,
      ...data,
      // Ensure skills is properly merged
      skills: {
        ...rawGeneral.skills,
        ...(data.skills || {}),
      },
    }

    // Validate with Zod
    const validated = GeneralSchema.parse(updatedGeneral)

    // Write back to file
    await fs.writeFile(GENERAL_FILE, JSON.stringify(validated, null, 2), "utf-8")

    // Update cache
    this.cachedGeneral = validated

    return validated
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache(): void {
    this.cachedGeneral = null
  }
}

export const generalRepository = GeneralRepository.getInstance()
