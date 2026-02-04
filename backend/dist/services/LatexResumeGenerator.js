import { generateLatexResume } from "./latexTemplate.js";
import { getWorkExperienceForResume, getProjectsForResume, } from "./dataExtractor.js";
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
export class LatexResumeGenerator {
    formatName = "PDF";
    isEnabled = true;
    async generate(options, repositories) {
        try {
            // Extract data for work experiences (using repositories)
            const workExperiences = await getWorkExperienceForResume(options.workExperienceIds || [], options.workExperienceCategories || [], repositories);
            // Extract data for projects (using repositories)
            const projects = await getProjectsForResume(options.projectIds || [], options.projectCategories || [], repositories);
            // Get general information
            const generalInfo = await repositories.generalRepository.getGeneralInfo();
            // Generate LaTeX content
            const latexContent = generateLatexResume(workExperiences, projects, generalInfo);
            // Compile LaTeX to PDF using pdflatex
            const { tmpdir } = await import("os");
            const { join } = await import("path");
            const { writeFile, unlink, readFile } = await import("fs/promises");
            const tmpDir = tmpdir();
            const timestamp = Date.now();
            const texFile = join(tmpDir, `resume-${timestamp}.tex`);
            const pdfFile = join(tmpDir, `resume-${timestamp}.pdf`);
            // Write the .tex file
            await writeFile(texFile, latexContent, "utf-8");
            try {
                // Run pdflatex
                await execAsync(`pdflatex -interaction=nonstopmode -output-directory=${tmpDir} ${texFile}`, {
                    maxBuffer: 1024 * 1024 * 10, // 10MB buffer
                });
                // Read the generated PDF
                const pdfBuffer = await readFile(pdfFile);
                return {
                    success: true,
                    data: new Blob([pdfBuffer], { type: "application/pdf" }),
                    filename: `resume-${new Date().toISOString().split("T")[0]}.pdf`,
                };
            }
            finally {
                // Clean up temporary files
                try {
                    await unlink(texFile);
                    await unlink(pdfFile);
                    // Also clean up auxiliary files
                    await unlink(join(tmpDir, `resume-${timestamp}.log`)).catch(() => { });
                    await unlink(join(tmpDir, `resume-${timestamp}.aux`)).catch(() => { });
                }
                catch {
                    // Ignore cleanup errors
                }
            }
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
            };
        }
    }
    canGenerate(options) {
        const totalItems = (options.projectIds?.length || 0) +
            (options.workExperienceIds?.length || 0);
        if (totalItems === 0) {
            return {
                valid: false,
                reason: "At least one project or work experience must be selected",
            };
        }
        // Validate that categories match IDs
        if (options.projectIds &&
            options.projectCategories &&
            options.projectIds.length !== options.projectCategories.length) {
            return {
                valid: false,
                reason: "Project categories must match project IDs",
            };
        }
        if (options.workExperienceIds &&
            options.workExperienceCategories &&
            options.workExperienceIds.length !==
                options.workExperienceCategories.length) {
            return {
                valid: false,
                reason: "Work experience categories must match work experience IDs",
            };
        }
        return { valid: true };
    }
}
