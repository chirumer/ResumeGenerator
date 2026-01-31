"use client"

import { useCallback, useMemo } from "react"
import { useLocalStorage } from "./useLocalStorage"

interface SelectionState {
  selectedIds: Map<string, number> // entityId -> selectionOrder
  nextOrder: number
}

interface SerializedSelectionState {
  selectedIds: [string, number][]
  nextOrder: number
}

export function useSelection(storageKey?: string) {
  // For localStorage serialization
  const serialize = (state: SelectionState): string => {
    const serialized: SerializedSelectionState = {
      selectedIds: Array.from(state.selectedIds.entries()),
      nextOrder: state.nextOrder,
    }
    return JSON.stringify(serialized)
  }

  const deserialize = (value: string): SelectionState => {
    try {
      const parsed: SerializedSelectionState = JSON.parse(value)
      return {
        selectedIds: new Map(parsed.selectedIds),
        nextOrder: parsed.nextOrder,
      }
    } catch {
      return { selectedIds: new Map(), nextOrder: 0 }
    }
  }

  // Use localStorage if key provided, otherwise use regular state
  const [state, setState] = useLocalStorage<SelectionState>(
    storageKey ?? "",
    { selectedIds: new Map(), nextOrder: 0 },
    storageKey ? { serialize, deserialize } : undefined
  )

  // Toggle single entity selection
  const toggleSelection = useCallback((entityId: string) => {
    setState((prev) => {
      const newMap = new Map(prev.selectedIds)
      if (newMap.has(entityId)) {
        newMap.delete(entityId)
        return { ...prev, selectedIds: newMap }
      } else {
        newMap.set(entityId, prev.nextOrder)
        return { selectedIds: newMap, nextOrder: prev.nextOrder + 1 }
      }
    })
  }, [setState])

  // Check if entity is selected
  const isSelected = useCallback(
    (entityId: string) => state.selectedIds.has(entityId),
    [state.selectedIds]
  )

  // Get selection order (1-indexed for display)
  const getSelectionOrder = useCallback(
    (entityId: string): number | null => {
      if (!state.selectedIds.has(entityId)) return null
      // Calculate actual position based on order values
      const order = state.selectedIds.get(entityId)!
      const sortedOrders = Array.from(state.selectedIds.values()).sort(
        (a, b) => a - b
      )
      return sortedOrders.indexOf(order) + 1
    },
    [state.selectedIds]
  )

  // Get ordered list of selected entity IDs
  const orderedSelectedIds = useMemo(() => {
    return Array.from(state.selectedIds.entries())
      .sort(([, a], [, b]) => a - b)
      .map(([id]) => id)
  }, [state.selectedIds])

  // Select all from a list of IDs (only adds unselected ones)
  const selectAll = useCallback((entityIds: string[]) => {
    setState((prev) => {
      const newMap = new Map(prev.selectedIds)
      let nextOrder = prev.nextOrder
      entityIds.forEach((id) => {
        if (!newMap.has(id)) {
          newMap.set(id, nextOrder++)
        }
      })
      return { selectedIds: newMap, nextOrder }
    })
  }, [setState])

  // Deselect a specific entity
  const deselect = useCallback((entityId: string) => {
    setState((prev) => {
      const newMap = new Map(prev.selectedIds)
      newMap.delete(entityId)
      return { ...prev, selectedIds: newMap }
    })
  }, [setState])

  // Clear all selections
  const clearAll = useCallback(() => {
    setState({ selectedIds: new Map(), nextOrder: 0 })
  }, [setState])

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
  }, [setState])

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
