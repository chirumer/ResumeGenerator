import type { Project } from "@resume-generator/shared-types"

// Extended project with loaded content and unique ID
export interface ProjectWithContent extends Project {
  id: string                                  // Unique identifier (slugified project_name)
  descriptionContent: string                  // Parsed markdown content from description file
  resumePointsByCategory: Map<string, string> // category_name -> resume points content
  selectedCategory: string                    // Currently selected category
  resumePointsContent: string                 // Convenience getter for selected category's resume points
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
