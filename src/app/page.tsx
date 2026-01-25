import { projectRepository } from "@/lib/repositories/projectRepository"
import { Dashboard } from "@/components/Dashboard"

export default async function HomePage() {
  const projects = await projectRepository.getAllProjects()

  return <Dashboard initialProjects={projects} />
}
