// React Query owns server state, while Redux is only used for auth and UI preferences.
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Optimistic UI updates - data is still fresh for 30 seconds
      staleTime: 30_000,
      
      // Don't refetch when window regains focus (reduces API calls)
      refetchOnWindowFocus: false,
      
      // Don't refetch when component remounts if data is fresh
      refetchOnMount: false,
      
      // Don't refetch in the background on intervals
      refetchOnReconnect: false,
      
      // Aggressive retry strategy to handle transient failures
      retry: (failureCount, error) => {
        // Don't retry 4xx errors (validation, auth, not found)
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        
        // Retry up to 3 times for server errors
        return failureCount < 3
      },
      
      // Exponential backoff: 200ms, 800ms, 1600ms
      retryDelay: (attemptIndex) =>
        Math.min(1000 * Math.pow(2, attemptIndex), 30_000),
      
      // Keep data in cache for longer to reduce renders
      gcTime: 10 * 60 * 1000, // 10 minutes
    },

    mutations: {
      // Retry mutations once on network failures
      retry: (failureCount, error) => {
        // Don't retry 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        
        // Retry up to 3 times
        return failureCount < 3
      },
      
      // Exponential backoff for mutations
      retryDelay: (attemptIndex) =>
        Math.min(1000 * Math.pow(2, attemptIndex), 30_000),
    },
  },
})

