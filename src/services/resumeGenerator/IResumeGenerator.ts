export type ExportFormat = "pdf" | "gdocs" | "docx"

export interface ResumeGeneratorOptions {
  format: ExportFormat
  projectIds: string[] // Ordered list of project IDs
  notes?: Record<string, string> // Optional user notes per project
}

export interface ResumeGeneratorResult {
  success: boolean
  data?: Blob | string // Blob for downloads, string for redirect URLs
  filename?: string
  error?: string
}

export interface IResumeGenerator {
  readonly formatName: string
  readonly isEnabled: boolean

  generate(options: ResumeGeneratorOptions): Promise<ResumeGeneratorResult>

  // Validate if generation is possible
  canGenerate(
    options: ResumeGeneratorOptions
  ): { valid: boolean; reason?: string }
}
