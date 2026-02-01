"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseLocalStorageOptions<T> {
  serialize?: (value: T) => string
  deserialize?: (value: string) => T
}

/**
 * A hook that persists state to localStorage.
 * @param key - The localStorage key to use
 * @param initialValue - The initial value if no stored value exists
 * @param options - Optional custom serialize/deserialize functions
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions<T>
): [T, (value: T | ((prev: T) => T)) => void] {
  // Use refs for serialize/deserialize to avoid recreating callbacks when they change
  const serializeRef = useRef(options?.serialize ?? JSON.stringify)
  const deserializeRef = useRef(options?.deserialize ?? JSON.parse)

  // Update refs if options change (but don't trigger re-renders)
  useEffect(() => {
    serializeRef.current = options?.serialize ?? JSON.stringify
    deserializeRef.current = options?.deserialize ?? JSON.parse
  }, [options?.serialize, options?.deserialize])

  // Always initialize with initialValue to avoid hydration mismatch
  // (server renders with initialValue, so client must match on first render)
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Use a ref to track the latest value to avoid stale closure in setValue
  const storedValueRef = useRef<T>(storedValue)
  useEffect(() => {
    storedValueRef.current = storedValue
  }, [storedValue])

  // Track if we've hydrated from localStorage
  const hasHydratedRef = useRef(false)

  // Sync with localStorage after hydration (only once per key)
  useEffect(() => {
    // Reset hydration state when key changes
    hasHydratedRef.current = false
  }, [key])

  useEffect(() => {
    if (hasHydratedRef.current) return
    hasHydratedRef.current = true

    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(deserializeRef.current(item))
      }
    } catch (error) {
      console.warn(`Error loading localStorage key "${key}":`, error)
    }
  }, [key])

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Use ref to get latest value, avoiding stale closure
        const valueToStore = value instanceof Function ? value(storedValueRef.current) : value
        setStoredValue(valueToStore)
        storedValueRef.current = valueToStore

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, serializeRef.current(valueToStore))
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key]
  )

  // Sync with localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = deserializeRef.current(e.newValue)
          setStoredValue(newValue)
          storedValueRef.current = newValue
        } catch (error) {
          console.warn(`Error parsing localStorage key "${key}":`, error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [key])

  return [storedValue, setValue]
}
