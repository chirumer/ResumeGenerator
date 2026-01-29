"use client"

import { useState, useCallback } from "react"

export function useCategorySelection() {
  const [selectedCategories, setSelectedCategories] = useState<Map<string, string>>(new Map())

  const setCategory = useCallback((projectId: string, categoryName: string) => {
    setSelectedCategories((prev) => {
      const newMap = new Map(prev)
      newMap.set(projectId, categoryName)
      return newMap
    })
  }, [])

  const getCategory = useCallback((projectId: string): string | null => {
    return selectedCategories.get(projectId) || null
  }, [selectedCategories])

  return { selectedCategories, setCategory, getCategory }
}
