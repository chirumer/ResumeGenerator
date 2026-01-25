"use client"

import { useSelection } from "./useSelection"

export function useWorkExperienceSelection() {
  const selection = useSelection()

  return {
    ...selection,
  }
}
