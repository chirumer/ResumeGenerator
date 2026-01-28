"use server"

import { projectRepository } from "@/lib/repositories/projectRepository"
import { workExperienceRepository } from "@/lib/repositories/workExperienceRepository"

export async function toggleProjectArchived(projectId: string, archived: boolean) {
  await projectRepository.updateProjectArchived(projectId, archived)
}

export async function updateProjectNote(projectId: string, note: string) {
  await projectRepository.updateProjectNote(projectId, note)
}

export async function toggleWorkExperienceArchived(workExperienceId: string, archived: boolean) {
  await workExperienceRepository.updateWorkExperienceArchived(workExperienceId, archived)
}

export async function updateWorkExperienceNote(workExperienceId: string, note: string) {
  await workExperienceRepository.updateWorkExperienceNote(workExperienceId, note)
}
