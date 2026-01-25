"use client"

import { Button } from "@/components/ui/button"
import { CheckSquare } from "lucide-react"
import type { WorkExperienceArchiveFilter } from "@/hooks/useWorkExperienceArchiveFilter"

interface WorkExperienceFilterBarProps {
  allTags: string[]
  selectedTags: Set<string>
  onToggleTag: (tag: string) => void
  onClearFilters: () => void
  onSelectAll: () => void
  filteredCount: number
  totalCount: number
  archiveFilter: WorkExperienceArchiveFilter
  onArchiveFilterChange: (filter: WorkExperienceArchiveFilter) => void
}

export function WorkExperienceFilterBar({
  onSelectAll,
  filteredCount,
}: WorkExperienceFilterBarProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-muted/30">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Filters</span>
        <span className="text-sm text-muted-foreground">
          — Filtering not yet implemented for work experiences
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {filteredCount} work experiences
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={onSelectAll}
        >
          <CheckSquare className="h-4 w-4 mr-2" />
          Select All
        </Button>
      </div>
    </div>
  )
}
