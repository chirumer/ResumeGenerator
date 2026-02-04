import type {
  IResumeGenerator,
  ResumeGeneratorOptions,
  ResumeGeneratorResult,
} from "./IResumeGenerator.js"
import { generateLatexResume } from "./latexTemplate.js"
import {
  getWorkExperienceForResume,
  getProjectsForResume,
} from "./dataExtractor.js"

export class LatexSourceResumeGenerator implements IResumeGenerator {
  readonly formatName = "LaTeX Source"
  readonly isEnabled = true

  async generate(
    options: ResumeGeneratorOptions,
    repositories: any
  ): Promise<ResumeGeneratorResult> {
    // Extract data for work experiences (using repositories)
    const workExperiences = await getWorkExperienceForResume(
      options.workExperienceIds || [],
      options.workExperienceCategories || [],
      repositories
    )

    // Extract data for projects (using repositories)
    const projects = await getProjectsForResume(
      options.projectIds || [],
      options.projectCategories || [],
      repositories
    )

    // Get general information
    const generalInfo = await repositories.generalRepository.getGeneralInfo()

    // Generate LaTeX content (reuse existing function)
    const latexContent = generateLatexResume(workExperiences, projects, generalInfo)

    // Return as text blob with .tex extension
    return {
      success: true,
      data: new Blob([latexContent], { type: "application/x-tex" }),
      filename: `resume-${new Date().toISOString().split("T")[0]}.tex`,
    }
  }

  canGenerate(
    options: ResumeGeneratorOptions
  ): { valid: boolean; reason?: string } {
    const totalItems =
      (options.projectIds?.length || 0) +
      (options.workExperienceIds?.length || 0)

    if (totalItems === 0) {
      return {
        valid: false,
        reason: "At least one project or work experience must be selected",
      }
    }

    // Validate that categories match IDs
    if (
      options.projectIds &&
      options.projectCategories &&
      options.projectIds.length !== options.projectCategories.length
    ) {
      return {
        valid: false,
        reason: "Project categories must match project IDs",
      }
    }

    if (
      options.workExperienceIds &&
      options.workExperienceCategories &&
      options.workExperienceIds.length !==
        options.workExperienceCategories.length
    ) {
      return {
        valid: false,
        reason: "Work experience categories must match work experience IDs",
      }
    }

    return { valid: true }
  }
}
