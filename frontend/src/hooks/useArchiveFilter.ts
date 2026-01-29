"use client"

import { useState, useMemo } from "react"
import type { ProjectWithContent } from "@/types/project"

export type ArchiveFilter = "active" | "archived"

export function useArchiveFilter(projects: ProjectWithContent[]) {
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>("active")

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
