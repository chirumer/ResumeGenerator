"use client"

import { useMemo, useCallback } from "react"
import { Briefcase } from "lucide-react"
import { WorkExperienceCard } from "./WorkExperienceCard"
import { AddEntryCard } from "./AddEntryCard"
import type { WorkExperienceWithContent } from "@/types/workExperience"

interface WorkExperienceGridProps {
  workExperiences: WorkExperienceWithContent[]
  isSelected: (id: string) => boolean
  getSelectionOrder: (id: string) => number | null
  onToggle: (id: string) => void
  getNote: (id: string) => string
  onNoteChange: (id: string, note: string) => void
  onArchiveToggle: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onAddEntry: () => void
  selectedCategory: (id: string) => string | null
  onCategoryChange: (id: string, category: string) => void
  filteredCategories?: string[]
  onViewDescription: (workExperience: WorkExperienceWithContent) => void
  showAddCard?: boolean
}

export function WorkExperienceGrid({
  workExperiences,
  isSelected,
  getSelectionOrder,
  onToggle,
  getNote,
  onNoteChange,
  onArchiveToggle,
  onEdit,
  onDelete,
  onAddEntry,
  selectedCategory,
  onCategoryChange,
  filteredCategories,
  onViewDescription,
  showAddCard = false,
}: WorkExperienceGridProps) {
  // Get effective category for a work experience (similar to project logic)
  const getEffectiveCategory = useCallback((workExperience: WorkExperienceWithContent): string => {
    const selected = selectedCategory(workExperience.id)
    if (selected) return selected

    // If filtering is active and the default category isn't filtered, use first eligible
    if (filteredCategories) {
      const firstEligible = workExperience.categories.find((c) =>
        filteredCategories.includes(c.category_name)
      )
      return firstEligible?.category_name || workExperience.selectedCategory
    }

    return workExperience.selectedCategory
  }, [selectedCategory, filteredCategories])

  if (workExperiences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Briefcase className="h-16 w-16 mb-4 opacity-30" />
        <p className="text-lg font-medium">No work experiences yet</p>
        <p className="text-sm mt-2 opacity-70">Work experiences will appear here once added</p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {showAddCard && (
        <AddEntryCard section="work-experiences" onClick={onAddEntry} />
      )}
      {workExperiences.map((workExperience) => (
        <WorkExperienceCard
          key={workExperience.id}
          workExperience={workExperience}
          isSelected={isSelected(workExperience.id)}
          selectionOrder={getSelectionOrder(workExperience.id)}
          onToggle={() => onToggle(workExperience.id)}
          note={getNote(workExperience.id)}
          onNoteChange={(note) => onNoteChange(workExperience.id, note)}
          onArchiveToggle={() => onArchiveToggle(workExperience.id)}
          onEdit={() => onEdit(workExperience.id)}
          onDelete={() => onDelete(workExperience.id)}
          availableCategories={workExperience.categories.map(c => c.category_name)}
          selectedCategory={getEffectiveCategory(workExperience)}
          onCategoryChange={(category) => onCategoryChange(workExperience.id, category)}
          filteredCategories={filteredCategories}
          onViewDescription={() => onViewDescription(workExperience)}
        />
      ))}
    </div>
  )
}
