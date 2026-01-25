"use client"

import { useCallback, useMemo } from "react"
import type { WorkExperienceWithContent } from "@/types/workExperience"

export type WorkExperienceArchiveFilter = "active" | "archived"

/**
 * Stub hook for work experience archive filtering.
 * Filtering is not yet implemented for work experiences.
 */
export function useWorkExperienceArchiveFilter(workExperiences: WorkExperienceWithContent[]) {
  const archiveFilter: WorkExperienceArchiveFilter = "active"

  const setArchiveFilter = useCallback((_filter: WorkExperienceArchiveFilter) => {
    // No-op: filtering not implemented
  }, [])

  const filteredWorkExperiences = useMemo(() => {
    return workExperiences // Pass through all items without filtering
  }, [workExperiences])

  return {
    archiveFilter,
    setArchiveFilter,
    filteredWorkExperiences,
  }
}
