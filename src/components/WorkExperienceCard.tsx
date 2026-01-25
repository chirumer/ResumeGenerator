"use client"

import type { WorkExperienceWithContent } from "@/types/workExperience"

interface WorkExperienceCardProps {
  workExperience: WorkExperienceWithContent
  isSelected: boolean
  selectionOrder: number | null
  onToggle: () => void
  note: string
  onNoteChange: (note: string) => void
  onArchiveToggle: () => void
}

// Empty placeholder for work experience card
// This will be implemented when work experience data is added
export function WorkExperienceCard({
  workExperience,
  isSelected,
  selectionOrder,
  onToggle,
  note,
  onNoteChange,
  onArchiveToggle,
}: WorkExperienceCardProps) {
  return (
    <div className="p-6 border rounded-lg bg-muted/20">
      <p className="text-sm text-muted-foreground">
        Work experience card placeholder
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        ID: {workExperience.id}
      </p>
    </div>
  )
}
