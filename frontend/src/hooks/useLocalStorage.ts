"use client"

import { useState, useEffect, useCallback } from "react"

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
  const { serialize = JSON.stringify, deserialize = JSON.parse } = options ?? {}

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? deserialize(item) : initialValue
    } catch (error) {
      console.warn(`Error loading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, serialize(valueToStore))
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, serialize, storedValue]
  )

  // Sync with localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserialize(e.newValue))
        } catch (error) {
          console.warn(`Error parsing localStorage key "${key}":`, error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [key, deserialize])

  return [storedValue, setValue]
}
