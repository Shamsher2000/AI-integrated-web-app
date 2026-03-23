// Login updates the Redux auth slice, which makes the rest of the app reactive immediately.
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api.js'
import { useAppDispatch, useAppSelector } from '../store/hooks.js'
import { setSession, setTheme } from '../store/appSlice.js'

export const LoginPage = () => {
  const dispatch = useAppDispatch()
  const token = useAppSelector((state) => state.app.token)
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (token) {
    return <Navigate to="/chat" replace />
  }

  const isFormIncomplete = !form.email.trim() || !form.password.trim()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    if (isFormIncomplete) {
      setError('Please enter both email and password.')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: form,
      })

      // Set auth session (token + user)
      dispatch(setSession(response.data))
      
      // Set theme immediately so it's applied before navigation
      if (response.data.user?.preferences?.theme) {
        dispatch(setTheme(response.data.user.preferences.theme))
      }
      
      navigate('/chat')
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-panel w-full max-w-md rounded-[2rem] p-8">
        <p className="text-xs uppercase tracking-[0.24em] muted-text">Welcome back</p>
        <h1 className="mt-3 text-4xl font-semibold">Sign in</h1>
        <p className="mt-3 muted-text">
          If this is your first time here, create an account from the Register page and then sign in with your email.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            className="surface w-full rounded-2xl px-4 py-3 outline-none"
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
              className="surface w-full rounded-2xl px-4 py-3 pr-14 outline-none"
              placeholder="Password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-3 flex items-center muted-text"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting || isFormIncomplete}
            className="w-full rounded-full bg-(--accent) px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-sm muted-text">
          Need an account?{' '}
          <Link to="/register" className="font-semibold text-(--accent)">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
