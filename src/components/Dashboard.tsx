"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { TopBar } from "./TopBar"
import { CategoryFilterBar } from "./CategoryFilterBar"
import { ProjectGrid } from "./ProjectGrid"
import { CartSidebar } from "./CartSidebar"
import { DescriptionModal } from "./DescriptionModal"
import { WorkExperienceFilterBar } from "./WorkExperienceFilterBar"
import { WorkExperienceGrid } from "./WorkExperienceGrid"
import { WorkExperienceCartSidebar } from "./WorkExperienceCartSidebar"
import { useProjectSelection } from "@/hooks/useProjectSelection"
import { useWorkExperienceSelection } from "@/hooks/useWorkExperienceSelection"
import { useCategoryFilter } from "@/hooks/useCategoryFilter"
import { useCategorySelection } from "@/hooks/useCategorySelection"
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
  const projectFilter = useCategoryFilter(projectArchiveFilter.filteredProjects)
  const categorySelection = useCategorySelection()

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

  // When filters change, adjust selected categories to first eligible filtered category
  useEffect(() => {
    if (projectFilter.hasActiveFilters) {
      const filteredCategories = Array.from(projectFilter.selectedCategories)
      projectFilter.filteredProjects.forEach((project) => {
        const currentCategory = categorySelection.getCategory(project.id)
        if (currentCategory && !filteredCategories.includes(currentCategory)) {
          // Find the first category that this project has which is in the filtered list
          const firstEligible = project.categories.find((c) =>
            filteredCategories.includes(c.category_name)
          )
          if (firstEligible) {
            categorySelection.setCategory(project.id, firstEligible.category_name)
          }
        }
      })
    }
  }, [projectFilter.selectedCategories, projectFilter.filteredProjects, categorySelection, projectFilter.hasActiveFilters])

  // Get the effective category for a project (handles filtering case)
  const getEffectiveCategory = useCallback((project: ProjectWithContent): string => {
    const selectedCategory = categorySelection.getCategory(project.id)
    if (selectedCategory) return selectedCategory

    // If filtering is active and the default category isn't filtered, use first eligible
    if (projectFilter.hasActiveFilters) {
      const filteredCategories = Array.from(projectFilter.selectedCategories)
      const firstEligible = project.categories.find((c) =>
        filteredCategories.includes(c.category_name)
      )
      return firstEligible?.category_name || project.selectedCategory
    }

    return project.selectedCategory
  }, [categorySelection, projectFilter.hasActiveFilters, projectFilter.selectedCategories])

  // Wrapper for ProjectGrid that handles projectId lookup
  const getCategoryForProject = useCallback((projectId: string): string | null => {
    const project = projects.find((p) => p.id === projectId)
    return project ? getEffectiveCategory(project) : null
  }, [projects, getEffectiveCategory])

  // Get current category for the viewing project
  const viewingProjectCategory = viewingProject ? getEffectiveCategory(viewingProject) : null

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
          <CategoryFilterBar
            allCategories={projectFilter.allCategories}
            selectedCategories={projectFilter.selectedCategories}
            onToggleCategory={projectFilter.toggleCategory}
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
                getCategory={getCategoryForProject}
                onCategoryChange={categorySelection.setCategory}
                filteredCategories={projectFilter.hasActiveFilters ? Array.from(projectFilter.selectedCategories) : undefined}
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
        currentCategory={viewingProjectCategory}
        onClose={() => setViewingProject(null)}
      />
    </div>
  )
}
