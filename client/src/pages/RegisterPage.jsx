// Registration writes to the same auth slice so the user lands in the app already logged in.
// First-time users get 'system' theme which matches their OS preference
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api.js'
import { setSession } from '../store/appSlice.js'
import { useAppDispatch, useAppSelector } from '../store/hooks.js'
import { AvatarSelector } from '../components/common/AvatarSelector.jsx'
import { AvatarDisplay } from '../components/common/AvatarDisplay.jsx'

export const RegisterPage = () => {
  const dispatch = useAppDispatch()
  const token = useAppSelector((state) => state.app.token)
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    avatar: 'spark',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const usernameError = form.username.length > 0 && (form.username.length < 3 || form.username.length > 30)

  if (token) {
    return <Navigate to="/chat" replace />
  }

  const isFormIncomplete =
    !form.username.trim() ||
    !form.email.trim() ||
    !form.password.trim() ||
    form.username.length < 3 ||
    form.username.length > 30

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    if (isFormIncomplete) {
      setError('Please complete all required fields.')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        body: {
          username: form.username,
          email: form.email,
          password: form.password,
          avatar: {
            type: 'preset',
            value: form.avatar,
          },
          // Set first-time users to 'system' theme (will detect OS preference automatically)
          preferences: {
            theme: 'system',
          },
        },
      })

      dispatch(setSession(response.data))
      navigate('/chat')
    } catch (submitError) {
      if (submitError.status === 409) {
        setError('A user with this email already exists. Please use a different email or try signing in.')
      } else {
        setError(submitError.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-4">
      <div className="glass-panel w-full max-w-lg rounded-[2rem] p-6">
        <p className="text-xs uppercase tracking-[0.24em] muted-text">Create account</p>
        <h1 className="mt-2 text-3xl font-semibold">Join the app</h1>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          {/* Avatar Selection */}
          <div>
            <label className="mb-2 block text-xs font-medium">Choose avatar</label>
            <div className="flex items-center gap-3">
              <AvatarDisplay avatarValue={form.avatar} size={48} />
              <p className="text-xs muted-text">Select below</p>
            </div>
          </div>

          {/* Avatar Selector Grid */}
          <AvatarSelector selectedAvatar={form.avatar} onChange={(value) => setForm((current) => ({ ...current, avatar: value }))} />

          <input
            maxLength={30}
            value={form.username}
            onChange={(event) =>
              setForm((current) => ({ ...current, username: event.target.value }))
            }
          />
          <div className="mt-1 flex items-center justify-between">
            <p className={`text-xs ${usernameError ? 'text-red-500' : 'text-gray-500'}`}>
              3-30 characters
            </p>
            <p className={`text-xs ${usernameError ? 'text-red-500' : 'text-gray-500'}`}>
              {form.username.length}/30
            </p>
          </div>
          {form.username.length > 0 && form.username.length < 3 && (
            <p className="mt-1 text-xs text-red-500">Username must be at least 3 characters long</p>
          )}
          {form.username.length > 30 && (
            <p className="mt-1 text-xs text-red-500">Username cannot exceed 30 characters</p>
          )}
          <input
            className="surface w-full rounded-xl px-3 py-2 text-sm outline-none"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="surface w-full rounded-xl px-3 py-2 pr-10 text-sm outline-none"
              placeholder="Password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center muted-text"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error ? <p className="text-xs text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting || isFormIncomplete}
            className="w-full rounded-full bg-(--accent) px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-xs muted-text">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-(--accent)">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}