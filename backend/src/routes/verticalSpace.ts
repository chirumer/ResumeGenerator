import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { spawn } from 'child_process'
import { tmpdir } from 'os'
import { mkdtempSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import { generateLatexResume } from '../services/latexTemplate.js'
import {
  getWorkExperienceForResume,
  getProjectsForResume,
} from '../services/dataExtractor.js'
import { projectRepository } from '../repositories/projectRepository.js'
import { workExperienceRepository } from '../repositories/workExperienceRepository.js'
import { generalRepository } from '../repositories/generalRepository.js'

const app = new Hono()

const VerticalSpaceRequestSchema = z.object({
  projectIds: z.array(z.string()).optional().default([]),
  projectCategories: z.array(z.string()).optional().default([]),
  workExperienceIds: z.array(z.string()).optional().default([]),
  workExperienceCategories: z.array(z.string()).optional().default([]),
  targetPages: z.number().int().min(1).max(10).optional().default(1),
})

interface VerticalSpaceResult {
  status: 'fit' | 'overflow'
  true_max_space_pts: number
  shrink_used_pts: number
  page_count: number
  target_pages: number
  metric_unit: string
  error?: string
}

/**
 * Runs the vertical space calculation Python logic directly via pdflatex
 * This embeds the Python script logic directly in TypeScript
 */
async function calculateVerticalSpace(
  latexContent: string,
  targetPages: number
): Promise<VerticalSpaceResult> {
  // Validate LaTeX content
  if (!latexContent.includes('\\end{document}')) {
    return { 
      error: 'Invalid LaTeX: Missing \\end{document}',
      status: 'overflow',
      true_max_space_pts: 0,
      shrink_used_pts: 0,
      page_count: 0,
      target_pages: targetPages,
      metric_unit: 'pt'
    }
  }

  // Instrumentation probe to capture metrics
  const probe = `
\\makeatletter
\\typeout{^^J===SPACE_CHECK_START===}
\\typeout{PageCount:\\the\\c@page}
\\typeout{PageTotal:\\the\\pagetotal}
\\typeout{PageGoal:\\the\\pagegoal}
\\typeout{PageShrink:\\the\\pageshrink}
\\typeout{TextHeight:\\the\\textheight}
\\typeout{===SPACE_CHECK_END===^^J}
\\makeatother
`
  const instrumentedLatex = latexContent.replace(
    '\\end{document}',
    probe + '\n\\end{document}'
  )

  return new Promise((resolve) => {
    // Create temp directory
    const tempDir = mkdtempSync(join(tmpdir(), 'resume-space-'))
    const texFile = join(tempDir, 'resume_check.tex')

    try {
      // Write instrumented LaTeX
      writeFileSync(texFile, instrumentedLatex)

      // Run pdflatex
      const pdflatex = spawn('pdflatex', ['-interaction=nonstopmode', 'resume_check.tex'], {
        cwd: tempDir,
      })

      let stdout = ''
      let stderr = ''

      pdflatex.stdout.on('data', (data: Buffer) => {
        stdout += data.toString()
      })

      pdflatex.stderr.on('data', (data: Buffer) => {
        stderr += data.toString()
      })

      pdflatex.on('close', (code: number) => {
        // Clean up temp directory
        try {
          rmSync(tempDir, { recursive: true, force: true })
        } catch {
          // Ignore cleanup errors
        }

        // Parse metrics from log output
        const pageMatch = stdout.match(/PageCount:(\d+)/)
        const totalMatch = stdout.match(/PageTotal:([\d.]+)pt/)
        const goalMatch = stdout.match(/PageGoal:([\d.]+)pt/)
        const shrinkMatch = stdout.match(/PageShrink:([\d.]+)pt/)
        const heightMatch = stdout.match(/TextHeight:([\d.]+)pt/)

        if (!pageMatch || !totalMatch || !goalMatch) {
          resolve({
            error: 'Compilation failed or could not parse metrics',
            status: 'overflow',
            true_max_space_pts: 0,
            shrink_used_pts: 0,
            page_count: 0,
            target_pages: targetPages,
            metric_unit: 'pt'
          })
          return
        }

        const pageCount = parseInt(pageMatch[1], 10)
        const pageTotalPts = parseFloat(totalMatch[1])
        const pageGoalPts = parseFloat(goalMatch[1])
        const textHeightPts = heightMatch ? parseFloat(heightMatch[1]) : pageGoalPts
        const pageShrinkPts = shrinkMatch ? parseFloat(shrinkMatch[1]) : 0

        // Calculate space
        const result: VerticalSpaceResult = {
          page_count: pageCount,
          target_pages: targetPages,
          metric_unit: 'pt',
          status: 'fit',
          true_max_space_pts: 0,
          shrink_used_pts: 0,
        }

        let naturalGapPts = 0

        if (pageCount <= targetPages) {
          // CASE: Fits within target
          result.status = 'fit'

          if (pageCount === targetPages) {
            // Ends on the target page
            naturalGapPts = pageGoalPts - pageTotalPts
          } else {
            // Ends BEFORE the target page
            const spaceOnCurrentPage = pageGoalPts - pageTotalPts
            const emptyPagesCount = targetPages - pageCount
            naturalGapPts = spaceOnCurrentPage + (emptyPagesCount * textHeightPts)
          }

          // Handle floating point tolerance
          if (naturalGapPts < 0 && naturalGapPts > -1.0) {
            naturalGapPts = 0
          }
        } else {
          // CASE: Overflows target
          result.status = 'overflow'

          // Excess = (Content on final page) + (Full height of fully skipped excess pages)
          const skippedExcessPages = pageCount - targetPages - 1
          const excessPts = pageTotalPts + (skippedExcessPages * textHeightPts)
          naturalGapPts = -excessPts
        }

        const trueMaxSpacePts = naturalGapPts + pageShrinkPts
        const shrinkUsedPts = Math.max(0, Math.min(pageShrinkPts, -naturalGapPts))

        result.true_max_space_pts = trueMaxSpacePts
        result.shrink_used_pts = shrinkUsedPts
        result.status = trueMaxSpacePts < 0 ? 'overflow' : 'fit'

        resolve(result)
      })

      pdflatex.on('error', (err: Error) => {
        // Clean up temp directory
        try {
          rmSync(tempDir, { recursive: true, force: true })
        } catch {
          // Ignore cleanup errors
        }

        resolve({
          error: `pdflatex command not found or failed: ${err.message}`,
          status: 'overflow',
          true_max_space_pts: 0,
          shrink_used_pts: 0,
          page_count: 0,
          target_pages: targetPages,
          metric_unit: 'pt'
        })
      })
    } catch (err) {
      // Clean up temp directory
      try {
        rmSync(tempDir, { recursive: true, force: true })
      } catch {
        // Ignore cleanup errors
      }

      resolve({
        error: `Failed to create temp files: ${err}`,
        status: 'overflow',
        true_max_space_pts: 0,
        shrink_used_pts: 0,
        page_count: 0,
        target_pages: targetPages,
        metric_unit: 'pt'
      })
    }
  })
}

app.post('/', zValidator('json', VerticalSpaceRequestSchema), async (c) => {
  const data = c.req.valid('json')

  try {
    // Extract data for work experiences
    const workExperiences = await getWorkExperienceForResume(
      data.workExperienceIds,
      data.workExperienceCategories,
      { workExperienceRepository }
    )

    // Extract data for projects
    const projects = await getProjectsForResume(
      data.projectIds,
      data.projectCategories,
      { projectRepository }
    )

    // Get general information
    const generalInfo = await generalRepository.getGeneralInfo()

    // Generate LaTeX content
    const latexContent = generateLatexResume(workExperiences, projects, generalInfo)

    // Calculate vertical space
    const result = await calculateVerticalSpace(latexContent, data.targetPages)

    if (result.error) {
      return c.json(result, 500)
    }

    return c.json(result)
  } catch (err) {
    return c.json({ 
      error: `Failed to calculate vertical space: ${err}`,
      status: 'overflow' as const,
      true_max_space_pts: 0,
      shrink_used_pts: 0,
      page_count: 0,
      target_pages: data.targetPages,
      metric_unit: 'pt'
    }, 500)
  }
})

export { app as verticalSpaceRouter }
