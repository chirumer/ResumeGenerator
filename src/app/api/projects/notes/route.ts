import { NextRequest, NextResponse } from "next/server"
import { projectRepository } from "@/lib/repositories/projectRepository"
import { z } from "zod"

const UpdateNoteSchema = z.object({
  projectId: z.string().min(1),
  note: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = UpdateNoteSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { projectId, note } = result.data

    await projectRepository.updateProjectNote(projectId, note)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating project note:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
