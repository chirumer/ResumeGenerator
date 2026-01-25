"use client"

import { useCallback, useMemo } from "react"
import type { WorkExperienceWithContent } from "@/types/workExperience"

/**
 * Stub hook for work experience tag filtering.
 * Filtering is not yet implemented for work experiences.
 */
export function useWorkExperienceTagFilter(workExperiences: WorkExperienceWithContent[]) {
  const allTags: string[] = []
  const selectedTags = new Set<string>()

  const toggleTag = useCallback((_tag: string) => {
    // No-op: filtering not implemented
  }, [])

  const filteredWorkExperiences = useMemo(() => {
    return workExperiences // Pass through all items without filtering
  }, [workExperiences])

  const clearFilters = useCallback(() => {
    // No-op: filtering not implemented
  }, [])

  const isTagSelected = useCallback(() => {
    return false
  }, [])

  return {
    allTags,
    selectedTags,
    toggleTag,
    filteredWorkExperiences,
    clearFilters,
    isTagSelected,
    hasActiveFilters: false,
  }
}
