import { apiClient } from "@/lib/api-client"
import { Dashboard } from "@/components/Dashboard"

export default async function HomePage() {
  const projects = await apiClient.getProjects()
  const workExperiences = await apiClient.getWorkExperiences()
  const general = await apiClient.getGeneral()

  return (
    <Dashboard
      initialProjects={projects}
      initialWorkExperiences={workExperiences}
      initialGeneral={general}
    />
  )
}
