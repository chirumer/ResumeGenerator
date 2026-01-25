"use client"

import { useState, useCallback, useEffect } from "react"

const STORAGE_KEY = "resume-generator-project-notes"

export function useProjectNotes() {
  const [notes, setNotes] = useState<Map<string, string>>(new Map())
  const [isHydrated, setIsHydrated] = useState(false)

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, string>
        setNotes(new Map(Object.entries(parsed)))
      }
    } catch {
      // Ignore localStorage errors
    }
    setIsHydrated(true)
  }, [])

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (!isHydrated) return
    try {
      const obj = Object.fromEntries(notes)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
    } catch {
      // Ignore localStorage errors
    }
  }, [notes, isHydrated])

  // Set note for a specific project
  const setNote = useCallback((projectId: string, text: string) => {
    setNotes((prev) => {
      const newMap = new Map(prev)
      if (text.trim() === "") {
        newMap.delete(projectId)
      } else {
        newMap.set(projectId, text)
      }
      return newMap
    })
  }, [])

  // Get note for a specific project
  const getNote = useCallback(
    (projectId: string): string => {
      return notes.get(projectId) ?? ""
    },
    [notes]
  )

  // Clear all notes
  const clearAllNotes = useCallback(() => {
    setNotes(new Map())
  }, [])

  // Get all notes as a record (for resume generation)
  const getAllNotes = useCallback((): Record<string, string> => {
    return Object.fromEntries(notes)
  }, [notes])

  return {
    notes,
    setNote,
    getNote,
    clearAllNotes,
    getAllNotes,
    isHydrated,
  }
}
