"use client"

import { useState, useCallback, useMemo } from "react"

interface SelectionState {
  selectedIds: Map<string, number> // projectId -> selectionOrder
  nextOrder: number
}

export function useProjectSelection() {
  const [state, setState] = useState<SelectionState>({
    selectedIds: new Map(),
    nextOrder: 0,
  })

  // Toggle single project selection
  const toggleSelection = useCallback((projectId: string) => {
    setState((prev) => {
      const newMap = new Map(prev.selectedIds)
      if (newMap.has(projectId)) {
        newMap.delete(projectId)
        return { ...prev, selectedIds: newMap }
      } else {
        newMap.set(projectId, prev.nextOrder)
        return { selectedIds: newMap, nextOrder: prev.nextOrder + 1 }
      }
    })
  }, [])

  // Check if project is selected
  const isSelected = useCallback(
    (projectId: string) => state.selectedIds.has(projectId),
    [state.selectedIds]
  )

  // Get selection order (1-indexed for display)
  const getSelectionOrder = useCallback(
    (projectId: string): number | null => {
      if (!state.selectedIds.has(projectId)) return null
      // Calculate actual position based on order values
      const order = state.selectedIds.get(projectId)!
      const sortedOrders = Array.from(state.selectedIds.values()).sort(
        (a, b) => a - b
      )
      return sortedOrders.indexOf(order) + 1
    },
    [state.selectedIds]
  )

  // Get ordered list of selected project IDs
  const orderedSelectedIds = useMemo(() => {
    return Array.from(state.selectedIds.entries())
      .sort(([, a], [, b]) => a - b)
      .map(([id]) => id)
  }, [state.selectedIds])

  // Select all from a list of IDs (only adds unselected ones)
  const selectAll = useCallback((projectIds: string[]) => {
    setState((prev) => {
      const newMap = new Map(prev.selectedIds)
      let nextOrder = prev.nextOrder
      projectIds.forEach((id) => {
        if (!newMap.has(id)) {
          newMap.set(id, nextOrder++)
        }
      })
      return { selectedIds: newMap, nextOrder }
    })
  }, [])

  // Deselect a specific project
  const deselect = useCallback((projectId: string) => {
    setState((prev) => {
      const newMap = new Map(prev.selectedIds)
      newMap.delete(projectId)
      return { ...prev, selectedIds: newMap }
    })
  }, [])

  // Clear all selections
  const clearAll = useCallback(() => {
    setState({ selectedIds: new Map(), nextOrder: 0 })
  }, [])

  // Reorder selection (for drag and drop in cart)
  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    setState((prev) => {
      const ordered = Array.from(prev.selectedIds.entries()).sort(
        ([, a], [, b]) => a - b
      )

      const [moved] = ordered.splice(fromIndex, 1)
      ordered.splice(toIndex, 0, moved)

      const newMap = new Map<string, number>()
      ordered.forEach(([id], index) => {
        newMap.set(id, index)
      })

      return { selectedIds: newMap, nextOrder: ordered.length }
    })
  }, [])

  return {
    selectedIds: state.selectedIds,
    orderedSelectedIds,
    selectedCount: state.selectedIds.size,
    toggleSelection,
    isSelected,
    getSelectionOrder,
    selectAll,
    deselect,
    clearAll,
    reorder,
  }
}
