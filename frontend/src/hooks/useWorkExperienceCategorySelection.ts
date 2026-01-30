"use client"

import { useState, useCallback } from "react"

export function useWorkExperienceCategorySelection() {
  const [selectedCategories, setSelectedCategories] = useState<Map<string, string>>(new Map())

  const setCategory = useCallback((workExperienceId: string, categoryName: string) => {
    setSelectedCategories((prev) => {
      const newMap = new Map(prev)
      newMap.set(workExperienceId, categoryName)
      return newMap
    })
  }, [])

  const getCategory = useCallback((workExperienceId: string): string | null => {
    return selectedCategories.get(workExperienceId) || null
  }, [selectedCategories])

  return { selectedCategories, setCategory, getCategory }
}
