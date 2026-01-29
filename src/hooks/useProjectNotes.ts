"use client"

import { useState, useCallback, useRef } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function useProjectNotes(initialNotes: Map<string, string> = new Map()) {
  const [notes, setNotes] = useState<Map<string, string>>(initialNotes)
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Set note for a specific project
  const setNote = useCallback((projectId: string, text: string) => {
    // Optimistic update
    setNotes((prev) => {
      const newMap = new Map(prev)
      if (text.trim() === "") {
        newMap.delete(projectId)
      } else {
        newMap.set(projectId, text)
      }
      return newMap
    })

    // Debounce API call
    if (debounceTimers.current.has(projectId)) {
      clearTimeout(debounceTimers.current.get(projectId))
    }

    const timer = setTimeout(async () => {
      try {
        await fetch(`${API_BASE}/api/projects/notes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ projectId, note: text }),
        })
      } catch (error) {
        console.error("Failed to save note:", error)
        // Optionally handle error (e.g., revert optimistic update or show toast)
      } finally {
        debounceTimers.current.delete(projectId)
      }
    }, 1000) // 1 second debounce

    debounceTimers.current.set(projectId, timer)
  }, [])

  // Get note for a specific project
  const getNote = useCallback(
    (projectId: string): string => {
      return notes.get(projectId) ?? ""
    },
    [notes]
  )

  // Get all notes as a record (for resume generation)
  const getAllNotes = useCallback((): Record<string, string> => {
    return Object.fromEntries(notes)
  }, [notes])

  return {
    notes,
    setNote,
    getNote,
    getAllNotes,
  }
}
