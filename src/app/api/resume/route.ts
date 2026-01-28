import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  getResumeGenerator,
  type ExportFormat,
} from "@/services/resumeGenerator"

const RequestSchema = z.object({
  format: z.enum(["pdf", "gdocs", "docx"]),
  projectIds: z.array(z.string()).min(1, "At least one project is required"),
  workExperienceIds: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { format, projectIds, workExperienceIds } = RequestSchema.parse(body)

    const generator = getResumeGenerator(format as ExportFormat)

    const validation = generator.canGenerate({ format, projectIds })
    if (!validation.valid) {
      return NextResponse.json({ error: validation.reason }, { status: 400 })
    }

    const result = await generator.generate({ format, projectIds })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // For blob data (PDF), return as file download
    if (result.data instanceof Blob) {
      const buffer = await result.data.arrayBuffer()
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${result.filename}"`,
        },
      })
    }

    // For URL data (e.g., Docs link)
    return NextResponse.json({ url: result.data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Resume generation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
