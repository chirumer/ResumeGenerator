"use server"

import { apiClient } from "@/lib/api-client"

export async function toggleProjectArchived(projectId: string, archived: boolean) {
  await apiClient.toggleProjectArchived(projectId, archived)
}

export async function updateProjectNote(projectId: string, note: string) {
  await apiClient.updateProjectNote(projectId, note)
}

export async function toggleWorkExperienceArchived(workExperienceId: string, archived: boolean) {
  await apiClient.toggleWorkExperienceArchived(workExperienceId, archived)
}

export async function updateWorkExperienceNote(workExperienceId: string, note: string) {
  await apiClient.updateWorkExperienceNote(workExperienceId, note)
}
