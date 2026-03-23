import { AlertCircle, X } from 'lucide-react'

export const ChatErrorMessage = ({ error, onDismiss }) => {
  if (!error) return null

  // Extract user-friendly error message
  const getErrorMessage = () => {
    if (typeof error === 'string') return error

    if (error?.message) {
      // Handle quota exceeded / rate limit errors
      if (
        error.message.includes('quota exceeded') ||
        error.message.includes('quota limit') ||
        error.message.includes('Too many requests')
      ) {
        return '⏱️ API quota limit reached. Please wait a moment and try again later.'
      }
      if (error.message.includes('429') || error.message.includes('rate')) {
        return '⏱️ API quota limit reached. Please wait a moment and try again later.'
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return '🌐 Network connection failed. Please check your internet and try again.'
      }
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return '🔐 Your session expired. Please log in again.'
      }
      if (error.message.includes('authentication') || error.message.includes('API key')) {
        return '🔐 Authentication failed. Please check your settings.'
      }
      if (error.message.includes('temporarily unavailable')) {
        return '🤖 AI service is temporarily unavailable. Please try again later.'
      }
      if (error.message.includes('GEMINI') || error.message.includes('API')) {
        return '🤖 AI service is temporarily unavailable. Please try again later.'
      }
      return error.message
    }

    return 'An unexpected error occurred. Please try again.'
  }

  return (
    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/30">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-900 dark:text-red-200">
            {getErrorMessage()}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            aria-label="Dismiss error"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}

export const ChatMessageError = ({ message }) => {
  return (
    <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/30">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-900 dark:text-red-200">
            {message || 'Failed to send message'}
          </p>
        </div>
      </div>
    </div>
  )
}
