"use client"

import { useCallback, useMemo } from "react"
import { useLocalStorage } from "./useLocalStorage"
import type { WorkExperienceWithContent } from "@/types/workExperience"

export function useWorkExperienceCategoryFilter(workExperiences: WorkExperienceWithContent[], storageKey?: string) {
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

  // Extract all unique category names from work experiences
  const allCategories = useMemo(() => {
    const categorySet = new Set<string>()
    workExperiences.forEach((we) =>
      we.categories.forEach((c) => categorySet.add(c.category_name))
    )
    return Array.from(categorySet).sort()
  }, [workExperiences])

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

  // Filter work experiences based on selected categories (OR logic - show if any category matches)
  const filteredWorkExperiences = useMemo(() => {
    if (selectedCategories.size === 0) {
      return workExperiences // No filter = show all
    }
    return workExperiences.filter((we) =>
      we.categories.some((c) => selectedCategories.has(c.category_name))
    )
  }, [workExperiences, selectedCategories])

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
    filteredWorkExperiences,
    clearFilters,
    isCategorySelected,
    hasActiveFilters: selectedCategories.size > 0,
  }
}
