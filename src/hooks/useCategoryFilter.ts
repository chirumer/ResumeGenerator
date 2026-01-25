"use client"

import { useState, useCallback, useMemo } from "react"
import type { ProjectWithContent } from "@/types/project"

export function useCategoryFilter(projects: ProjectWithContent[]) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())

  // Extract all unique category names from projects
  const allCategories = useMemo(() => {
    const categorySet = new Set<string>()
    projects.forEach((p) =>
      p.categories.forEach((c) => categorySet.add(c.category_name))
    )
    return Array.from(categorySet).sort()
  }, [projects])

  // Toggle category selection
  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }, [])

  // Filter projects based on selected categories (OR logic - show if any category matches)
  const filteredProjects = useMemo(() => {
    if (selectedCategories.size === 0) {
      return projects // No filter = show all
    }
    return projects.filter((project) =>
      project.categories.some((c) => selectedCategories.has(c.category_name))
    )
  }, [projects, selectedCategories])

  // Clear all category filters
  const clearFilters = useCallback(() => {
    setSelectedCategories(new Set())
  }, [])

  // Check if a specific category is selected
  const isCategorySelected = useCallback(
    (category: string) => selectedCategories.has(category),
    [selectedCategories]
  )

  return {
    allCategories,
    selectedCategories,
    toggleCategory,
    filteredProjects,
    clearFilters,
    isCategorySelected,
    hasActiveFilters: selectedCategories.size > 0,
  }
}
