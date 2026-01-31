// Minimal resume generator types for frontend
// The actual resume generation is now handled by the backend API

export type ExportFormat = "pdf" | "latex" | "gdocs" | "docx"

export interface GeneratorInfo {
  format: ExportFormat
  generator: {
    formatName: string
    isEnabled: boolean
  }
}

// Get available generators (only PDF is enabled via backend)
export function getAllGenerators(): GeneratorInfo[] {
  return [
    {
      format: "pdf",
      generator: {
        formatName: "PDF",
        isEnabled: true,
      },
    },
    {
      format: "latex",
      generator: {
        formatName: "LaTeX Source",
        isEnabled: true,
      },
    },
    {
      format: "gdocs",
      generator: {
        formatName: "Google Docs",
        isEnabled: false,
      },
    },
    {
      format: "docx",
      generator: {
        formatName: "Word Document",
        isEnabled: false,
      },
    },
  ]
}
