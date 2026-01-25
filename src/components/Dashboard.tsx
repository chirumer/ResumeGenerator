"use client"

import { useState, useMemo } from "react"
import { TopBar } from "./TopBar"
import { TagFilterBar } from "./TagFilterBar"
import { ProjectGrid } from "./ProjectGrid"
import { CartSidebar } from "./CartSidebar"
import { DescriptionModal } from "./DescriptionModal"
import { useProjectSelection } from "@/hooks/useProjectSelection"
import { useTagFilter } from "@/hooks/useTagFilter"
import { useProjectNotes } from "@/hooks/useProjectNotes"
import { useArchiveFilter } from "@/hooks/useArchiveFilter"
import { toggleProjectArchived } from "@/app/actions"
import type { ProjectWithContent } from "@/types/project"

interface DashboardProps {
  initialProjects: ProjectWithContent[]
}

export function Dashboard({ initialProjects }: DashboardProps) {
  // Local state for projects to update archive status
  const [projects, setProjects] = useState<ProjectWithContent[]>(initialProjects)

  const selection = useProjectSelection()
  const archiveFilter = useArchiveFilter(projects)
  const filter = useTagFilter(archiveFilter.filteredProjects)

  // Initialize notes from project data
  const initialNotes = useMemo(
    () =>
      new Map(
        projects
          .filter((p) => p.user_notes && p.user_notes.trim() !== "")
          .map((p) => [p.id, p.user_notes])
      ),
    [projects]
  )
  const notes = useProjectNotes(initialNotes)

  // Modal state for description viewing
  const [viewingProject, setViewingProject] =
    useState<ProjectWithContent | null>(null)

  // Handle archive toggle
  const handleArchiveToggle = async (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      const newArchivedState = !project.archived
      await toggleProjectArchived(projectId, newArchivedState)

      // Optimistically update the local state
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, archived: newArchivedState } : p
        )
      )

      // Switch to the appropriate filter view
      archiveFilter.setArchiveFilter(newArchivedState ? "archived" : "active")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar
        selectedCount={selection.selectedCount}
        orderedSelectedIds={selection.orderedSelectedIds}
        notes={notes.getAllNotes()}
      />

      <TagFilterBar
        allTags={filter.allTags}
        selectedTags={filter.selectedTags}
        onToggleTag={filter.toggleTag}
        onClearFilters={filter.clearFilters}
        onSelectAll={() =>
          selection.selectAll(filter.filteredProjects.map((p) => p.id))
        }
        filteredCount={filter.filteredProjects.length}
        totalCount={archiveFilter.filteredProjects.length}
        archiveFilter={archiveFilter.archiveFilter}
        onArchiveFilterChange={archiveFilter.setArchiveFilter}
      />

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <ProjectGrid
            projects={filter.filteredProjects}
            isSelected={selection.isSelected}
            getSelectionOrder={selection.getSelectionOrder}
            onToggle={selection.toggleSelection}
            onViewDescription={setViewingProject}
            getNote={notes.getNote}
            onNoteChange={notes.setNote}
            onArchiveToggle={handleArchiveToggle}
          />
        </main>

        <CartSidebar
          projects={projects}
          orderedSelectedIds={selection.orderedSelectedIds}
          onDeselect={selection.deselect}
          onClearAll={selection.clearAll}
        />
      </div>

      <DescriptionModal
        project={viewingProject}
        onClose={() => setViewingProject(null)}
      />
    </div>
  )
}
