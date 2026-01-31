"use client"

import { useMemo } from "react"
import { useLocalStorage } from "./useLocalStorage"
import type { ProjectWithContent } from "@/types/project"

export type ArchiveFilter = "active" | "archived"

export function useArchiveFilter(projects: ProjectWithContent[], storageKey?: string) {
  const [archiveFilter, setArchiveFilter] = useLocalStorage<ArchiveFilter>(
    storageKey ?? "",
    "active",
    storageKey ? undefined : undefined
  )

  // Filter projects based on archived status
  const filteredProjects = useMemo(() => {
    return projects.filter((project) =>
      archiveFilter === "active" ? !project.archived : project.archived
    )
  }, [projects, archiveFilter])

  return {
    archiveFilter,
    setArchiveFilter,
    filteredProjects,
  }
}
