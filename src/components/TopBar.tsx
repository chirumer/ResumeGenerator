"use client"

import { ExportMenu } from "./ExportMenu"
import { FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TopBarProps {
  projectSelectedCount: number
  workExperienceSelectedCount: number
  activeTab: 'projects' | 'work-experiences'
  onTabChange: (tab: 'projects' | 'work-experiences') => void
  orderedSelectedProjectIds: string[]
  orderedSelectedWorkExperienceIds: string[]
  notes: Record<string, string>
}

export function TopBar({
  projectSelectedCount,
  workExperienceSelectedCount,
  activeTab,
  onTabChange,
  orderedSelectedProjectIds,
  orderedSelectedWorkExperienceIds,
  notes,
}: TopBarProps) {
  const totalSelected = projectSelectedCount + workExperienceSelectedCount

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Resume Generator</h1>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onTabChange('projects')}
              className={cn(
                "relative px-4 py-2 text-sm font-medium transition-colors",
                "hover:text-foreground/80",
                activeTab === 'projects'
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Projects
              {activeTab === 'projects' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
              )}
            </button>
            <button
              onClick={() => onTabChange('work-experiences')}
              className={cn(
                "relative px-4 py-2 text-sm font-medium transition-colors",
                "hover:text-foreground/80",
                activeTab === 'work-experiences'
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Work Experiences
              {activeTab === 'work-experiences' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>Projects:</span>
              <Badge variant={projectSelectedCount > 0 ? 'default' : 'secondary'}>
                {projectSelectedCount}
              </Badge>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1">
              <span>Work:</span>
              <Badge variant={workExperienceSelectedCount > 0 ? 'default' : 'secondary'}>
                {workExperienceSelectedCount}
              </Badge>
            </div>
          </div>

          <ExportMenu
            selectedCount={totalSelected}
            orderedSelectedProjectIds={orderedSelectedProjectIds}
            orderedSelectedWorkExperienceIds={orderedSelectedWorkExperienceIds}
            notes={notes}
          />
        </div>
      </div>
    </header>
  )
}
