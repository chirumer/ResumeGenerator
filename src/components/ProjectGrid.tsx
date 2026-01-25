"use client"

import { ProjectCard } from "./ProjectCard"
import type { ProjectWithContent } from "@/types/project"

interface ProjectGridProps {
  projects: ProjectWithContent[]
  isSelected: (id: string) => boolean
  getSelectionOrder: (id: string) => number | null
  onToggle: (id: string) => void
  onViewDescription: (project: ProjectWithContent) => void
  getNote: (id: string) => string
  onNoteChange: (id: string, note: string) => void
  onArchiveToggle: (id: string) => void
  getCategory: (id: string) => string | null
  onCategoryChange: (id: string, category: string) => void
  filteredCategories?: string[]
}

export function ProjectGrid({
  projects,
  isSelected,
  getSelectionOrder,
  onToggle,
  onViewDescription,
  getNote,
  onNoteChange,
  onArchiveToggle,
  getCategory,
  onCategoryChange,
  filteredCategories,
}: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No projects found matching your filters.
      </div>
    )
  }

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          isSelected={isSelected(project.id)}
          selectionOrder={getSelectionOrder(project.id)}
          onToggle={() => onToggle(project.id)}
          onViewDescription={() => onViewDescription(project)}
          note={getNote(project.id)}
          onNoteChange={(note) => onNoteChange(project.id, note)}
          onArchiveToggle={() => onArchiveToggle(project.id)}
          availableCategories={project.categories.map(c => c.category_name)}
          selectedCategory={getCategory(project.id) || project.selectedCategory}
          onCategoryChange={(category) => onCategoryChange(project.id, category)}
          filteredCategories={filteredCategories}
        />
      ))}
    </div>
  )
}
