"use client"

import { useCallback, useMemo } from "react"
import { useLocalStorage } from "./useLocalStorage"
import type { ProjectWithContent } from "@/types/project"

export function useCategoryFilter(projects: ProjectWithContent[], storageKey?: string) {
  // For localStorage serialization of Set
  const serialize = (set: Set<string>): string => {
    return JSON.stringify(Array.from(set))
  }

  const deserialize = (value: string): Set<string> => {
    try {
      return new Set(JSON.parse(value))
    } catch {
      return new Set()
    }
  }

  const [selectedCategories, setSelectedCategories] = useLocalStorage<Set<string>>(
    storageKey ?? "",
    new Set(),
    storageKey ? { serialize, deserialize } : undefined
  )

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
  }, [setSelectedCategories])

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
  }, [setSelectedCategories])

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
