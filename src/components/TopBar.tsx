"use client"

import { ExportMenu } from "./ExportMenu"
import { FileText, ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TopBarProps {
  selectedCount: number
  orderedSelectedIds: string[]
  notes: Record<string, string>
}

export function TopBar({
  selectedCount,
  orderedSelectedIds,
  notes,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-xl font-semibold">Resume Generator</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShoppingCart className="h-4 w-4" />
            <span>Selected:</span>
            <Badge variant={selectedCount > 0 ? "default" : "secondary"}>
              {selectedCount}
            </Badge>
          </div>

          <ExportMenu
            selectedCount={selectedCount}
            orderedSelectedIds={orderedSelectedIds}
            notes={notes}
          />
        </div>
      </div>
    </header>
  )
}
