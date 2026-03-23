// Theme toggling is global UI state, so it lives in the Redux app slice.
// When theme is toggled, it also saves to the database via API call.
import { memo, useCallback, useState } from 'react'
import { MoonStar, SunMedium } from 'lucide-react'
import { setTheme } from '../../store/appSlice.js'
import { useAppDispatch, useAppSelector } from '../../store/hooks.js'
import { apiFetch } from '../../lib/api.js'

const ThemeToggleComponent = () => {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.app.theme)
  const token = useAppSelector((state) => state.app.token)
  const [isSaving, setIsSaving] = useState(false)

  // When toggled, save the new theme to the database
  const handleToggle = useCallback(async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    
    // Update UI immediately
    dispatch(setTheme(nextTheme))
    
    // Save to database
    if (token) {
      setIsSaving(true)
      try {
        await apiFetch('/profile', {
          method: 'PATCH',
          token,
          body: {
            theme: nextTheme,
          },
        })
      } catch (error) {
        console.error('Failed to save theme preference:', error)
        // Revert UI if save fails
        dispatch(setTheme(theme))
      } finally {
        setIsSaving(false)
      }
    }
  }, [theme, token, dispatch])

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isSaving}
      className="surface inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-opacity disabled:opacity-50"
      aria-label="Toggle theme"
      title="Toggle theme and save preference"
    >
      {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  )
}

export const ThemeToggle = memo(ThemeToggleComponent)

