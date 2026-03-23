// Sidebar for chat navigation and management - inspired by Gemini's clean, minimal design
import { Plus, Search, Trash2 } from 'lucide-react'
import { ThemeToggle } from '../common/ThemeToggle.jsx'

export const ChatSidebar = ({
  chats,
  search,
  onSearchChange,
  selectedChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}) => (
  <div className="glass-panel flex h-full flex-col rounded-[2rem] p-4">
    {/* Header section - compact and clean */}
    <div className="mb-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] muted-text">Assistant</p>
        <h1 className="text-lg font-semibold">Control Hub</h1>
      </div>
      <ThemeToggle />
    </div>

    {/* Search bar - streamlined */}
    <div className="surface mb-3 flex items-center gap-2 rounded-full px-3 py-1.5">
      <Search className="h-4 w-4 muted-text" />
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search chats"
        className="w-full bg-transparent outline-none text-sm"
      />
    </div>

    {/* New Chat button - smaller, more compact */}
    <button
      type="button"
      onClick={onNewChat}
      className="mb-3 rounded-full bg-(--accent) px-3 py-2 text-xs font-semibold text-white hover:bg-(--accent-strong) transition-colors"
    >
      <Plus className="mr-1.5 inline h-3.5 w-3.5" />
      New chat
    </button>

    {/* Chat list - compact with better previews */}
    <div className="mb-4 flex-1 space-y-1.5 overflow-auto">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className={`surface group w-full rounded-lg px-3 py-2 text-left transition-all ${
            selectedChatId === chat.id ? 'ring-2 ring-(--accent)' : 'hover:bg-(--surface)'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              onClick={() => onSelectChat(chat.id)}
              className="min-w-0 flex-1 text-left"
            >
              {/* Chat title */}
              <p className="truncate text-sm font-medium leading-tight">{chat.title}</p>
              {/* Chat preview - user message first for better context */}
              <p className="mt-0.5 truncate text-xs muted-text line-clamp-1">
                {chat.lastMessagePreview || 'No messages yet'}
              </p>
            </button>
            {/* Delete button - appears on hover */}
            <button
              type="button"
              onClick={() => onDeleteChat(chat.id)}
              className="rounded-md p-1 text-(--danger) opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)
