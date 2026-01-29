"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GitCommit, ExternalLink, FileText, Github, MoreVertical, Archive, ArchiveRestore, Check, ChevronDown, Edit, Trash2 } from "lucide-react"
import type { ProjectWithContent } from "@/types/project"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  project: ProjectWithContent
  isSelected: boolean
  selectionOrder: number | null
  onToggle: () => void
  onViewDescription: () => void
  note: string
  onNoteChange: (note: string) => void
  onArchiveToggle: () => void
  onEdit: () => void
  onDelete: () => void
  availableCategories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  filteredCategories?: string[]
}

export function ProjectCard({
  project,
  isSelected,
  selectionOrder,
  onToggle,
  onViewDescription,
  note,
  onNoteChange,
  onArchiveToggle,
  onEdit,
  onDelete,
  availableCategories,
  selectedCategory,
  onCategoryChange,
  filteredCategories,
}: ProjectCardProps) {
  const hasGitHub = project.github.url && project.github.commit_count > 0

  return (
    <Card
      className={cn(
        "w-[350px] flex flex-col h-[410px] transition-all",
        isSelected && "ring-2 ring-primary"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {selectionOrder !== null && (
              <Badge variant="default" className="shrink-0">
                {selectionOrder}
              </Badge>
            )}
            <CardTitle className="text-base font-semibold truncate">
              {project.project_name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Switch checked={isSelected} onCheckedChange={onToggle} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onArchiveToggle}>
                  {project.archived ? (
                    <>
                      <ArchiveRestore className="h-4 w-4 mr-2" />
                      Unarchive
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </>
                  )}
                </DropdownMenuItem>
                {project.archived && (
                  <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Notes Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Notes
          </label>
          <textarea
            className="w-full h-20 px-3 py-2 text-sm rounded-md border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Add your notes here..."
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
          />
        </div>

        {/* GitHub Section */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            GitHub
          </label>
          {hasGitHub ? (
            <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
              <div className="flex items-center gap-2 text-sm">
                <GitCommit className="h-4 w-4 text-muted-foreground" />
                <span>{project.github.commit_count} commits</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                asChild
              >
                <a
                  href={project.github.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-3.5 w-3.5 mr-1" />
                  View
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 text-sm text-muted-foreground">
              <Github className="h-4 w-4" />
              <span>Not on GitHub</span>
            </div>
          )}
        </div>

        {/* Description Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onViewDescription}
        >
          <FileText className="h-4 w-4 mr-2" />
          View Resume Points
        </Button>
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-muted-foreground">Category:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 justify-between">
                {selectedCategory}
                <ChevronDown className="h-3 w-3 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {availableCategories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  disabled={filteredCategories && !filteredCategories.includes(category)}
                >
                  <Check className={cn("mr-2 h-4 w-4", selectedCategory === category ? "opacity-100" : "opacity-0")} />
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  )
}
