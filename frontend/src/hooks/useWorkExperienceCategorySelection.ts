"use client"

import { useCallback } from "react"
import { useLocalStorage } from "./useLocalStorage"

export function useWorkExperienceCategorySelection(storageKey?: string) {
  // For localStorage serialization of Map
  const serialize = (map: Map<string, string>): string => {
    return JSON.stringify(Array.from(map.entries()))
  }

  const deserialize = (value: string): Map<string, string> => {
    try {
      return new Map(JSON.parse(value))
    } catch {
      return new Map()
    }
  }

  const [selectedCategories, setSelectedCategories] = useLocalStorage<Map<string, string>>(
    storageKey ?? "",
    new Map(),
    storageKey ? { serialize, deserialize } : undefined
  )

  const setCategory = useCallback((workExperienceId: string, categoryName: string) => {
    setSelectedCategories((prev) => {
      const newMap = new Map(prev)
      newMap.set(workExperienceId, categoryName)
      return newMap
    })
  }, [setSelectedCategories])

  const getCategory = useCallback((workExperienceId: string): string | null => {
    return selectedCategories.get(workExperienceId) || null
  }, [selectedCategories])

  return { selectedCategories, setCategory, getCategory }
}
