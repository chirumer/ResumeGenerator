"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

import { TopBar } from "./TopBar"
import { CategoryFilterBar } from "./CategoryFilterBar"
import { ProjectGrid } from "./ProjectGrid"
import { SelectionPanel } from "./SelectionPanel"
import { DescriptionModal } from "./DescriptionModal"
import { WorkExperienceDescriptionModal } from "./WorkExperienceDescriptionModal"
import { WorkExperienceCategoryFilterBar } from "./WorkExperienceCategoryFilterBar"
import { WorkExperienceGrid } from "./WorkExperienceGrid"
import { EntryFormModal } from "./EntryFormModal"
import { useProjectSelection } from "@/hooks/useProjectSelection"
import { useWorkExperienceSelection } from "@/hooks/useWorkExperienceSelection"
import { useCategoryFilter } from "@/hooks/useCategoryFilter"
import { useCategorySelection } from "@/hooks/useCategorySelection"
import { useWorkExperienceCategoryFilter } from "@/hooks/useWorkExperienceCategoryFilter"
import { useProjectNotes } from "@/hooks/useProjectNotes"
import { useWorkExperienceNotes } from "@/hooks/useWorkExperienceNotes"
import { useArchiveFilter } from "@/hooks/useArchiveFilter"
import { useWorkExperienceArchiveFilter } from "@/hooks/useWorkExperienceArchiveFilter"
import { useWorkExperienceCategorySelection } from "@/hooks/useWorkExperienceCategorySelection"
import { toggleProjectArchived, toggleWorkExperienceArchived } from "@/app/actions"
import { apiClient } from "@/lib/api-client"
import type { ProjectWithContent } from "@/types/project"
import type { WorkExperienceWithContent } from "@/types/workExperience"

interface DashboardProps {
  initialProjects: ProjectWithContent[]
  initialWorkExperiences: WorkExperienceWithContent[]
}

