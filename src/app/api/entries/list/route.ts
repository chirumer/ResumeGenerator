import { NextRequest, NextResponse } from "next/server"
import { projectRepository } from "@/lib/repositories/projectRepository"
import { workExperienceRepository } from "@/lib/repositories/workExperienceRepository"

// CORS headers for external access
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get("section")

    if (section !== "projects" && section !== "work-experiences") {
      return NextResponse.json(
        { error: "Invalid section. Must be 'projects' or 'work-experiences'" },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    if (section === "projects") {
      const projects = await projectRepository.getAllProjects()
      return NextResponse.json(
        {
          projects: projects.map(p => ({
            id: p.id,
            project_name: p.project_name,
            description: p.descriptionContent,
            github: p.github,
            categories: p.categories.map(c => ({
              category_name: c.category_name,
              resume_points: p.resumePointsByCategory.get(c.category_name) || "",
            })),
            archived: p.archived,
          }))
        },
        { status: 200, headers: CORS_HEADERS }
      )
    } else {
      const workExperiences = await workExperienceRepository.getAllWorkExperiences()
      return NextResponse.json(
        {
          workExperiences: workExperiences.map(we => ({
            id: we.id,
            company: we.company,
            role: we.role,
            location: we.location,
            startDate: we.startDate,
            endDate: we.endDate,
            description: we.descriptionContent,
            categories: we.categories.map(c => ({
              category_name: c.category_name,
              resume_points: we.resumePointsByCategory.get(c.category_name) || "",
            })),
            tags: we.tags,
            archived: we.archived,
          }))
        },
        { status: 200, headers: CORS_HEADERS }
      )
    }
  } catch (error) {
    console.error("Error in entries list API:", error)
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)

    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
