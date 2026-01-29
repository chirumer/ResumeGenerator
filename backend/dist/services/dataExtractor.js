// Parse resume points from markdown file content
function parseResumePoints(content) {
    return content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("- "))
        .map((line) => line.substring(2)) // Remove the "- " prefix
        .filter((point) => point.length > 0);
}
// Format date for LaTeX resume
function formatDate(dateString) {
    if (!dateString)
        return "Present";
    const date = new Date(dateString);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${month}. ${year}`;
}
// Slugify project name for file lookup
function slugify(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .trim();
}
/**
 * Get work experiences for resume
 * Refactored to use repositories instead of direct file reads
 */
export async function getWorkExperienceForResume(workExperienceIds, workExperienceCategories, repositories) {
    const { workExperienceRepository } = repositories;
    const allExperiences = await workExperienceRepository.getAllWorkExperiences();
    const results = [];
    for (let i = 0; i < workExperienceIds.length; i++) {
        const id = workExperienceIds[i];
        const category = workExperienceCategories[i];
        const experience = allExperiences.find((exp) => exp.id === id);
        if (!experience) {
            console.warn(`Work experience not found: ${id}`);
            continue;
        }
        // Find the resume points for the selected category
        const resumePointsContent = experience.resumePointsByCategory.get(category);
        if (!resumePointsContent) {
            console.warn(`Category ${category} not found for work experience ${id}, using first available category`);
            // Use first available category as fallback
            const firstCategory = experience.categories[0];
            if (firstCategory) {
                const fallbackContent = experience.resumePointsByCategory.get(firstCategory.category_name);
                const resumePoints = fallbackContent ? parseResumePoints(fallbackContent) : [];
                results.push({
                    company: experience.company,
                    role: experience.role,
                    location: experience.location || "",
                    startDate: formatDate(experience.startDate),
                    endDate: formatDate(experience.endDate),
                    resumePoints,
                });
            }
            continue;
        }
        const resumePoints = parseResumePoints(resumePointsContent);
        results.push({
            company: experience.company,
            role: experience.role,
            location: experience.location || "",
            startDate: formatDate(experience.startDate),
            endDate: formatDate(experience.endDate),
            resumePoints,
        });
    }
    return results;
}
/**
 * Get projects for resume
 * Refactored to use repositories instead of direct file reads
 */
export async function getProjectsForResume(projectIds, projectCategories, repositories) {
    const { projectRepository } = repositories;
    const allProjects = await projectRepository.getAllProjects();
    const results = [];
    for (let i = 0; i < projectIds.length; i++) {
        const id = projectIds[i];
        const category = projectCategories[i];
        const project = allProjects.find((proj) => proj.id === id);
        if (!project) {
            console.warn(`Project not found: ${id}`);
            continue;
        }
        // Find the resume points for the selected category
        const resumePointsContent = project.resumePointsByCategory.get(category);
        if (!resumePointsContent) {
            console.warn(`Category ${category} not found for project ${id}, using first available category`);
            // Use first available category as fallback
            const firstCategory = project.categories[0];
            if (firstCategory) {
                const fallbackContent = project.resumePointsByCategory.get(firstCategory.category_name);
                const resumePoints = fallbackContent ? parseResumePoints(fallbackContent) : [];
                results.push({
                    name: project.project_name,
                    techStack: project.github.url || "",
                    resumePoints,
                });
            }
            continue;
        }
        const resumePoints = parseResumePoints(resumePointsContent);
        results.push({
            name: project.project_name,
            techStack: project.github.url || "",
            resumePoints,
        });
    }
    return results;
}
