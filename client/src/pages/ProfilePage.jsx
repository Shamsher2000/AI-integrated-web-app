// Profile reads and updates both auth data and the theme preference through Redux.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api.js'
import { setUser, setTheme } from '../store/appSlice.js'
import { useAppDispatch, useAppSelector } from '../store/hooks.js'
import { AvatarDisplay } from '../components/common/AvatarDisplay.jsx'
import { AvatarSelector } from '../components/common/AvatarSelector.jsx'

export const ProfilePage = () => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const token = useAppSelector((state) => state.app.token)
  const user = useAppSelector((state) => state.app.user)
  const [form, setForm] = useState({
    username: '',
    bio: '',
    theme: 'system',
    avatar: 'spark',
  })
  const [initialForm, setInitialForm] = useState({
    username: '',
    bio: '',
    theme: 'system',
    avatar: 'spark',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Check if form has changed from initial values
  const hasChanges = JSON.stringify(form) !== JSON.stringify(initialForm)

  // On component mount, fetch fresh profile data from server
  useEffect(() => {
    const fetchFreshProfile = async () => {
      try {
        const response = await apiFetch('/auth/me', { token })
        const freshUser = response.data.user
        
        // Update Redux with fresh data
        dispatch(setUser(freshUser))
        dispatch(setTheme(freshUser.preferences?.theme || 'system'))
        
        // Initialize form with fresh server data
        const initialData = {
          username: freshUser.username || '',
          bio: freshUser.bio || '',
          theme: freshUser.preferences?.theme || 'system',
          avatar: freshUser.avatar?.value || 'spark',
        }
        setForm(initialData)
        setInitialForm(initialData)
        setIsInitialized(true)
      } catch (err) {
        console.error('Failed to fetch profile:', err)
        // Fallback to Redux data if fetch fails
        if (user) {
          const fallbackData = {
            username: user.username || '',
            bio: user.bio || '',
            theme: user.preferences?.theme || 'system',
            avatar: user.avatar?.value || 'spark',
          }
          setForm(fallbackData)
          setInitialForm(fallbackData)
          setIsInitialized(true)
        }
      }
    }
    
    if (token && !isInitialized) {
      fetchFreshProfile()
    }
  }, [token, isInitialized, dispatch, user])

  const handleSave = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    // Validation
    if (form.username.length < 3 || form.username.length > 30) {
      setError('Username must be between 3-30 characters')
      return
    }

    if (form.bio.length > 240) {
      setError('Bio cannot exceed 240 characters')
      return
    }

    setIsLoading(true)

    try {
      const response = await apiFetch('/profile', {
        method: 'PATCH',
        token,
        body: {
          username: form.username,
          bio: form.bio,
          theme: form.theme,
          avatar: {
            type: 'preset',
            value: form.avatar,
          },
        },
      })

      const updatedUser = response.data.user

      // Update Redux state (both user data and theme preference)
      dispatch(setUser(updatedUser))
      // Sync theme to redux so AppContext applies it to DOM
      dispatch(setTheme(updatedUser.preferences.theme))

      // Update form state with fresh server data
      const resetFormData = {
        username: updatedUser.username || '',
        bio: updatedUser.bio || '',
        theme: updatedUser.preferences?.theme || 'system',
        avatar: updatedUser.avatar?.value || 'spark',
      }
      setForm(resetFormData)
      setInitialForm(resetFormData)

      // Invalidate React Query cache to ensure fresh data on other pages
      // Do this AFTER updating Redux to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['me', token] })

      setMessage('Profile updated successfully.')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] muted-text">Account</p>
          <h1 className="text-4xl font-semibold">Profile settings</h1>
        </div>
        <Link to="/chat" className="rounded-full border border-(--border) px-4 py-2">
          Back to chat
        </Link>
      </div>

      <form onSubmit={handleSave} className="glass-panel space-y-3 rounded-[2rem] p-6">
        {/* Avatar Selection */}
        <div>
          <label className="mb-2 block text-xs font-medium">Your Avatar</label>
          <div className="flex items-center gap-3">
            <AvatarDisplay avatarValue={form.avatar} size={48} />
            <p className="text-xs muted-text">Select below</p>
          </div>
        </div>

        {/* Avatar Selector Grid */}
        <AvatarSelector selectedAvatar={form.avatar} onChange={(value) => setForm((current) => ({ ...current, avatar: value }))} />

        <div>
          <label htmlFor="username" className="mb-2 block text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="surface w-full rounded-2xl px-4 py-3 outline-none"
            placeholder="Choose your username"
            maxLength={30}
            value={form.username}
            onChange={(event) =>
              setForm((current) => ({ ...current, username: event.target.value }))
            }
          />
          <div className="mt-1 flex items-center justify-between">
            <p className="text-xs text-gray-500">3-30 characters, letters, numbers, dots, underscores, dashes</p>
            <p className={`text-xs ${form.username.length < 3 || form.username.length > 30 ? 'text-red-500' : 'text-gray-500'}`}>
              {form.username.length}/30
            </p>
          </div>
          {form.username.length > 0 && form.username.length < 3 && (
            <p className="mt-1 text-xs text-red-500">Username must be at least 3 characters long</p>
          )}
          {form.username.length > 30 && (
            <p className="mt-1 text-xs text-red-500">Username cannot exceed 30 characters</p>
          )}
        </div>

        <div>
          <label htmlFor="bio" className="mb-2 block text-sm font-medium">
            Bio
          </label>
          <textarea
            id="bio"
            className="surface h-20 w-full overflow-y-auto rounded-2xl px-4 py-3 outline-none resize-none"
            placeholder="Short bio (max 240 characters)"
            maxLength={240}
            value={form.bio}
            onChange={(event) =>
              setForm((current) => ({ ...current, bio: event.target.value }))
            }
          />
          <div className="mt-1 flex items-center justify-between">
            <p className={`text-xs ${form.bio.length >= 240 ? 'text-red-500' : 'text-gray-500'}`}>{form.bio.length}/240 characters</p>
          </div>
          {form.bio.length >= 240 && (
            <p className="mt-1 text-xs text-red-500">Bio has reached the maximum length of 240 characters</p>
          )}
        </div>

        <div>
          <label htmlFor="theme" className="mb-2 block text-sm font-medium">
            Theme preference
          </label>
          <select
            id="theme"
            className="surface w-full rounded-2xl px-4 py-3 outline-none"
            value={form.theme}
            onChange={(event) =>
              setForm((current) => ({ ...current, theme: event.target.value }))
            }
          >
            <option value="system">System (follows device theme)</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Your theme preference will be saved and synced across all devices.
          </p>
        </div>

        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <button
          type="submit"
          disabled={!hasChanges || isLoading}
          className={`rounded-full px-5 py-3 font-semibold text-white transition-opacity w-full ${
            hasChanges && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              : 'bg-gray-400 cursor-not-allowed opacity-50'
          }`}
        >
          {isLoading ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
