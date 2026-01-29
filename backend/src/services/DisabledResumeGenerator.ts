import type {
  IResumeGenerator,
  ResumeGeneratorOptions,
  ResumeGeneratorResult,
} from "./IResumeGenerator.js"

export class DisabledResumeGenerator implements IResumeGenerator {
  constructor(public readonly formatName: string) {}

  readonly isEnabled = false

  async generate(
    _options: ResumeGeneratorOptions,
    _repositories: any
  ): Promise<ResumeGeneratorResult> {
    return {
      success: false,
      error: `${this.formatName} export is not yet available`,
    }
  }

  canGenerate(
    _options: ResumeGeneratorOptions
  ): { valid: boolean; reason?: string } {
    return { valid: false, reason: "This export format is coming soon" }
  }
}
