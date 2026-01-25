"use client"

import { useState } from "react"
import { TopBar } from "./TopBar"
import { TagFilterBar } from "./TagFilterBar"
import { ProjectGrid } from "./ProjectGrid"
import { CartSidebar } from "./CartSidebar"
import { DescriptionModal } from "./DescriptionModal"
import { useProjectSelection } from "@/hooks/useProjectSelection"
import { useTagFilter } from "@/hooks/useTagFilter"
import { useProjectNotes } from "@/hooks/useProjectNotes"
import type { ProjectWithContent } from "@/types/project"

interface DashboardProps {
  initialProjects: ProjectWithContent[]
}

export function Dashboard({ initialProjects }: DashboardProps) {
  const selection = useProjectSelection()
  const filter = useTagFilter(initialProjects)
  
  // Initialize notes from project data
  const initialNotes = new Map(
    initialProjects
      .filter((p) => p.user_notes && p.user_notes.trim() !== "")
      .map((p) => [p.id, p.user_notes])
  )
  const notes = useProjectNotes(initialNotes)

  // Modal state for description viewing
  const [viewingProject, setViewingProject] =
    useState<ProjectWithContent | null>(null)

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
        totalCount={initialProjects.length}
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
          />
        </main>

        <CartSidebar
          projects={initialProjects}
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
