"use client"

import { useState, useCallback, useMemo } from "react"
import type { ProjectWithContent } from "@/types/project"

export function useTagFilter(projects: ProjectWithContent[]) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())

  // Extract all unique tags from projects
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    projects.forEach((p) => p.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [projects])

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

  // Filter projects based on selected tags (OR logic - show if any tag matches)
  const filteredProjects = useMemo(() => {
    if (selectedTags.size === 0) {
      return projects // No filter = show all
    }
    return projects.filter((project) =>
      project.tags.some((tag) => selectedTags.has(tag))
    )
  }, [projects, selectedTags])

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
    filteredProjects,
    clearFilters,
    isTagSelected,
    hasActiveFilters: selectedTags.size > 0,
  }
}
