import { apiClient } from "@/lib/api-client"
import { Dashboard } from "@/components/Dashboard"

export default async function HomePage() {
  const projects = await apiClient.getProjects()
  const workExperiences = await apiClient.getWorkExperiences()

  return <Dashboard initialProjects={projects} initialWorkExperiences={workExperiences} />
}
