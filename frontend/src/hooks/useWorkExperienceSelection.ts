"use client"

import { useSelection } from "./useSelection"

export function useWorkExperienceSelection() {
  const selection = useSelection("work-experience-selection")

  return {
    ...selection,
  }
}
