"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckSquare, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ArchiveFilter } from "@/hooks/useArchiveFilter"

interface TagFilterBarProps {
  allTags: string[]
  selectedTags: Set<string>
  onToggleTag: (tag: string) => void
  onClearFilters: () => void
  onSelectAll: () => void
  filteredCount: number
  totalCount: number
  archiveFilter: ArchiveFilter
  onArchiveFilterChange: (filter: ArchiveFilter) => void
}

export function TagFilterBar({
  allTags,
  selectedTags,
  onToggleTag,
  onClearFilters,
  onSelectAll,
  filteredCount,
  totalCount,
  archiveFilter,
  onArchiveFilterChange,
}: TagFilterBarProps) {
  const hasActiveFilters = selectedTags.size > 0
  const displayTags = allTags

  const handleArchiveFilterChange = (filter: ArchiveFilter) => {
    onArchiveFilterChange(filter)
    // Clear tag filters when switching between Active/Archived
    if (hasActiveFilters) {
      onClearFilters()
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4 border-b bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Filters</span>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Badge
              variant={archiveFilter === "active" ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors",
                archiveFilter !== "active" && "hover:bg-secondary"
              )}
              onClick={() => handleArchiveFilterChange("active")}
            >
              Active
            </Badge>
            <Badge
              variant={archiveFilter === "archived" ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors",
                archiveFilter !== "archived" && "hover:bg-secondary"
              )}
              onClick={() => handleArchiveFilterChange("archived")}
            >
              Archived
            </Badge>
          </div>
          {hasActiveFilters && (
            <>
              <div className="h-4 w-px bg-border" />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={onClearFilters}
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Showing {filteredCount} of {totalCount} projects
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={onSelectAll}
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Select All Visible
          </Button>
        </div>
      </div>

      {/* Tag Filters */}
      {displayTags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {displayTags.map((tag) => {
            const isSelected = selectedTags.has(tag)
            return (
              <Badge
                key={tag}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors",
                  !isSelected && "hover:bg-secondary"
                )}
                onClick={() => onToggleTag(tag)}
              >
                {tag}
              </Badge>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No tags available for filtering.
        </p>
      )}
    </div>
  )
}
