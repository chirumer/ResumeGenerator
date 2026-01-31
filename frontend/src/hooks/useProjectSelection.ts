"use client"

import { useSelection } from "./useSelection"

export function useProjectSelection() {
  const selection = useSelection("project-selection")

  return {
    ...selection,
  }
}
