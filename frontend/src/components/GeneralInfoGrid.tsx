"use client"

import { useState } from "react"
import { User, Mail, Phone, MapPin, Link as LinkIcon, Code2, Wrench, Library, FileCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { General, GeneralLink } from "@/types/general"

interface GeneralInfoGridProps {
  general: General
  onSave: (data: Partial<General>) => Promise<void>
}

export function GeneralInfoGrid({ general, onSave }: GeneralInfoGridProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<General>(general)

  const handleSave = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      await onSave(formData)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save general information")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData(general)
    setIsEditing(false)
    setError(null)
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

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Contact Information Card */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Contact Information
          </h3>

          <div className="grid grid-cols-2 gap-4">
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
        </div>

        {/* Links Card */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Profile Links
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLink}
            >
              Add Link
            </Button>
          </div>

          {formData.links.map((link, index) => (
            <div key={index} className="space-y-2 p-4 border rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Link {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLink(index)}
                >
                  Remove
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

        {/* Skills Card */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Technical Skills
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="languages" className="flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                Languages
              </Label>
              <Textarea
                id="languages"
                value={formData.skills.languages}
                onChange={(e) => updateSkill("languages", e.target.value)}
                placeholder="TypeScript, JavaScript, Python, Java, SQL, HTML/CSS"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frameworks" className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                Frameworks
              </Label>
              <Textarea
                id="frameworks"
                value={formData.skills.frameworks}
                onChange={(e) => updateSkill("frameworks", e.target.value)}
                placeholder="React, Next.js, Node.js, Express, Spring Boot"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tools" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Developer Tools
              </Label>
              <Textarea
                id="tools"
                value={formData.skills.tools}
                onChange={(e) => updateSkill("tools", e.target.value)}
                placeholder="Git, Docker, AWS, VS Code, Postman"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="libraries" className="flex items-center gap-2">
                <Library className="h-4 w-4" />
                Libraries
              </Label>
              <Textarea
                id="libraries"
                value={formData.skills.libraries}
                onChange={(e) => updateSkill("libraries", e.target.value)}
                placeholder="Redux, Tailwind CSS, MongoDB, PostgreSQL"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{general.name || "Your Name"}</h2>
          <p className="text-muted-foreground mt-1">General Information</p>
        </div>
        <Button onClick={() => setIsEditing(true)} variant="outline">
          Edit Information
        </Button>
      </div>

      {/* Contact Information Card */}
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Contact
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {general.email && (
            <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{general.email}</p>
              </div>
            </div>
          )}

          {general.phone && (
            <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{general.phone}</p>
              </div>
            </div>
          )}

          {general.location && (
            <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium">{general.location}</p>
              </div>
            </div>
          )}
        </div>

        {/* Links */}
        {general.links.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Profile Links</p>
            <div className="flex flex-wrap gap-2">
              {general.links.map((link, index) => (
                <a
                  key={index}
                  href={`https://${link.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                >
                  <LinkIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Skills Card */}
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Technical Skills
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {general.skills.languages && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Languages</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {general.skills.languages.split(",").map((skill, index) => (
                  <Badge key={index} variant="secondary" className="font-normal">
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {general.skills.frameworks && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Frameworks</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {general.skills.frameworks.split(",").map((skill, index) => (
                  <Badge key={index} variant="secondary" className="font-normal">
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {general.skills.tools && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Developer Tools</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {general.skills.tools.split(",").map((skill, index) => (
                  <Badge key={index} variant="secondary" className="font-normal">
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {general.skills.libraries && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Library className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Libraries</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {general.skills.libraries.split(",").map((skill, index) => (
                  <Badge key={index} variant="secondary" className="font-normal">
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
