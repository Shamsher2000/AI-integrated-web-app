import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../lib/api.js'
import { useDebounce } from './useDebounce.js'

/**
 * Hook to manage all chat-related queries
 * Handles fetching chats, active chat, and user profile
 * Automatically debounces search queries
 */
export const useChatQueries = ({ token, selectedChatId, temporaryMode, searchTerm }) => {
  // Debounce search to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Fetch user profile
  const profileQuery = useQuery({
    queryKey: ['me', token],
    enabled: Boolean(token),
    // Always refetch on mount to get fresh profile data (important for sync across pages)
    staleTime: 0,
    // Force refetch when component mounts
    refetchOnMount: 'stale',
    // Refetch when window regains focus to sync profile updates from other tabs
    refetchOnWindowFocus: 'stale',
    queryFn: async () => {
      const response = await apiFetch('/auth/me', { token })
      return response.data.user
    },
  })

  // Fetch chats list (with search)
  const chatsQuery = useQuery({
    queryKey: ['chats', debouncedSearchTerm, token],
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await apiFetch(
        `/chats?search=${encodeURIComponent(debouncedSearchTerm)}`,
        { token },
      )
      return response.data
    },
  })

  // Fetch active chat details and messages
  const activeChatQuery = useQuery({
    queryKey: ['chat', selectedChatId, token],
    enabled: Boolean(token) && Boolean(selectedChatId) && !temporaryMode,
    queryFn: async () => {
      const response = await apiFetch(`/chats/${selectedChatId}`, { token })
      return response.data
    },
  })

  return {
    profileQuery,
    chatsQuery,
    activeChatQuery,
    debouncedSearchTerm,
  }
}
