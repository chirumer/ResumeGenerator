"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { X, Trash2, GripVertical, ShoppingCart } from "lucide-react"
import type { WorkExperienceWithContent } from "@/types/workExperience"
import { cn } from "@/lib/utils"

interface WorkExperienceCartSidebarProps {
  workExperiences: WorkExperienceWithContent[]
  orderedSelectedIds: string[]
  onDeselect: (id: string) => void
  onClearAll: () => void
}

export function WorkExperienceCartSidebar({
  workExperiences,
  orderedSelectedIds,
  onDeselect,
  onClearAll,
}: WorkExperienceCartSidebarProps) {
  // Create a map for quick work experience lookup
  const workExperienceMap = new Map(workExperiences.map((we) => [we.id, we]))

  // Get selected work experiences in order
  const selectedWorkExperiences = orderedSelectedIds
    .map((id) => workExperienceMap.get(id))
    .filter((we): we is WorkExperienceWithContent => we !== undefined)

  return (
    <aside className="w-80 border-l bg-muted/20 flex flex-col h-[calc(100vh-4rem)]">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <h2 className="font-semibold">Selected Work Experiences</h2>
          <Badge variant="secondary">{selectedWorkExperiences.length}</Badge>
        </div>
        {selectedWorkExperiences.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-destructive hover:text-destructive"
            onClick={onClearAll}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        {selectedWorkExperiences.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
            <ShoppingCart className="h-8 w-8 mb-2 opacity-50" />
            <p>No work experiences selected</p>
            <p className="text-xs mt-1">Click cards to add them</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {selectedWorkExperiences.map((workExperience, index) => (
              <div
                key={workExperience.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md bg-background border",
                  "hover:bg-accent/50 transition-colors group"
                )}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
                <Badge
                  variant="outline"
                  className="shrink-0 w-6 h-6 p-0 flex items-center justify-center text-xs"
                >
                  {index + 1}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" title={`${workExperience.company} - ${workExperience.role}`}>
                    {workExperience.company}
                  </p>
                  <p className="text-xs text-muted-foreground truncate" title={workExperience.role}>
                    {workExperience.role}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={() => onDeselect(workExperience.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {selectedWorkExperiences.length > 0 && (
        <div className="p-4 border-t bg-background">
          <p className="text-xs text-muted-foreground text-center">
            Work experiences will appear in resume in this order
          </p>
        </div>
      )}
    </aside>
  )
}
