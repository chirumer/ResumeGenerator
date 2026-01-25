"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { FileDown, FileText, FileSpreadsheet, ChevronDown, Loader2 } from "lucide-react"
import { getAllGenerators, type ExportFormat } from "@/services/resumeGenerator"

interface ExportMenuProps {
  selectedCount: number
  orderedSelectedProjectIds: string[]
  orderedSelectedWorkExperienceIds: string[]
  notes: Record<string, string>
}

export function ExportMenu({
  selectedCount,
  orderedSelectedProjectIds,
  orderedSelectedWorkExperienceIds,
  notes,
}: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false)
  const generators = getAllGenerators()

  const handleExport = async (format: ExportFormat) => {
    if (selectedCount === 0) return

    setIsExporting(true)
    try {
      const response = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          projectIds: orderedSelectedProjectIds,
          workExperienceIds: orderedSelectedWorkExperienceIds,
          notes,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Export failed")
      }

      // Download the PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `resume-${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export error:", error)
      alert(error instanceof Error ? error.message : "Export failed")
    } finally {
      setIsExporting(false)
    }
  }

  const getIcon = (format: ExportFormat) => {
    switch (format) {
      case "pdf":
        return <FileDown className="h-4 w-4 mr-2" />
      case "gdocs":
        return <FileText className="h-4 w-4 mr-2" />
      case "docx":
        return <FileSpreadsheet className="h-4 w-4 mr-2" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={selectedCount === 0 || isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4 mr-2" />
          )}
          Generate Resume
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {generators.map(({ format, generator }) => (
          <DropdownMenuItem
            key={format}
            disabled={!generator.isEnabled}
            onClick={() => generator.isEnabled && handleExport(format)}
            className="cursor-pointer"
          >
            {getIcon(format)}
            {generator.formatName}
            {!generator.isEnabled && (
              <span className="ml-auto text-xs text-muted-foreground">
                Coming soon
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
