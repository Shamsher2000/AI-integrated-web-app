import { createContext, useContext, useEffect, useMemo, useCallback } from 'react'
import { useOfflineStatus } from '../hooks/useOfflineStatus.js'
import { useAppSelector } from '../store/hooks.js'

const AppContext = createContext({
  isOnline: true,
  resolvedTheme: 'light',
})

// Context is optimized to prevent unnecessary re-renders
// Only updates when actual values change (not on every render)
export const AppContextProvider = ({ children }) => {
  const theme = useAppSelector((state) => state.app.theme)
  const isOnline = useOfflineStatus()

  // Compute resolved theme only when theme changes
  const resolvedTheme = useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  }, [theme])

  // Apply theme to DOM when resolved theme changes
  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  }, [resolvedTheme])

  // Memoize context value—only creates new object when values actually change
  const value = useMemo(
    () => ({
      isOnline,
      resolvedTheme,
    }),
    [isOnline, resolvedTheme],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => useContext(AppContext)
