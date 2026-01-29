import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { projectRepository } from "@/lib/repositories/projectRepository"
import { workExperienceRepository } from "@/lib/repositories/workExperienceRepository"

// CORS headers for external access
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS })
}

// Validation schemas
const CategoryInputSchema = z.object({
  category_name: z.string().min(1, "Category name is required"),
  resume_points: z.string(),
})

const GitHubInputSchema = z.object({
  url: z.string().optional(),
  commit_count: z.number().int().min(0, "Commit count must be non-negative").optional(),
})

const ProjectDataSchema = z.object({
  project_name: z.string().min(1, "Project name is required"),
  description: z.string(),
  github: GitHubInputSchema.optional(),
  categories: z.array(CategoryInputSchema).min(1, "At least one category is required"),
})

const WorkExperienceDataSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().nullable().optional(),
  description: z.string(),
  categories: z.array(CategoryInputSchema).min(1, "At least one category is required"),
  tags: z.array(z.string()).default([]),
})

const EntriesRequestSchema = z.object({
  section: z.enum(["projects", "work-experiences"]),
  operation: z.enum(["create", "update", "archive", "delete"]),
  entryId: z.string().nullable().optional(),
  data: z.any().optional(), // We'll validate based on section
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = EntriesRequestSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: result.error.flatten() },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const { section, operation, entryId, data } = result.data

    // Validate that entryId is provided for update, archive, and delete operations
    if (operation !== "create" && !entryId) {
      return NextResponse.json(
        { error: "entryId is required for update, archive, and delete operations" },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    // Validate that data is provided for create and update operations
    if ((operation === "create" || operation === "update") && !data) {
      return NextResponse.json(
        { error: "data is required for create and update operations" },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    // Validate data based on section
    if (data && section === "projects") {
      const validationResult = ProjectDataSchema.safeParse(data)
      if (!validationResult.success) {
        return NextResponse.json(
          { error: "Invalid project data", details: validationResult.error.flatten() },
          { status: 400, headers: CORS_HEADERS }
        )
      }
    } else if (data && section === "work-experiences") {
      const validationResult = WorkExperienceDataSchema.safeParse(data)
      if (!validationResult.success) {
        return NextResponse.json(
          { error: "Invalid work experience data", details: validationResult.error.flatten() },
          { status: 400, headers: CORS_HEADERS }
        )
      }
    }

    let response: any = { success: true }

    // Handle operations based on section
    if (section === "projects") {
      if (operation === "create") {
        const projectData = ProjectDataSchema.parse(data)
        // Normalize github data - provide defaults if not set
        const normalizedData = {
          ...projectData,
          github: {
            url: projectData.github?.url ?? "",
            commit_count: projectData.github?.commit_count ?? 0,
          },
        }
        const id = await projectRepository.createProject(normalizedData)
        response = { success: true, id, message: "Project created successfully" }
      } else if (operation === "update") {
        const projectData = ProjectDataSchema.partial().parse(data)
        // Normalize github data - provide defaults if not set
        const normalizedData = {
          ...projectData,
          github: projectData.github ? {
            url: projectData.github.url ?? "",
            commit_count: projectData.github.commit_count ?? 0,
          } : undefined,
        }
        await projectRepository.updateProject(entryId!, normalizedData)
        response = { success: true, message: "Project updated successfully" }
      } else if (operation === "archive") {
        // For archive, we expect { archived: boolean } in data
        const archiveData = z.object({ archived: z.boolean() }).parse(data)
        await projectRepository.updateProjectArchived(entryId!, archiveData.archived)
        response = { success: true, message: `Project ${archiveData.archived ? "archived" : "unarchived"} successfully` }
      } else if (operation === "delete") {
        await projectRepository.deleteProject(entryId!)
        response = { success: true, message: "Project deleted successfully" }
      }
    } else if (section === "work-experiences") {
      if (operation === "create") {
        const workExperienceData = WorkExperienceDataSchema.parse(data)
        // Convert undefined endDate to null for type consistency
        const normalizedData = {
          ...workExperienceData,
          endDate: workExperienceData.endDate ?? null,
        }
        const id = await workExperienceRepository.createWorkExperience(normalizedData)
        response = { success: true, id, message: "Work experience created successfully" }
      } else if (operation === "update") {
        const workExperienceData = WorkExperienceDataSchema.partial().parse(data)
        // Convert undefined endDate to null for type consistency
        const normalizedData = {
          ...workExperienceData,
          endDate: workExperienceData.endDate ?? null,
        }
        await workExperienceRepository.updateWorkExperience(entryId!, normalizedData)
        response = { success: true, message: "Work experience updated successfully" }
      } else if (operation === "archive") {
        const archiveData = z.object({ archived: z.boolean() }).parse(data)
        await workExperienceRepository.updateWorkExperienceArchived(entryId!, archiveData.archived)
        response = { success: true, message: `Work experience ${archiveData.archived ? "archived" : "unarchived"} successfully` }
      } else if (operation === "delete") {
        await workExperienceRepository.deleteWorkExperience(entryId!)
        response = { success: true, message: "Work experience deleted successfully" }
      }
    }

    return NextResponse.json(response, { status: 200, headers: CORS_HEADERS })
  } catch (error) {
    console.error("Error in entries API:", error)
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)

    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.stack : undefined },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
