import type {
  IResumeGenerator,
  ResumeGeneratorOptions,
  ResumeGeneratorResult,
} from "./IResumeGenerator"

export class PlaceholderResumeGenerator implements IResumeGenerator {
  readonly formatName = "PDF"
  readonly isEnabled = true

  async generate(
    options: ResumeGeneratorOptions
  ): Promise<ResumeGeneratorResult> {
    // For placeholder, we return a static PDF from public folder
    // In a real implementation, this would use @react-pdf/renderer
    try {
      let blob: Blob

      if (typeof window === "undefined") {
        // Server-side: Use fs to read the file directly from public folder
        const fs = await import("fs/promises")
        const path = await import("path")
        const filePath = path.join(
          process.cwd(),
          "public",
          "placeholder-resume.pdf"
        )
        const buffer = await fs.readFile(filePath)
        blob = new Blob([buffer], { type: "application/pdf" })
      } else {
        // Client-side fallback: Use fetch
        const response = await fetch("/placeholder-resume.pdf")
        if (!response.ok) {
          throw new Error("Failed to fetch placeholder PDF")
        }
        blob = await response.blob()
      }

      return {
        success: true,
        data: blob,
        filename: `resume-${new Date().toISOString().split("T")[0]}.pdf`,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  canGenerate(
    options: ResumeGeneratorOptions
  ): { valid: boolean; reason?: string } {
    if (options.projectIds.length === 0) {
      return { valid: false, reason: "No projects selected" }
    }
    return { valid: true }
  }
}
