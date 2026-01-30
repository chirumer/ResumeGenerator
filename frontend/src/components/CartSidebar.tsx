"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { X, Trash2, GripVertical, ShoppingCart } from "lucide-react"
import type { ProjectWithContent } from "@/types/project"
import { cn } from "@/lib/utils"

interface CartSidebarProps {
  projects: ProjectWithContent[]
  orderedSelectedIds: string[]
  onDeselect: (id: string) => void
  onClearAll: () => void
}

export function CartSidebar({
  projects,
  orderedSelectedIds,
  onDeselect,
  onClearAll,
}: CartSidebarProps) {
  // Create a map for quick project lookup
  const projectMap = new Map(projects.map((p) => [p.id, p]))

  // Get selected projects in order
  const selectedProjects = orderedSelectedIds
    .map((id) => projectMap.get(id))
    .filter((p): p is ProjectWithContent => p !== undefined)

  return (
    <aside className="w-80 border-l bg-muted/20 flex flex-col h-[calc(100vh-4rem)]">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <h2 className="font-semibold">Selected Projects</h2>
          <Badge variant="secondary">{selectedProjects.length}</Badge>
        </div>
        {selectedProjects.length > 0 && (
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
        {selectedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
            <ShoppingCart className="h-8 w-8 mb-2 opacity-50" />
            <p>No projects selected</p>
            <p className="text-xs mt-1">Click cards to add them</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {selectedProjects.map((project, index) => (
              <div
                key={project.id}
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
                <span className="flex-1 text-sm truncate" title={project.project_name}>
                  {project.project_name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={() => onDeselect(project.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {selectedProjects.length > 0 && (
        <div className="p-4 border-t bg-background">
          <p className="text-xs text-muted-foreground text-center">
            Projects will appear in resume in this order
          </p>
        </div>
      )}
    </aside>
  )
}
