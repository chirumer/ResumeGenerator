export class DisabledResumeGenerator {
    formatName;
    constructor(formatName) {
        this.formatName = formatName;
    }
    isEnabled = false;
    async generate(_options, _repositories) {
        return {
            success: false,
            error: `${this.formatName} export is not yet available`,
        };
    }
    canGenerate(_options) {
        return { valid: false, reason: "This export format is coming soon" };
    }
}
