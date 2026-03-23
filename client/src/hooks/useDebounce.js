import { useEffect, useState } from 'react'

/**
 * Debounce hook - delays updates to a value until after the specified delay passes
 * Useful for search inputs, form fields, and other frequent updates
 * @param {*} value - The value to debounce
 * @param {number} delay - Debounce delay in milliseconds (default: 500ms)
 * @returns {*} The debounced value
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
