// Client-safe exports - types and metadata only
import type { IResumeGenerator, ExportFormat } from "./IResumeGenerator"

// Metadata about available generators for UI display
export function getAllGenerators(): Array<{
  format: ExportFormat
  generator: {
    formatName: string
    isEnabled: boolean
  }
}> {
  return [
    { format: "pdf", generator: { formatName: "PDF", isEnabled: true } },
    { format: "gdocs", generator: { formatName: "Google Docs", isEnabled: false } },
    { format: "docx", generator: { formatName: "Word", isEnabled: false } },
  ]
}

export * from "./IResumeGenerator"
