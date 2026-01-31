"use client"

import { useMemo } from "react"
import { useLocalStorage } from "./useLocalStorage"
import type { WorkExperienceWithContent } from "@/types/workExperience"

export type WorkExperienceArchiveFilter = "active" | "archived"

export function useWorkExperienceArchiveFilter(workExperiences: WorkExperienceWithContent[], storageKey?: string) {
  const [archiveFilter, setArchiveFilter] = useLocalStorage<WorkExperienceArchiveFilter>(
    storageKey ?? "",
    "active",
    storageKey ? undefined : undefined
  )

  // Filter work experiences based on archived status
  const filteredWorkExperiences = useMemo(() => {
    return workExperiences.filter((we) =>
      archiveFilter === "active" ? !we.archived : we.archived
    )
  }, [workExperiences, archiveFilter])

  return {
    archiveFilter,
    setArchiveFilter,
    filteredWorkExperiences,
  }
}
