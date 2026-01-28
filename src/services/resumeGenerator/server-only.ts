// This file contains server-only implementations
import type { IResumeGenerator, ExportFormat } from "./IResumeGenerator"
import { LatexResumeGenerator } from "./LatexResumeGenerator"
import { DisabledResumeGenerator } from "./DisabledResumeGenerator"

const generators: Record<ExportFormat, IResumeGenerator> = {
  pdf: new LatexResumeGenerator(),
  gdocs: new DisabledResumeGenerator("Docs"),
  docx: new DisabledResumeGenerator("Word"),
}

export function getResumeGenerator(format: ExportFormat): IResumeGenerator {
  return generators[format]
}

export type { IResumeGenerator, ResumeGeneratorOptions, ResumeGeneratorResult, ExportFormat } from "./IResumeGenerator"
