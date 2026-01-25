"use client"

import { useState, useMemo } from "react"
import { TopBar } from "./TopBar"
import { TagFilterBar } from "./TagFilterBar"
import { ProjectGrid } from "./ProjectGrid"
import { CartSidebar } from "./CartSidebar"
import { DescriptionModal } from "./DescriptionModal"
import { WorkExperienceFilterBar } from "./WorkExperienceFilterBar"
import { WorkExperienceGrid } from "./WorkExperienceGrid"
import { WorkExperienceCartSidebar } from "./WorkExperienceCartSidebar"
import { useProjectSelection } from "@/hooks/useProjectSelection"
import { useWorkExperienceSelection } from "@/hooks/useWorkExperienceSelection"
import { useTagFilter } from "@/hooks/useTagFilter"
import { useWorkExperienceTagFilter } from "@/hooks/useWorkExperienceTagFilter"
import { useProjectNotes } from "@/hooks/useProjectNotes"
import { useWorkExperienceNotes } from "@/hooks/useWorkExperienceNotes"
import { useArchiveFilter } from "@/hooks/useArchiveFilter"
import { useWorkExperienceArchiveFilter } from "@/hooks/useWorkExperienceArchiveFilter"
import { toggleProjectArchived } from "@/app/actions"
import type { ProjectWithContent } from "@/types/project"
import type { WorkExperienceWithContent } from "@/types/workExperience"

interface DashboardProps {
  initialProjects: ProjectWithContent[]
}

export function Dashboard({ initialProjects }: DashboardProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<'projects' | 'work-experiences'>('projects')

  // Local state for projects to update archive status
  const [projects, setProjects] = useState<ProjectWithContent[]>(initialProjects)

  // Local state for work experiences (empty for now)
  const [workExperiences, setWorkExperiences] = useState<WorkExperienceWithContent[]>([])

  // Project state management
  const projectSelection = useProjectSelection()
  const projectArchiveFilter = useArchiveFilter(projects)
  const projectFilter = useTagFilter(projectArchiveFilter.filteredProjects)

  // Initialize notes from project data
  const initialProjectNotes = useMemo(
    () =>
      new Map(
        projects
          .filter((p) => p.user_notes && p.user_notes.trim() !== "")
          .map((p) => [p.id, p.user_notes])
      ),
    [projects]
  )
  const projectNotes = useProjectNotes(initialProjectNotes)

  // Work experience state management
  const workExperienceSelection = useWorkExperienceSelection()
  const workExperienceArchiveFilter = useWorkExperienceArchiveFilter(workExperiences)
  const workExperienceFilter = useWorkExperienceTagFilter(workExperienceArchiveFilter.filteredWorkExperiences)

  // Initialize work experience notes (empty for now)
  const initialWorkExperienceNotes = useMemo(() => new Map(), [])
  const workExperienceNotes = useWorkExperienceNotes(initialWorkExperienceNotes)

  // Modal state for description viewing
  const [viewingProject, setViewingProject] =
    useState<ProjectWithContent | null>(null)

  // Handle archive toggle for projects
  const handleProjectArchiveToggle = async (projectId: string) => {
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
      projectArchiveFilter.setArchiveFilter(newArchivedState ? "archived" : "active")
    }
  }

  // Handle archive toggle for work experiences (placeholder)
  const handleWorkExperienceArchiveToggle = async (workExperienceId: string) => {
    // Placeholder for work experience archive toggle
    console.log("Archive toggle for work experience:", workExperienceId)
  }

  // Merge notes from both projects and work experiences
  const allNotes = useMemo(() => ({
    ...projectNotes.getAllNotes(),
    ...workExperienceNotes.getAllNotes(),
  }), [projectNotes, workExperienceNotes])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar
        projectSelectedCount={projectSelection.selectedCount}
        workExperienceSelectedCount={workExperienceSelection.selectedCount}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        orderedSelectedProjectIds={projectSelection.orderedSelectedIds}
        orderedSelectedWorkExperienceIds={workExperienceSelection.orderedSelectedIds}
        notes={allNotes}
      />

      {activeTab === 'projects' ? (
        <>
          <TagFilterBar
            allTags={projectFilter.allTags}
            selectedTags={projectFilter.selectedTags}
            onToggleTag={projectFilter.toggleTag}
            onClearFilters={projectFilter.clearFilters}
            onSelectAll={() =>
              projectSelection.selectAll(projectFilter.filteredProjects.map((p) => p.id))
            }
            filteredCount={projectFilter.filteredProjects.length}
            totalCount={projectArchiveFilter.filteredProjects.length}
            archiveFilter={projectArchiveFilter.archiveFilter}
            onArchiveFilterChange={projectArchiveFilter.setArchiveFilter}
          />

          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-auto p-6">
              <ProjectGrid
                projects={projectFilter.filteredProjects}
                isSelected={projectSelection.isSelected}
                getSelectionOrder={projectSelection.getSelectionOrder}
                onToggle={projectSelection.toggleSelection}
                onViewDescription={setViewingProject}
                getNote={projectNotes.getNote}
                onNoteChange={projectNotes.setNote}
                onArchiveToggle={handleProjectArchiveToggle}
              />
            </main>

            <CartSidebar
              projects={projects}
              orderedSelectedIds={projectSelection.orderedSelectedIds}
              onDeselect={projectSelection.deselect}
              onClearAll={projectSelection.clearAll}
            />
          </div>
        </>
      ) : (
        <>
          <WorkExperienceFilterBar
            allTags={workExperienceFilter.allTags}
            selectedTags={workExperienceFilter.selectedTags}
            onToggleTag={workExperienceFilter.toggleTag}
            onClearFilters={workExperienceFilter.clearFilters}
            onSelectAll={() =>
              workExperienceSelection.selectAll(workExperienceFilter.filteredWorkExperiences.map((we) => we.id))
            }
            filteredCount={workExperienceFilter.filteredWorkExperiences.length}
            totalCount={workExperienceArchiveFilter.filteredWorkExperiences.length}
            archiveFilter={workExperienceArchiveFilter.archiveFilter}
            onArchiveFilterChange={workExperienceArchiveFilter.setArchiveFilter}
          />

          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-auto p-6">
              <WorkExperienceGrid
                workExperiences={workExperienceFilter.filteredWorkExperiences}
                isSelected={workExperienceSelection.isSelected}
                getSelectionOrder={workExperienceSelection.getSelectionOrder}
                onToggle={workExperienceSelection.toggleSelection}
                getNote={workExperienceNotes.getNote}
                onNoteChange={(id, note) => workExperienceNotes.setNote(id, note)}
                onArchiveToggle={handleWorkExperienceArchiveToggle}
              />
            </main>

            <WorkExperienceCartSidebar
              workExperiences={workExperiences}
              orderedSelectedIds={workExperienceSelection.orderedSelectedIds}
              onDeselect={workExperienceSelection.deselect}
              onClearAll={workExperienceSelection.clearAll}
            />
          </div>
        </>
      )}

      <DescriptionModal
        project={viewingProject}
        onClose={() => setViewingProject(null)}
      />
    </div>
  )
}
