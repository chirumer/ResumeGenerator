"use client"

import { useState, useMemo } from "react"
import type { WorkExperienceWithContent } from "@/types/workExperience"

export type WorkExperienceArchiveFilter = "active" | "archived"

export function useWorkExperienceArchiveFilter(workExperiences: WorkExperienceWithContent[]) {
  const [archiveFilter, setArchiveFilter] = useState<WorkExperienceArchiveFilter>("active")

  // Filter work experiences based on archived status
  const filteredWorkExperiences = useMemo(() => {
    return workExperiences.filter((workExperience) =>
      archiveFilter === "active" ? !workExperience.archived : workExperience.archived
    )
  }, [workExperiences, archiveFilter])

  return {
    archiveFilter,
    setArchiveFilter,
    filteredWorkExperiences,
  }
}
