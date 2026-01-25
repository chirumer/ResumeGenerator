"use client"

import { useState, useCallback, useMemo } from "react"
import type { WorkExperienceWithContent } from "@/types/workExperience"

export function useWorkExperienceTagFilter(workExperiences: WorkExperienceWithContent[]) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())

  // Extract all unique tags from work experiences
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    workExperiences.forEach((we) => we.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [workExperiences])

  // Toggle tag selection
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(tag)) {
        newSet.delete(tag)
      } else {
        newSet.add(tag)
      }
      return newSet
    })
  }, [])

  // Filter work experiences based on selected tags (OR logic - show if any tag matches)
  const filteredWorkExperiences = useMemo(() => {
    if (selectedTags.size === 0) {
      return workExperiences // No filter = show all
    }
    return workExperiences.filter((workExperience) =>
      workExperience.tags.some((tag) => selectedTags.has(tag))
    )
  }, [workExperiences, selectedTags])

  // Clear all tag filters
  const clearFilters = useCallback(() => {
    setSelectedTags(new Set())
  }, [])

  // Check if a specific tag is selected
  const isTagSelected = useCallback(
    (tag: string) => selectedTags.has(tag),
    [selectedTags]
  )

  return {
    allTags,
    selectedTags,
    toggleTag,
    filteredWorkExperiences,
    clearFilters,
    isTagSelected,
    hasActiveFilters: selectedTags.size > 0,
  }
}
