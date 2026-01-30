"use client"

import { useState, useMemo } from "react"
import type { WorkExperienceWithContent } from "@/types/workExperience"

export type WorkExperienceArchiveFilter = "active" | "archived"

export function useWorkExperienceArchiveFilter(workExperiences: WorkExperienceWithContent[]) {
  const [archiveFilter, setArchiveFilter] = useState<WorkExperienceArchiveFilter>("active")

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
