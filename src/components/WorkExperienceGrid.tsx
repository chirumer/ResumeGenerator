"use client"

import { Briefcase } from "lucide-react"
import { WorkExperienceCard } from "./WorkExperienceCard"
import type { WorkExperienceWithContent } from "@/types/workExperience"

interface WorkExperienceGridProps {
  workExperiences: WorkExperienceWithContent[]
  isSelected: (id: string) => boolean
  getSelectionOrder: (id: string) => number | null
  onToggle: (id: string) => void
  getNote: (id: string) => string
  onNoteChange: (id: string, note: string) => void
  onArchiveToggle: (id: string) => void
}

export function WorkExperienceGrid({
  workExperiences,
  isSelected,
  getSelectionOrder,
  onToggle,
  getNote,
  onNoteChange,
  onArchiveToggle,
}: WorkExperienceGridProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        />
      ))}
    </div>
  )
}