export function Dashboard({ initialProjects, initialWorkExperiences }: DashboardProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<'projects' | 'work-experiences'>('projects')

  // Local state for projects to update archive status
  const [projects, setProjects] = useState<ProjectWithContent[]>(initialProjects)

  // Local state for work experiences
  const [workExperiences, setWorkExperiences] = useState<WorkExperienceWithContent[]>(initialWorkExperiences)

  // Refetch functions to update data after mutations
  const refetchProjects = useCallback(async () => {
    const updated = await apiClient.getProjects()
    setProjects(updated)
  }, [])

  const refetchWorkExperiences = useCallback(async () => {
    const updated = await apiClient.getWorkExperiences()
    setWorkExperiences(updated)
  }, [])

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
  const workExperienceCategoryFilter = useWorkExperienceCategoryFilter(workExperienceArchiveFilter.filteredWorkExperiences)
  const workExperienceCategorySelection = useWorkExperienceCategorySelection()

  // Initialize work experience notes from work experience data
  const initialWorkExperienceNotes = useMemo(
    () =>
      new Map(
        initialWorkExperiences
          .filter((we) => we.user_notes && we.user_notes.trim() !== "")
          .map((we) => [we.id, we.user_notes])
      ),
    [initialWorkExperiences]
  )
  const workExperienceNotes = useWorkExperienceNotes(initialWorkExperienceNotes)

  // Modal state for description viewing
  const [viewingProject, setViewingProject] =
    useState<ProjectWithContent | null>(null)

  const [viewingWorkExperience, setViewingWorkExperience] =
    useState<WorkExperienceWithContent | null>(null)

  // Modal state for entry creation/editing
  const [entryModalOpen, setEntryModalOpen] = useState(false)
  const [entryModalMode, setEntryModalMode] = useState<"create" | "edit">("create")
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [editingEntrySection, setEditingEntrySection] = useState<"projects" | "work-experiences">("projects")

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

  // When filters change, adjust selected categories to first eligible filtered category for work experiences
  useEffect(() => {
    if (workExperienceCategoryFilter.hasActiveFilters) {
      const filteredCategories = Array.from(workExperienceCategoryFilter.selectedCategories)
      workExperienceCategoryFilter.filteredWorkExperiences.forEach((we) => {
        const currentCategory = workExperienceCategorySelection.getCategory(we.id)
        if (currentCategory && !filteredCategories.includes(currentCategory)) {
          // Find the first category that this work experience has which is in the filtered list
          const firstEligible = we.categories.find((c) =>
            filteredCategories.includes(c.category_name)
          )
          if (firstEligible) {
            workExperienceCategorySelection.setCategory(we.id, firstEligible.category_name)
          }
        }
      })
    }
  }, [workExperienceCategoryFilter.selectedCategories, workExperienceCategoryFilter.filteredWorkExperiences, workExperienceCategorySelection, workExperienceCategoryFilter.hasActiveFilters])

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

  // Get effective category for work experience (similar to project logic)
  const getEffectiveWorkExperienceCategory = useCallback((workExperience: WorkExperienceWithContent): string => {
    const selected = workExperienceCategorySelection.getCategory(workExperience.id)
    if (selected) return selected

    // If filtering is active and the default category isn't filtered, use first eligible
    if (workExperienceCategoryFilter.hasActiveFilters) {
      const filteredCategories = Array.from(workExperienceCategoryFilter.selectedCategories)
      const firstEligible = workExperience.categories.find((c) =>
        filteredCategories.includes(c.category_name)
      )
      return firstEligible?.category_name || workExperience.selectedCategory
    }

    return workExperience.selectedCategory
  }, [workExperienceCategorySelection, workExperienceCategoryFilter.hasActiveFilters, workExperienceCategoryFilter.selectedCategories])

  const viewingWorkExperienceCategory = viewingWorkExperience ? getEffectiveWorkExperienceCategory(viewingWorkExperience) : null

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
    }
  }

  // Handle archive toggle for work experiences
  const handleWorkExperienceArchiveToggle = async (workExperienceId: string) => {
    const workExperience = workExperiences.find((we) => we.id === workExperienceId)
    if (workExperience) {
      const newArchivedState = !workExperience.archived
      await toggleWorkExperienceArchived(workExperienceId, newArchivedState)

      // Optimistically update the local state
      setWorkExperiences((prev) =>
        prev.map((we) =>
          we.id === workExperienceId ? { ...we, archived: newArchivedState } : we
        )
      )
    }
  }

  // Handle opening the add entry modal
  const handleAddEntry = useCallback((section: "projects" | "work-experiences") => {
    setEditingEntrySection(section)
    setEntryModalMode("create")
    setEditingEntryId(null)
    setEntryModalOpen(true)
  }, [])

  // Handle opening the edit entry modal
  const handleEditEntry = useCallback((section: "projects" | "work-experiences", entryId: string) => {
    setEditingEntrySection(section)
    setEntryModalMode("edit")
    setEditingEntryId(entryId)
    setEntryModalOpen(true)
  }, [])

  // Handle saving an entry (create or update)
  const handleSaveEntry = useCallback(async (data: any) => {
    const section = editingEntrySection
    const operation = entryModalMode === "create" ? "create" : "update"

    const response = await fetch(`${API_BASE}/api/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section,
        operation,
        entryId: editingEntryId,
        data,
      }),
    })

    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.error || "Failed to save entry")
    }

    const result = await response.json()

    // Refetch data to update the grid
    if (section === "projects") {
      await refetchProjects()
    } else {
      await refetchWorkExperiences()
    }
  }, [editingEntrySection, entryModalMode, editingEntryId, refetchProjects, refetchWorkExperiences])

  // Handle deleting an entry
  const handleDeleteEntry = useCallback(async (section: "projects" | "work-experiences", entryId: string) => {
    if (!confirm("Are you sure you want to delete this entry? This action cannot be undone.")) {
      return
    }

    const response = await fetch(`${API_BASE}/api/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section,
        operation: "delete",
        entryId,
      }),
    })

    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.error || "Failed to delete entry")
    }

    // Refetch data to update the grid
    if (section === "projects") {
      await refetchProjects()
    } else {
      await refetchWorkExperiences()
    }
  }, [refetchProjects, refetchWorkExperiences])

  // Get initial data for editing an entry
  const getEditInitialData = useCallback((
    section: "projects" | "work-experiences",
    entryId: string
  ) => {
    if (section === "projects") {
      const project = projects.find((p) => p.id === entryId)
      if (!project) return undefined

      return {
        project_name: project.project_name,
        description: project.descriptionContent || "",
        github_url: project.github.url,
        github_commit_count: project.github.commit_count.toString(),
        categories: project.categories.map((c) => ({
          category_name: c.category_name,
          resume_points: project.resumePointsByCategory.get(c.category_name) || "",
        })),
      }
    } else {
      const workExperience = workExperiences.find((we) => we.id === entryId)
      if (!workExperience) return undefined

      return {
        company: workExperience.company,
        role: workExperience.role,
        location: workExperience.location || "",
        startDate: workExperience.startDate,
        endDate: workExperience.endDate || "",
        description: workExperience.descriptionContent || "",
        categories: workExperience.categories.map((c) => ({
          category_name: c.category_name,
          resume_points: workExperience.resumePointsByCategory.get(c.category_name) || "",
        })),
      }
    }
  }, [projects, workExperiences])

  const entryModalInitialData = editingEntryId && entryModalMode === "edit"
    ? getEditInitialData(editingEntrySection, editingEntryId)
    : undefined

  // Merge notes from both projects and work experiences
  const allNotes = useMemo(() => ({
    ...projectNotes.getAllNotes(),
    ...workExperienceNotes.getAllNotes(),
  }), [projectNotes, workExperienceNotes])

  // Get categories for selected projects (in order)
  const orderedSelectedProjectCategories = useMemo(() => {
    return projectSelection.orderedSelectedIds.map((id) => {
      const project = projects.find((p) => p.id === id)
      return project ? getEffectiveCategory(project) : projectFilter.allCategories[0] || ""
    })
  }, [projectSelection.orderedSelectedIds, projects, getEffectiveCategory, projectFilter.allCategories])

  // Get categories for selected work experiences (in order)
  const orderedSelectedWorkExperienceCategories = useMemo(() => {
    return workExperienceSelection.orderedSelectedIds.map((id) => {
      const workExperience = workExperiences.find((we) => we.id === id)
      return workExperience ? getEffectiveWorkExperienceCategory(workExperience) : workExperienceCategoryFilter.allCategories[0] || ""
    })
  }, [workExperienceSelection.orderedSelectedIds, workExperiences, getEffectiveWorkExperienceCategory, workExperienceCategoryFilter.allCategories])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar
        projectSelectedCount={projectSelection.selectedCount}
        workExperienceSelectedCount={workExperienceSelection.selectedCount}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        orderedSelectedProjectIds={projectSelection.orderedSelectedIds}
        orderedSelectedProjectCategories={orderedSelectedProjectCategories}
        orderedSelectedWorkExperienceIds={workExperienceSelection.orderedSelectedIds}
        orderedSelectedWorkExperienceCategories={orderedSelectedWorkExperienceCategories}
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
                onEdit={(id) => handleEditEntry("projects", id)}
                onDelete={(id) => handleDeleteEntry("projects", id)}
                onAddEntry={() => handleAddEntry("projects")}
                getCategory={getCategoryForProject}
                onCategoryChange={categorySelection.setCategory}
                filteredCategories={projectFilter.hasActiveFilters ? Array.from(projectFilter.selectedCategories) : undefined}
                showAddCard={projectArchiveFilter.archiveFilter !== "archived"}
              />
            </main>

            <SelectionPanel
              projects={projects}
              orderedSelectedProjectIds={projectSelection.orderedSelectedIds}
              onDeselectProject={projectSelection.deselect}
              onClearAllProjects={projectSelection.clearAll}
              onReorderProjects={projectSelection.reorder}
              workExperiences={workExperiences}
              orderedSelectedWorkExperienceIds={workExperienceSelection.orderedSelectedIds}
              onDeselectWorkExperience={workExperienceSelection.deselect}
              onClearAllWorkExperiences={workExperienceSelection.clearAll}
              onReorderWorkExperiences={workExperienceSelection.reorder}
            />
          </div>
        </>
      ) : (
        <>
          <WorkExperienceCategoryFilterBar
            allCategories={workExperienceCategoryFilter.allCategories}
            selectedCategories={workExperienceCategoryFilter.selectedCategories}
            onToggleCategory={workExperienceCategoryFilter.toggleCategory}
            onClearFilters={workExperienceCategoryFilter.clearFilters}
            onSelectAll={() =>
              workExperienceSelection.selectAll(workExperienceCategoryFilter.filteredWorkExperiences.map((we) => we.id))
            }
            filteredCount={workExperienceCategoryFilter.filteredWorkExperiences.length}
            totalCount={workExperienceArchiveFilter.filteredWorkExperiences.length}
            archiveFilter={workExperienceArchiveFilter.archiveFilter}
            onArchiveFilterChange={workExperienceArchiveFilter.setArchiveFilter}
          />

          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-auto p-6">
              <WorkExperienceGrid
                workExperiences={workExperienceCategoryFilter.filteredWorkExperiences}
                isSelected={workExperienceSelection.isSelected}
                getSelectionOrder={workExperienceSelection.getSelectionOrder}
                onToggle={workExperienceSelection.toggleSelection}
                getNote={workExperienceNotes.getNote}
                onNoteChange={(id, note) => workExperienceNotes.setNote(id, note)}
                onArchiveToggle={handleWorkExperienceArchiveToggle}
                onEdit={(id) => handleEditEntry("work-experiences", id)}
                onDelete={(id) => handleDeleteEntry("work-experiences", id)}
                onAddEntry={() => handleAddEntry("work-experiences")}
                selectedCategory={workExperienceCategorySelection.getCategory}
                onCategoryChange={workExperienceCategorySelection.setCategory}
                filteredCategories={workExperienceCategoryFilter.hasActiveFilters ? Array.from(workExperienceCategoryFilter.selectedCategories) : undefined}
                onViewDescription={setViewingWorkExperience}
                showAddCard={workExperienceArchiveFilter.archiveFilter !== "archived"}
              />
            </main>

            <SelectionPanel
              projects={projects}
              orderedSelectedProjectIds={projectSelection.orderedSelectedIds}
              onDeselectProject={projectSelection.deselect}
              onClearAllProjects={projectSelection.clearAll}
              onReorderProjects={projectSelection.reorder}
              workExperiences={workExperiences}
              orderedSelectedWorkExperienceIds={workExperienceSelection.orderedSelectedIds}
              onDeselectWorkExperience={workExperienceSelection.deselect}
              onClearAllWorkExperiences={workExperienceSelection.clearAll}
              onReorderWorkExperiences={workExperienceSelection.reorder}
            />
          </div>
        </>
      )}

      <DescriptionModal
        project={viewingProject}
        currentCategory={viewingProjectCategory}
        onClose={() => setViewingProject(null)}
      />

      <WorkExperienceDescriptionModal
        workExperience={viewingWorkExperience}
        currentCategory={viewingWorkExperienceCategory}
        onClose={() => setViewingWorkExperience(null)}
      />

      <EntryFormModal
        open={entryModalOpen}
        onOpenChange={setEntryModalOpen}
        section={editingEntrySection}
        mode={entryModalMode}
        initialData={entryModalInitialData}
        onSave={handleSaveEntry}
      />
    </div>
  )
}
