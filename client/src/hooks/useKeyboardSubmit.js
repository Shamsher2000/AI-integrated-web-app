import { useCallback } from 'react'

/**
 * Hook to handle keyboard submission in chat inputs
 * Supports: Enter to send, Shift+Enter for new line
 * @param {Function} onSubmit - Called when user presses Enter
 * @returns {Function} Handler for onKeyDown event
 */
export const useKeyboardSubmit = (onSubmit) => {
  return useCallback(
    (event) => {
      // Check if Enter was pressed (without Shift)
      const isEnterKey = event.key === 'Enter'
      const isNotShiftEnter = !event.shiftKey

      if (isEnterKey && isNotShiftEnter) {
        // Prevent default textarea behavior (adding newline)
        event.preventDefault()
        // Call the submit handler
        onSubmit()
      }
    },
    [onSubmit],
  )
}
