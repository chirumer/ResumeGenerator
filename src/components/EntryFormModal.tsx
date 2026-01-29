"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash2, Calendar, MapPin, Github } from "lucide-react"
import { cn } from "@/lib/utils"

// Types for form data
interface CategoryInput {
  category_name: string
  resume_points: string
}

interface ProjectFormData {
  project_name: string
  description: string
  github_url: string
  github_commit_count: string
  categories: CategoryInput[]
}

interface WorkExperienceFormData {
  company: string
  role: string
  location: string
  startDate: string
  endDate: string
  description: string
  categories: CategoryInput[]
}

interface EntryFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  section: "projects" | "work-experiences"
  mode: "create" | "edit"
  initialData?: ProjectFormData | WorkExperienceFormData
  onSave: (data: any) => Promise<void>
}

export function EntryFormModal({
  open,
  onOpenChange,
  section,
  mode,
  initialData,
  onSave,
}: EntryFormModalProps) {
  const [step, setStep] = useState<"form" | "confirm">("form")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Project form state
  const [projectData, setProjectData] = useState<ProjectFormData>({
    project_name: "",
    description: "",
    github_url: "",
    github_commit_count: "0",
    categories: [{ category_name: "", resume_points: "" }],
  })

  // Work experience form state
  const [workExperienceData, setWorkExperienceData] = useState<WorkExperienceFormData>({
    company: "",
    role: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
    categories: [{ category_name: "", resume_points: "" }],
  })

  // Initialize with data when editing
  useEffect(() => {
    if (open && mode === "edit" && initialData) {
      if (section === "projects") {
        const data = initialData as ProjectFormData
        setProjectData({
          project_name: data.project_name,
          description: data.description,
          github_url: data.github_url,
          github_commit_count: data.github_commit_count,
          categories: data.categories.length > 0 ? data.categories : [{ category_name: "", resume_points: "" }],
        })
      } else {
        const data = initialData as WorkExperienceFormData
        setWorkExperienceData({
          company: data.company,
          role: data.role,
          location: data.location || "",
          startDate: data.startDate,
          endDate: data.endDate || "",
          description: data.description,
          categories: data.categories.length > 0 ? data.categories : [{ category_name: "", resume_points: "" }],
        })
      }
      setStep("form")
    } else if (open && mode === "create") {
      // Reset form for create mode
      setProjectData({
        project_name: "",
        description: "",
        github_url: "",
        github_commit_count: "0",
        categories: [{ category_name: "", resume_points: "" }],
      })
      setWorkExperienceData({
        company: "",
        role: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
        categories: [{ category_name: "", resume_points: "" }],
      })
      setStep("form")
    }
    setError(null)
  }, [open, mode, initialData, section])

  const handleAddCategory = () => {
    const newCategory: CategoryInput = { category_name: "", resume_points: "" }
    if (section === "projects") {
      setProjectData({ ...projectData, categories: [...projectData.categories, newCategory] })
    } else {
      setWorkExperienceData({ ...workExperienceData, categories: [...workExperienceData.categories, newCategory] })
    }
  }

  const handleRemoveCategory = (index: number) => {
    if (section === "projects") {
      const newCategories = projectData.categories.filter((_, i) => i !== index)
      setProjectData({ ...projectData, categories: newCategories.length > 0 ? newCategories : [{ category_name: "", resume_points: "" }] })
    } else {
      const newCategories = workExperienceData.categories.filter((_, i) => i !== index)
      setWorkExperienceData({ ...workExperienceData, categories: newCategories.length > 0 ? newCategories : [{ category_name: "", resume_points: "" }] })
    }
  }

  const handleCategoryChange = (index: number, field: keyof CategoryInput, value: string) => {
    if (section === "projects") {
      const newCategories = [...projectData.categories]
      newCategories[index] = { ...newCategories[index], [field]: value }
      setProjectData({ ...projectData, categories: newCategories })
    } else {
      const newCategories = [...workExperienceData.categories]
      newCategories[index] = { ...newCategories[index], [field]: value }
      setWorkExperienceData({ ...workExperienceData, categories: newCategories })
    }
  }

  const validateForm = (): boolean => {
    if (section === "projects") {
      if (!projectData.project_name.trim()) {
        setError("Project name is required")
        return false
      }
      if (projectData.categories.some(c => !c.category_name.trim())) {
        setError("All categories must have a name")
        return false
      }
      if (projectData.categories.some(c => !c.resume_points.trim())) {
        setError("All categories must have resume points")
        return false
      }
    } else {
      if (!workExperienceData.company.trim()) {
        setError("Company is required")
        return false
      }
      if (!workExperienceData.role.trim()) {
        setError("Role is required")
        return false
      }
      if (!workExperienceData.startDate.trim()) {
        setError("Start date is required")
        return false
      }
      if (workExperienceData.categories.some(c => !c.category_name.trim())) {
        setError("All categories must have a name")
        return false
      }
      if (workExperienceData.categories.some(c => !c.resume_points.trim())) {
        setError("All categories must have resume points")
        return false
      }
    }
    setError(null)
    return true
  }

  const handleContinue = () => {
    if (validateForm()) {
      setStep("confirm")
    }
  }

  const handleBack = () => {
    setStep("form")
  }

  const handleConfirm = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    setError(null)

    try {
      let dataToSave: any

      if (section === "projects") {
        dataToSave = {
          project_name: projectData.project_name,
          description: projectData.description,
          ...(projectData.github_url.trim() ? {
            github: {
              url: projectData.github_url,
              commit_count: parseInt(projectData.github_commit_count) || 0,
            },
          } : {}),
          categories: projectData.categories.filter(c => c.category_name.trim()),
        }
      } else {
        dataToSave = {
          company: workExperienceData.company,
          role: workExperienceData.role,
          location: workExperienceData.location || undefined,
          startDate: workExperienceData.startDate,
          endDate: workExperienceData.endDate || null,
          description: workExperienceData.description,
          categories: workExperienceData.categories.filter(c => c.category_name.trim()),
        }
      }

      await onSave(dataToSave)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entry")
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = section === "projects" ? projectData.categories : workExperienceData.categories

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? `Add New ${section === "projects" ? "Project" : "Work Experience"}` : `Edit ${section === "projects" ? "Project" : "Work Experience"}`}
          </DialogTitle>
          <DialogDescription>
            {step === "form"
              ? "Fill in the details below. All fields marked with * are required."
              : "Review the information below before saving."}
          </DialogDescription>
        </DialogHeader>

        {step === "form" ? (
          <div className="px-6 py-4">
            <div className="space-y-6">
              {/* Error message */}
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Project specific fields */}
              {section === "projects" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="project_name">
                      Project Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="project_name"
                      value={projectData.project_name}
                      onChange={(e) => setProjectData({ ...projectData, project_name: e.target.value })}
                      placeholder="My Awesome Project"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="github_url" className="flex items-center gap-2">
                        <Github className="h-4 w-4" />
                        GitHub URL <span className="text-muted-foreground text-xs">(optional)</span>
                      </Label>
                      <Input
                        id="github_url"
                        type="url"
                        value={projectData.github_url}
                        onChange={(e) => setProjectData({ ...projectData, github_url: e.target.value })}
                        placeholder="https://github.com/user/repo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="commit_count">Commit Count</Label>
                      <Input
                        id="commit_count"
                        type="number"
                        min="0"
                        value={projectData.github_commit_count}
                        onChange={(e) => setProjectData({ ...projectData, github_commit_count: e.target.value })}
                        placeholder="0"
                        disabled={!projectData.github_url}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">
                        Company <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="company"
                        value={workExperienceData.company}
                        onChange={(e) => setWorkExperienceData({ ...workExperienceData, company: e.target.value })}
                        placeholder="Acme Inc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">
                        Role <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="role"
                        value={workExperienceData.role}
                        onChange={(e) => setWorkExperienceData({ ...workExperienceData, role: e.target.value })}
                        placeholder="Software Engineer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Start Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={workExperienceData.startDate}
                        onChange={(e) => setWorkExperienceData({ ...workExperienceData, startDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        End Date
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={workExperienceData.endDate}
                        onChange={(e) => setWorkExperienceData({ ...workExperienceData, endDate: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">Leave empty if current</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={workExperienceData.location}
                        onChange={(e) => setWorkExperienceData({ ...workExperienceData, location: e.target.value })}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <ScrollArea className="h-32 rounded-md border">
                  <Textarea
                    id="description"
                    value={section === "projects" ? projectData.description : workExperienceData.description}
                    onChange={(e) =>
                      section === "projects"
                        ? setProjectData({ ...projectData, description: e.target.value })
                        : setWorkExperienceData({ ...workExperienceData, description: e.target.value })
                    }
                    placeholder="Enter a detailed description..."
                    className="min-h-[120px] resize-none border-0 focus-visible:ring-0"
                  />
                </ScrollArea>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Categories <span className="text-destructive">*</span></Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCategory}
                    className="h-7"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Category
                  </Button>
                </div>

                {categories.map((category, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded-md relative">
                    {categories.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveCategory(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}

                    <div className="space-y-2 pr-8">
                      <div className="space-y-1">
                        <Label htmlFor={`cat-name-${index}`} className="text-xs">
                          Category Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`cat-name-${index}`}
                          value={category.category_name}
                          onChange={(e) => handleCategoryChange(index, "category_name", e.target.value)}
                          placeholder="Software Engineering"
                          className="h-8"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor={`cat-points-${index}`} className="text-xs">Resume Points <span className="text-destructive">*</span></Label>
                        <ScrollArea className="h-24 rounded-md border">
                          <Textarea
                            id={`cat-points-${index}`}
                            value={category.resume_points}
                            onChange={(e) => handleCategoryChange(index, "resume_points", e.target.value)}
                            placeholder="- Developed feature X&#10;- Improved performance by Y%"
                            className="min-h-[80px] resize-none border-0 focus-visible:ring-0 text-sm"
                          />
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-6 py-4">
            <div className="space-y-4">
              {/* Error message */}
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Project confirmation */}
              {section === "projects" ? (
                <>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Project Name</p>
                    <p className="font-medium">{projectData.project_name || <span className="text-muted-foreground italic">Not set</span>}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">GitHub URL</p>
                      <p className="font-medium text-sm break-all">{projectData.github_url || <span className="text-muted-foreground italic">Not set</span>}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Commit Count</p>
                      <p className="font-medium">{projectData.github_commit_count || "0"}</p>
                    </div>
                  </div>

                  {projectData.description && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md max-h-32 overflow-y-auto">
                        {projectData.description}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Categories ({projectData.categories.filter(c => c.category_name.trim()).length})</p>
                    {projectData.categories.filter(c => c.category_name.trim()).map((cat, i) => (
                      <div key={i} className="p-3 bg-muted/50 rounded-md">
                        <p className="font-medium text-sm">{cat.category_name}</p>
                        {cat.resume_points && (
                          <p className="text-sm whitespace-pre-wrap mt-2 max-h-24 overflow-y-auto">
                            {cat.resume_points}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="font-medium">{workExperienceData.company || <span className="text-muted-foreground italic">Not set</span>}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="font-medium">{workExperienceData.role || <span className="text-muted-foreground italic">Not set</span>}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{workExperienceData.startDate || <span className="text-muted-foreground italic">Not set</span>}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">{workExperienceData.endDate || <span className="text-muted-foreground italic">Present</span>}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{workExperienceData.location || <span className="text-muted-foreground italic">Not set</span>}</p>
                    </div>
                  </div>

                  {workExperienceData.description && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md max-h-32 overflow-y-auto">
                        {workExperienceData.description}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Categories ({workExperienceData.categories.filter(c => c.category_name.trim()).length})</p>
                    {workExperienceData.categories.filter(c => c.category_name.trim()).map((cat, i) => (
                      <div key={i} className="p-3 bg-muted/50 rounded-md">
                        <p className="font-medium text-sm">{cat.category_name}</p>
                        {cat.resume_points && (
                          <p className="text-sm whitespace-pre-wrap mt-2 max-h-24 overflow-y-auto">
                            {cat.resume_points}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="border-t pt-4">
          {step === "form" ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleContinue}>
                Continue to Review
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                Back to Edit
              </Button>
              <Button onClick={handleConfirm} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Confirm & Save"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
