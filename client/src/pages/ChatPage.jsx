// ChatPage keeps server data in React Query, global UI/auth in Redux, and transient draft messages locally.
import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Eraser } from 'lucide-react'
import { apiFetch } from '../lib/api.js'
import { useChatQueries } from '../hooks/useChatQueries.js'
import { useMessageHandler } from '../hooks/useMessageHandler.js'
import { ChatComposer } from '../components/chat/ChatComposer.jsx'
import { ChatMessageList } from '../components/chat/ChatMessageList.jsx'
import { ChatSidebar } from '../components/chat/ChatSidebar.jsx'
import { ProfileSummary } from '../components/common/ProfileSummary.jsx'
import { AppShell } from '../components/layout/AppShell.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import {
  clearSession,
  setUser,
  setTheme,
  setSelectedChatId,
  setTemporaryMode,
} from '../store/appSlice.js'
import { useAppDispatch, useAppSelector } from '../store/hooks.js'

export const ChatPage = () => {
  // Redux state management
  const dispatch = useAppDispatch()
  const token = useAppSelector((state) => state.app.token)
  const user = useAppSelector((state) => state.app.user)
  const selectedChatId = useAppSelector((state) => state.app.selectedChatId)
  const temporaryMode = useAppSelector((state) => state.app.temporaryMode)

  // Local component state
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const { isOnline } = useAppContext()
  const queryClient = useQueryClient()

  // Custom hooks for managing queries and messages
  const { profileQuery, chatsQuery, activeChatQuery } = useChatQueries({
    token,
    selectedChatId,
    temporaryMode,
    searchTerm: search,
  })

  const {
    messages,
    isStreaming,
    completedResponseCount,
    submitMessage,
    clearMessages,
    setMessagesFromServer,
    abortStream,
  } =
    useMessageHandler({
      token,
      selectedChatId,
      temporaryMode,
      onStatusMessage: setStatusMessage,
      // Critical: Handle new chat creation for follow-up questions
      onChatCreated: (newChatId) => {
        dispatch(setSelectedChatId(newChatId))
        queryClient.invalidateQueries({ queryKey: ['chats'] })
      },
    })

  // Sync user profile to Redux when loaded
  // Always update Redux whenever profileQuery completes with fresh data
  useEffect(() => {
    if (profileQuery.data) {
      // Always sync fresh profile data to Redux
      // Don't use deep comparison - just update it
      dispatch(setUser(profileQuery.data))
      
      // Also sync theme preference from user data to ensure UI is updated
      if (profileQuery.data.preferences?.theme) {
        dispatch(setTheme(profileQuery.data.preferences.theme))
      }
    }
  }, [dispatch, profileQuery.data])

  // Ensure profile query refetches on mount to get fresh data after profile updates
  useEffect(() => {
    // Refetch when entering chat page to ensure we have latest username/bio
    profileQuery.refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync server messages to local state when active chat changes
  useEffect(() => {
    if (!temporaryMode && activeChatQuery.data?.messages) {
      setMessagesFromServer(activeChatQuery.data.messages)
    }
  }, [activeChatQuery.data, temporaryMode, setMessagesFromServer])

  // Display messages (either from server or temporary mode)
  const displayedMessages = useMemo(() => messages, [messages])

  // Event handlers

  const handleLogout = () => {
    dispatch(clearSession())
  }

  const handleNewChat = () => {
    dispatch(setTemporaryMode(false))
    dispatch(setSelectedChatId(null))
    clearMessages()
    setStatusMessage('')
  }

  const handleSelectChat = (chatId) => {
    dispatch(setTemporaryMode(false))
    dispatch(setSelectedChatId(chatId))
    // Clear old messages immediately to prevent showing wrong chat's context
    // New messages will load when activeChatQuery completes
    clearMessages()
    setStatusMessage('')
  }

  const handleToggleTemporary = (value) => {
    dispatch(setTemporaryMode(value))
    dispatch(setSelectedChatId(null))
    clearMessages()
    setStatusMessage(value ? 'Temporary chat enabled. Messages will not be saved.' : '')
  }

  const handleDeleteChat = async (chatId) => {
    await apiFetch(`/chats/${chatId}`, {
      method: 'DELETE',
      token,
    })

    if (selectedChatId === chatId) {
      dispatch(setSelectedChatId(null))
      clearMessages()
    }

    queryClient.invalidateQueries({ queryKey: ['chats'] })
  }

  const handleClear = async () => {
    if (temporaryMode) {
      clearMessages()
      setStatusMessage('Temporary chat cleared.')
      return
    }

    if (!selectedChatId) {
      clearMessages()
      return
    }

    await apiFetch(`/chats/${selectedChatId}/clear`, {
      method: 'POST',
      token,
    })

    clearMessages()
    setStatusMessage('Chat history cleared.')
    queryClient.invalidateQueries({ queryKey: ['chat', selectedChatId] })
    queryClient.invalidateQueries({ queryKey: ['chats'] })
  }

  const handleSubmit = async () => {
    if (!isOnline || isStreaming) {
      return
    }
    if (!draft.trim()) {
      return
    }

    const nextMessage = draft
    setDraft('')
    await submitMessage(nextMessage)
  }

  return (
    <AppShell
      sidebar={
        <ChatSidebar
          chats={chatsQuery?.data?.items || []}
          search={search}
          onSearchChange={setSearch}
          selectedChatId={selectedChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
        />
      }
    >
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <div className="flex items- justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] muted-text">Conversation</p>
            <h2 className="text-2xl font-semibold">
              {temporaryMode
                ? 'Temporary chat'
                : activeChatQuery.data?.chat?.title || 'New conversation'}
            </h2>
            {statusMessage ? <p className="mt-2 text-sm muted-text">{statusMessage}</p> : null}
          </div>

          <ProfileSummary user={user} onLogout={handleLogout} />
        </div>

        <div className="glass-panel flex min-h-0 flex-1 flex-col rounded-[2rem] p-4">
          <div className="mb-4 flex items-center justify-between gap-4 border-b border-(--border) px-2 pb-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium muted-text">
                {temporaryMode
                  ? 'Temporary chat'
                  : activeChatQuery.data?.chat?.title || 'New conversation'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="rounded-full border border-(--border) px-4 py-2 text-sm"
            >
              <Eraser className="mr-2 inline h-4 w-4" />
              Clear chat
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            <ChatMessageList
              messages={displayedMessages}
              isStreaming={isStreaming}
              completedResponseCount={completedResponseCount}
            />
          </div>

          <div className="mt-4 shrink-0">
            <ChatComposer
              value={draft}
              onChange={setDraft}
              onSubmit={handleSubmit}
              onAbort={abortStream}
              isStreaming={isStreaming}
              isOnline={isOnline}
              temporaryMode={temporaryMode}
              onToggleTemporary={handleToggleTemporary}
            />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
