"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileText, ChevronDown, Loader2, Check, AlertTriangle, Minimize2, Eye, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import { Document, Page as PDFPage, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/TextLayer.css"
import "react-pdf/dist/Page/AnnotationLayer.css"

// Configure PDF.js worker for Next.js
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`
}

interface PreviewPanelProps {
  selectedCount: number
  orderedSelectedProjectIds: string[]
  orderedSelectedProjectCategories: string[]
  orderedSelectedWorkExperienceIds: string[]
  orderedSelectedWorkExperienceCategories: string[]
}

function ResumePreviewModal({ open, onOpenChange, pdfUrl, numPages }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  pdfUrl: string | null
  numPages: number
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  // Reset current page when modal opens or PDF changes
  useEffect(() => {
    if (open) {
      setCurrentPage(1)
      setIsLoading(true)
    }
  }, [open, pdfUrl])

  const handlePdfLoadSuccess = () => {
    setIsLoading(false)
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, numPages))
  }

  const handleDownload = () => {
    if (!pdfUrl) return

    const a = document.createElement("a")
    a.href = pdfUrl
    a.download = "resume.pdf"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b pr-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <DialogTitle className="text-lg">Resume Preview</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              {numPages > 1 && (
                <div className="flex items-center gap-1 mr-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                    Page {currentPage} of {numPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={handleNextPage}
                    disabled={currentPage === numPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={handleDownload}
                disabled={!pdfUrl}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-auto p-4 bg-muted/20" style={{ maxHeight: "calc(90vh - 120px)" }}>
          {pdfUrl ? (
            <div className="flex justify-center">
              {isLoading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              <Document
                file={pdfUrl}
                onLoadSuccess={handlePdfLoadSuccess}
                loading={null}
                error={
                  <div className="flex flex-col items-center justify-center py-20 text-destructive">
                    <FileText className="h-12 w-12 mb-2" />
                    <p>Failed to load PDF preview</p>
                  </div>
                }
                className="shadow-lg"
              >
                <PDFPage
                  pageNumber={currentPage}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  width={Math.min(700, (typeof window !== 'undefined' ? window.innerWidth : 700) - 100)}
                  className="bg-background"
                />
              </Document>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <FileText className="h-12 w-12 mb-2 opacity-50" />
              <p>No PDF available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function PreviewPanel({
  selectedCount,
  orderedSelectedProjectIds,
  orderedSelectedProjectCategories,
  orderedSelectedWorkExperienceIds,
  orderedSelectedWorkExperienceCategories,
}: PreviewPanelProps) {
  // Space calculator state
  const [targetPages, setTargetPages] = useState(1)
  const [spaceResult, setSpaceResult] = useState<{
    status: 'fit' | 'overflow'
    true_max_space_pts: number
    shrink_used_pts: number
    page_count: number
    error?: string
  } | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const spaceDebounceRef = useRef<NodeJS.Timeout | null>(null)

  // PDF preview state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const pdfDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const objectUrlRef = [null as string | null, setPdfUrl] as const

  // Recalculate space whenever selections or target pages change
  useEffect(() => {
    // Clear previous debounce
    if (spaceDebounceRef.current) {
      clearTimeout(spaceDebounceRef.current)
    }

    // If no selections, reset result
    if (selectedCount === 0) {
      setSpaceResult(null)
      setIsCalculating(false)
      return
    }

    setIsCalculating(true)

    // Debounce the API call
    spaceDebounceRef.current = setTimeout(async () => {
      try {
        const result = await apiClient.calculateVerticalSpace({
          projectIds: orderedSelectedProjectIds,
          projectCategories: orderedSelectedProjectCategories,
          workExperienceIds: orderedSelectedWorkExperienceIds,
          workExperienceCategories: orderedSelectedWorkExperienceCategories,
          targetPages,
        })
        setSpaceResult(result)
      } catch (err) {
        setSpaceResult({
          status: 'overflow',
          true_max_space_pts: 0,
          shrink_used_pts: 0,
          page_count: 0,
          error: err instanceof Error ? err.message : 'Failed to calculate space',
        })
      } finally {
        setIsCalculating(false)
      }
    }, 300)

    return () => {
      if (spaceDebounceRef.current) {
        clearTimeout(spaceDebounceRef.current)
      }
    }
  }, [
    orderedSelectedProjectIds,
    orderedSelectedProjectCategories,
    orderedSelectedWorkExperienceIds,
    orderedSelectedWorkExperienceCategories,
    targetPages,
    selectedCount,
  ])

  // Generate PDF preview when selections change
  useEffect(() => {
    // Clear previous debounce
    if (pdfDebounceRef.current) {
      clearTimeout(pdfDebounceRef.current)
    }

    // Clean up previous object URL
    if (objectUrlRef[0]) {
      URL.revokeObjectURL(objectUrlRef[0])
      objectUrlRef[1](null)
    }

    // If no selections, reset
    if (selectedCount === 0) {
      setPdfUrl(null)
      setPdfError(null)
      setNumPages(0)
      return
    }

    setIsGeneratingPdf(true)
    setPdfError(null)

    // Debounce the PDF generation
    pdfDebounceRef.current = setTimeout(async () => {
      try {
        const pdfBlob = await apiClient.generateResume({
          format: 'pdf',
          projectIds: orderedSelectedProjectIds,
          projectCategories: orderedSelectedProjectCategories,
          workExperienceIds: orderedSelectedWorkExperienceIds,
          workExperienceCategories: orderedSelectedWorkExperienceCategories,
        }) as Blob

        const url = URL.createObjectURL(pdfBlob)
        objectUrlRef[1](url)
        setPdfError(null)
      } catch (err) {
        setPdfError(err instanceof Error ? err.message : 'Failed to generate preview')
        setPdfUrl(null)
      } finally {
        setIsGeneratingPdf(false)
      }
    }, 1000)

    return () => {
      if (pdfDebounceRef.current) {
        clearTimeout(pdfDebounceRef.current)
      }
      if (objectUrlRef[0]) {
        URL.revokeObjectURL(objectUrlRef[0])
      }
    }
  }, [
    orderedSelectedProjectIds,
    orderedSelectedProjectCategories,
    orderedSelectedWorkExperienceIds,
    orderedSelectedWorkExperienceCategories,
    selectedCount,
  ])

  const handlePdfLoadSuccess = ({ numPages: pages }: { numPages: number }) => {
    setNumPages(pages)
  }

  const handlePdfLoadError = () => {
    setPdfError('Failed to load PDF preview')
  }

  return (
    <>
      <aside className="w-80 border-l bg-muted/20 flex flex-col h-[calc(100vh-4rem-56px)] select-none">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h2 className="font-semibold">Preview</h2>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {selectedCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
              <FileText className="h-8 w-8 mb-2 opacity-50" />
              <p>No selections</p>
              <p className="text-xs mt-1">Select items to preview resume</p>
            </div>
          ) : (
            <div className="p-2 space-y-4">
              {/* Space Calculator Card */}
              <Card className="bg-muted/50">
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium">Resume Space</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                          {targetPages} {targetPages === 1 ? 'page' : 'pages'}
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {[1, 2, 3].map((pages) => (
                          <DropdownMenuItem
                            key={pages}
                            onClick={() => setTargetPages(pages)}
                            className="gap-2"
                          >
                            {targetPages === pages && <Check className="h-3 w-3" />}
                            <span className={targetPages !== pages ? "ml-5" : ""}>
                              {pages} {pages === 1 ? 'page' : 'pages'}
                            </span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  {isCalculating ? (
                    <div className="flex items-center justify-center py-2 gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-xs">Calculating...</span>
                    </div>
                  ) : spaceResult?.error ? (
                    <div className="flex items-center gap-2 text-destructive py-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs">{spaceResult.error}</span>
                    </div>
                  ) : spaceResult ? (
                    <div className="space-y-2">
                      <div className={cn(
                        "flex items-center justify-between p-2 rounded-md",
                        spaceResult.status === 'fit'
                          ? "bg-green-500/10 text-green-700 dark:text-green-400"
                          : "bg-red-500/10 text-red-700 dark:text-red-400"
                      )}>
                        <div className="flex items-center gap-2">
                          {spaceResult.status === 'fit' ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                          <span className="text-sm font-medium">
                            {spaceResult.status === 'fit' ? 'Fits' : 'Overflow'}
                          </span>
                        </div>
                        <span className="text-sm font-mono">
                          {`${Math.round(spaceResult.true_max_space_pts)} pt`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400">
                        <div className="flex items-center gap-2">
                          <Minimize2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Shrink used</span>
                        </div>
                        <span className="text-sm font-mono">
                          {`${Math.round(spaceResult.shrink_used_pts)} pt`}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Actual pages: {spaceResult.page_count}</span>
                        <span>Target: {targetPages}</span>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {/* PDF Preview Card */}
              <Card className="bg-muted/50">
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium">Resume Preview</CardTitle>
                    </div>
                    {numPages > 0 && (
                      <Badge variant="outline" className="h-5 px-1.5 text-xs">
                        {numPages} {numPages === 1 ? 'page' : 'pages'}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  {isGeneratingPdf ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-xs">Generating preview...</span>
                    </div>
                  ) : pdfError ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-destructive">
                      <AlertTriangle className="h-6 w-6" />
                      <span className="text-xs text-center">{pdfError}</span>
                    </div>
                  ) : pdfUrl ? (
                    <div
                      className="cursor-pointer group relative rounded-lg overflow-hidden border bg-background hover:border-ring transition-colors"
                      onClick={() => setPreviewModalOpen(true)}
                    >
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-background/90 rounded-full p-2 shadow-lg">
                          <Eye className="h-4 w-4" />
                        </div>
                      </div>
                      <Document
                        file={pdfUrl}
                        onLoadSuccess={handlePdfLoadSuccess}
                        onLoadError={handlePdfLoadError}
                        loading={<div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                        error={<div className="flex items-center justify-center py-8 text-destructive text-xs">Failed to load preview</div>}
                      >
                        <PDFPage
                          pageNumber={1}
                          width={280}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </Document>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8 opacity-50" />
                      <p className="text-xs">No preview available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </ScrollArea>

        {selectedCount > 0 && (
          <div className="p-3 border-t bg-background">
            <p className="text-xs text-muted-foreground text-center">
              Click preview to view full resume
            </p>
          </div>
        )}
      </aside>

      <ResumePreviewModal
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        pdfUrl={pdfUrl}
        numPages={numPages}
      />
    </>
  )
}
