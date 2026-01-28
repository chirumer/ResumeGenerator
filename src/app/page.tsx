import { projectRepository } from "@/lib/repositories/projectRepository"
import { workExperienceRepository } from "@/lib/repositories/workExperienceRepository"
import { Dashboard } from "@/components/Dashboard"

export default async function HomePage() {
  const projects = await projectRepository.getAllProjects()
  const workExperiences = await workExperienceRepository.getAllWorkExperiences()

  return <Dashboard initialProjects={projects} initialWorkExperiences={workExperiences} />
}
