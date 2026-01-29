"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckSquare, X, ChevronLeft, ChevronRight, Activity, Archive } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ArchiveFilter } from "@/hooks/useArchiveFilter"
import { useEffect, useRef, useState } from "react"

interface CategoryFilterBarProps {
  allCategories: string[]
  selectedCategories: Set<string>
  onToggleCategory: (category: string) => void
  onClearFilters: () => void
  onSelectAll: () => void
  filteredCount: number
  totalCount: number
  archiveFilter: ArchiveFilter
  onArchiveFilterChange: (filter: ArchiveFilter) => void
}

export function CategoryFilterBar({
  allCategories,
  selectedCategories,
  onToggleCategory,
  onClearFilters,
  onSelectAll,
  filteredCount,
  totalCount,
  archiveFilter,
  onArchiveFilterChange,
}: CategoryFilterBarProps) {
  const hasActiveFilters = selectedCategories.size > 0
  const displayCategories = allCategories

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  // Check if arrows should be shown based on scroll position
  const checkArrowVisibility = () => {
    const container = scrollContainerRef.current
    if (!container) return

    setShowLeftArrow(container.scrollLeft > 0)
    setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth)
  }

  // Set up scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // Initial check
    checkArrowVisibility()

    // Add resize observer to handle window resize
    const resizeObserver = new ResizeObserver(() => {
      checkArrowVisibility()
    })
    resizeObserver.observe(container)

    container.addEventListener("scroll", checkArrowVisibility)

    return () => {
      resizeObserver.disconnect()
      container.removeEventListener("scroll", checkArrowVisibility)
    }
  }, [displayCategories.length])

  const handleArchiveFilterChange = (filter: ArchiveFilter) => {
    onArchiveFilterChange(filter)
    // Clear category filters when switching between Active/Archived
    if (hasActiveFilters) {
      onClearFilters()
    }
  }

  const handleToggleArchive = () => {
    handleArchiveFilterChange(archiveFilter === "active" ? "archived" : "active")
  }

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200 // pixels to scroll
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4 border-b bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-sm font-medium shrink-0">Filters</span>
          <div className="h-4 w-px bg-border shrink-0" />
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2 shrink-0"
            onClick={handleToggleArchive}
          >
            <Activity
              className={cn(
                "h-4 w-4 transition-colors",
                archiveFilter === "active" ? "text-foreground" : "text-muted-foreground"
              )}
            />
            <div className="h-4 w-px bg-border" />
            <Archive
              className={cn(
                "h-4 w-4 transition-colors",
                archiveFilter === "archived" ? "text-foreground" : "text-muted-foreground"
              )}
            />
          </Button>

          {/* Category Filters - horizontally scrollable */}
          {displayCategories.length > 0 && (
            <>
              <div className="h-4 w-px bg-border shrink-0" />
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {showLeftArrow && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 shrink-0"
                    onClick={() => handleScroll("left")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                <div
                  ref={scrollContainerRef}
                  className="flex items-center gap-2 overflow-x-auto scrollbar-hide"
                  style={{
                    scrollbarWidth: "none", // Firefox
                    msOverflowStyle: "none", // IE/Edge
                  }}
                  onScroll={checkArrowVisibility}
                >
                  {displayCategories.map((category) => {
                    const isSelected = selectedCategories.has(category)
                    return (
                      <Badge
                        key={category}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-colors shrink-0",
                          !isSelected && "hover:bg-secondary"
                        )}
                        onClick={() => onToggleCategory(category)}
                      >
                        {category}
                      </Badge>
                    )
                  })}
                </div>
                {showRightArrow && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 shrink-0"
                    onClick={() => handleScroll("right")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </>
          )}

          {hasActiveFilters && (
            <>
              <div className="h-4 w-px bg-border shrink-0" />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs shrink-0"
                onClick={onClearFilters}
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Showing {filteredCount} of {totalCount} projects
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 whitespace-nowrap"
            onClick={onSelectAll}
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Select All Visible
          </Button>
        </div>
      </div>
    </div>
  )
}
