import type { IResumeGenerator, ExportFormat } from "./IResumeGenerator"
import { PlaceholderResumeGenerator } from "./PlaceholderResumeGenerator"
import { DisabledResumeGenerator } from "./DisabledResumeGenerator"

const generators: Record<ExportFormat, IResumeGenerator> = {
  pdf: new PlaceholderResumeGenerator(),
  gdocs: new DisabledResumeGenerator("Docs"),
  docx: new DisabledResumeGenerator("Word"),
}

export function getResumeGenerator(format: ExportFormat): IResumeGenerator {
  return generators[format]
}

export function getAllGenerators(): Array<{
  format: ExportFormat
  generator: IResumeGenerator
}> {
  return Object.entries(generators).map(([format, generator]) => ({
    format: format as ExportFormat,
    generator,
  }))
}

export * from "./IResumeGenerator"
