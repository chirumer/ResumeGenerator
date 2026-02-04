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
import { Plus, Trash2, Link as LinkIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { General, GeneralLink } from "@/types/general"

interface GeneralSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: General
  onSave: (data: Partial<General>) => Promise<void>
}

export function GeneralSettings({
  open,
  onOpenChange,
  initialData,
  onSave,
}: GeneralSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<General>({
    name: "",
    email: "",
    phone: "",
    location: "",
    links: [],
    skills: {
      languages: "",
      frameworks: "",
      tools: "",
      libraries: "",
    },
  })

  // Initialize with data when opening
  useEffect(() => {
    if (open && initialData) {
      setFormData(initialData)
    }
  }, [open, initialData])

  const handleSave = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: keyof General, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateSkill = (field: keyof General["skills"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: { ...prev.skills, [field]: value },
    }))
  }

  const addLink = () => {
    setFormData((prev) => ({
      ...prev,
      links: [...prev.links, { type: "", url: "", label: "" }],
    }))
  }

  const updateLink = (index: number, field: keyof GeneralLink, value: string) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }))
  }

  const removeLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>General Resume Settings</DialogTitle>
          <DialogDescription>
            Update your contact information and technical skills for the resume.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] px-1">
          <div className="space-y-6 pr-4">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Contact Information</h3>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Alex Chen"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="alex.chen@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="555-123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (optional)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Profile Links</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLink}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Link
                </Button>
              </div>

              {formData.links.map((link, index) => (
                <div key={index} className="space-y-2 p-3 border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Link {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLink(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`link-label-${index}`}>Label</Label>
                      <Input
                        id={`link-label-${index}`}
                        value={link.label}
                        onChange={(e) => updateLink(index, "label", e.target.value)}
                        placeholder="LinkedIn"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`link-type-${index}`}>Type</Label>
                      <Input
                        id={`link-type-${index}`}
                        value={link.type}
                        onChange={(e) => updateLink(index, "type", e.target.value)}
                        placeholder="linkedin"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`link-url-${index}`}>URL (without https://)</Label>
                    <Input
                      id={`link-url-${index}`}
                      value={link.url}
                      onChange={(e) => updateLink(index, "url", e.target.value)}
                      placeholder="linkedin.com/in/alexchen"
                    />
                  </div>
                </div>
              ))}

              {formData.links.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No links added. Click "Add Link" to add profile links like LinkedIn, GitHub, etc.
                </p>
              )}
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Technical Skills</h3>

              <div className="space-y-2">
                <Label htmlFor="languages">Languages</Label>
                <Textarea
                  id="languages"
                  value={formData.skills.languages}
                  onChange={(e) => updateSkill("languages", e.target.value)}
                  placeholder="TypeScript, JavaScript, Python, Java, SQL, HTML/CSS"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frameworks">Frameworks</Label>
                <Textarea
                  id="frameworks"
                  value={formData.skills.frameworks}
                  onChange={(e) => updateSkill("frameworks", e.target.value)}
                  placeholder="React, Next.js, Node.js, Express, Spring Boot"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tools">Developer Tools</Label>
                <Textarea
                  id="tools"
                  value={formData.skills.tools}
                  onChange={(e) => updateSkill("tools", e.target.value)}
                  placeholder="Git, Docker, AWS, VS Code, Postman"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="libraries">Libraries</Label>
                <Textarea
                  id="libraries"
                  value={formData.skills.libraries}
                  onChange={(e) => updateSkill("libraries", e.target.value)}
                  placeholder="Redux, Tailwind CSS, MongoDB, PostgreSQL"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
