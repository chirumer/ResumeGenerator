import type { Project } from "@/lib/schemas/project"

// Extended project with loaded content and unique ID
export interface ProjectWithContent extends Project {
  id: string                     // Unique identifier (slugified project_name)
  descriptionContent: string     // Parsed markdown content from description file
  resumePointsContent: string    // Parsed markdown content from resume_points file
}

// Selection state item (preserves order)
export interface SelectedProject {
  id: string
  selectionIndex: number         // Order in which it was selected (0-indexed)
}

// Resume generation input
export interface ResumeInput {
  projectIds: string[]           // Ordered list of project IDs to include
  notes: Record<string, string>  // User notes per project ID
}
