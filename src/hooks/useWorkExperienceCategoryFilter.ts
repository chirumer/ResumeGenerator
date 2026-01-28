"use client"

import { useState, useCallback, useMemo } from "react"
import type { WorkExperienceWithContent } from "@/types/workExperience"

export function useWorkExperienceCategoryFilter(workExperiences: WorkExperienceWithContent[]) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())

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
  }, [])

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
    filteredWorkExperiences,
    clearFilters,
    isCategorySelected,
    hasActiveFilters: selectedCategories.size > 0,
  }
}
