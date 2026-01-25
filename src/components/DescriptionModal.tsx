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
import { GitCommit, ExternalLink, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ProjectWithContent } from "@/types/project"

interface DescriptionModalProps {
  project: ProjectWithContent | null
  onClose: () => void
}

export function DescriptionModal({ project, onClose }: DescriptionModalProps) {
  if (!project) return null

  const hasGitHub = project.github.url && project.github.commit_count > 0

  return (
    <Dialog open={!!project} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {project.project_name}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {hasGitHub && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <GitCommit className="h-4 w-4" />
                  <span>{project.github.commit_count} commits</span>
                  <Button variant="link" size="sm" className="h-auto p-0 ml-1" asChild>
                    <a
                      href={project.github.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <Github className="h-3.5 w-3.5" />
                      View Repo
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {project.descriptionContent || "No description available."}
            </div>
          </div>
        </ScrollArea>

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-4 border-t">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
