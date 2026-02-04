"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { X, Trash2, GripVertical, ListOrdered, Briefcase, FolderKanban } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { ProjectWithContent } from "@/types/project"
import type { WorkExperienceWithContent } from "@/types/workExperience"
import { cn } from "@/lib/utils"

interface SelectionPanelProps {
  projects: ProjectWithContent[]
  orderedSelectedProjectIds: string[]
  orderedSelectedProjectCategories: string[]
  onDeselectProject: (id: string) => void
  onClearAllProjects: () => void
  onReorderProjects: (fromIndex: number, toIndex: number) => void

  workExperiences: WorkExperienceWithContent[]
  orderedSelectedWorkExperienceIds: string[]
  orderedSelectedWorkExperienceCategories: string[]
  onDeselectWorkExperience: (id: string) => void
  onClearAllWorkExperiences: () => void
  onReorderWorkExperiences: (fromIndex: number, toIndex: number) => void
}

interface SortableWorkExperienceItemProps {
  workExperience: WorkExperienceWithContent
  index: number
  onDeselect: (id: string) => void
}

function SortableWorkExperienceItem({ workExperience, index, onDeselect }: SortableWorkExperienceItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: workExperience.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group",
        isDragging && "opacity-50"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-md bg-background border",
          "hover:bg-accent/50 transition-colors"
        )}
      >
        <div
          className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing flex items-center justify-center"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 pointer-events-none" />
        </div>
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
          onClick={(e) => {
            e.stopPropagation()
            onDeselect(workExperience.id)
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

interface SortableProjectItemProps {
  project: ProjectWithContent
  index: number
  onDeselect: (id: string) => void
}

function SortableProjectItem({ project, index, onDeselect }: SortableProjectItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group",
        isDragging && "opacity-50"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-md bg-background border",
          "hover:bg-accent/50 transition-colors"
        )}
      >
        <div
          className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing flex items-center justify-center"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 pointer-events-none" />
        </div>
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
          onClick={(e) => {
            e.stopPropagation()
            onDeselect(project.id)
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

export function SelectionPanel({
  projects,
  orderedSelectedProjectIds,
  orderedSelectedProjectCategories,
  onDeselectProject,
  onClearAllProjects,
  onReorderProjects,
  workExperiences,
  orderedSelectedWorkExperienceIds,
  orderedSelectedWorkExperienceCategories,
  onDeselectWorkExperience,
  onClearAllWorkExperiences,
  onReorderWorkExperiences,
}: SelectionPanelProps) {
  const projectMap = new Map(projects.map((p) => [p.id, p]))
  const workExperienceMap = new Map(workExperiences.map((we) => [we.id, we]))

  const selectedProjects = orderedSelectedProjectIds
    .map((id) => projectMap.get(id))
    .filter((p): p is ProjectWithContent => p !== undefined)

  const selectedWorkExperiences = orderedSelectedWorkExperienceIds
    .map((id) => workExperienceMap.get(id))
    .filter((we): we is WorkExperienceWithContent => we !== undefined)

  const totalSelected = selectedProjects.length + selectedWorkExperiences.length

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleProjectDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = orderedSelectedProjectIds.indexOf(active.id as string)
      const newIndex = orderedSelectedProjectIds.indexOf(over.id as string)

      onReorderProjects(oldIndex, newIndex)
    }
  }

  const handleWorkExperienceDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = orderedSelectedWorkExperienceIds.indexOf(active.id as string)
      const newIndex = orderedSelectedWorkExperienceIds.indexOf(over.id as string)

      onReorderWorkExperiences(oldIndex, newIndex)
    }
  }

  return (
    <aside className="w-80 border-l bg-muted/20 flex flex-col h-[calc(100vh-4rem-56px)] select-none">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListOrdered className="h-5 w-5" />
          <h2 className="font-semibold">Selection</h2>
          <Badge variant="secondary">{totalSelected}</Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {totalSelected === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
            <ListOrdered className="h-8 w-8 mb-2 opacity-50" />
            <p>No selections</p>
            <p className="text-xs mt-1">Click cards to add them</p>
          </div>
        ) : (
          <div className="p-2 space-y-4">
            {/* Work Experiences Section */}
            {selectedWorkExperiences.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-2 mb-2">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>Work Experiences</span>
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {selectedWorkExperiences.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={onClearAllWorkExperiences}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
                <div className="space-y-1">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleWorkExperienceDragEnd}
                  >
                    <SortableContext
                      items={orderedSelectedWorkExperienceIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {selectedWorkExperiences.map((workExperience, index) => (
                        <SortableWorkExperienceItem
                          key={workExperience.id}
                          workExperience={workExperience}
                          index={index}
                          onDeselect={onDeselectWorkExperience}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            )}

            {/* Projects Section */}
            {selectedProjects.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-2 mb-2">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <FolderKanban className="h-4 w-4" />
                    <span>Projects</span>
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {selectedProjects.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={onClearAllProjects}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
                <div className="space-y-1">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleProjectDragEnd}
                  >
                    <SortableContext
                      items={orderedSelectedProjectIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {selectedProjects.map((project, index) => (
                        <SortableProjectItem
                          key={project.id}
                          project={project}
                          index={index}
                          onDeselect={onDeselectProject}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {totalSelected > 0 && (
        <div className="p-3 border-t bg-background">
          <p className="text-xs text-muted-foreground text-center">
            Drag to reorder • Selection order will appear in resume
          </p>
        </div>
      )}
    </aside>
  )
}
