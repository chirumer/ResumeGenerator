"use client"

import { Plus } from "lucide-react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AddEntryCardProps {
  section: "projects" | "work-experiences"
  onClick: () => void
  className?: string
}

export function AddEntryCard({ section, onClick, className }: AddEntryCardProps) {
  const label = section === "projects" ? "Add Project" : "Add Work Experience"
  const cardHeight = section === "projects" ? "h-[410px]" : "h-[480px]"

  return (
    <Card
      className={cn(
        `w-[350px] flex flex-col ${cardHeight} transition-all hover:border-primary hover:bg-accent/50 border-2 border-dashed cursor-pointer`,
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1" />
          <div className="flex items-center gap-1">
            {/* Empty space to match Switch + MoreVertical button */}
            <div className="h-5 w-9" />
            <div className="h-8 w-8" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Plus className="h-6 w-6" />
          </div>
          <span className="font-medium">{label}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex items-center gap-2 w-full">
          {/* Empty space to match Category dropdown */}
          <span className="text-xs text-muted-foreground/0">.</span>
        </div>
      </CardFooter>
    </Card>
  )
}
