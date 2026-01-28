"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Calendar, Building2 } from "lucide-react"
import type { WorkExperienceWithContent } from "@/types/workExperience"

interface WorkExperienceDescriptionModalProps {
  workExperience: WorkExperienceWithContent | null
  currentCategory: string | null
  onClose: () => void
}

export function WorkExperienceDescriptionModal({
  workExperience,
  currentCategory,
  onClose,
}: WorkExperienceDescriptionModalProps) {
  if (!workExperience) return null

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Present"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" })
  }

  const dateRange = `${formatDate(workExperience.startDate)} - ${formatDate(workExperience.endDate || null)}`
  const categoryToShow = currentCategory || workExperience.selectedCategory
  const resumePointsContent = workExperience.resumePointsByCategory.get(categoryToShow) || ""

  return (
    <Dialog open={!!workExperience} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {workExperience.company}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{workExperience.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{dateRange}</span>
              </div>
              <Badge variant="secondary" className="w-fit">
                {categoryToShow}
              </Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {resumePointsContent || "No resume points available for this category."}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
