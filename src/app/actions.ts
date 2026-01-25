"use server"

import { projectRepository } from "@/lib/repositories/projectRepository"

export async function toggleProjectArchived(projectId: string, archived: boolean) {
  await projectRepository.updateProjectArchived(projectId, archived)
}

export async function updateProjectNote(projectId: string, note: string) {
  await projectRepository.updateProjectNote(projectId, note)
}
