// The profile summary stays at the top-right so account actions are easy to reach from chat.
import { LogOut, Settings, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AvatarDisplay } from './AvatarDisplay.jsx'

export const ProfileSummary = ({ user, onLogout }) => (
  <div className="glass-panel flex items-center gap-3 rounded-[1.75rem] px-4 py-3">
    {/* Avatar Display */}
    {user?.avatar?.value ? (
      <AvatarDisplay avatarValue={user.avatar.value} size={44} />
    ) : (
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-(--surface-soft)">
        <UserRound className="h-5 w-5" />
      </div>
    )}

    <div className="min-w-0">
      <p className="truncate font-semibold">@{user?.username || 'account'}</p>
      <p className="truncate text-sm muted-text">{user?.email || 'Signed-in user'}</p>
    </div>

    <div className="flex items-center gap-2">
      <Link
        to="/profile"
        className="rounded-full border border-(--border) px-3 py-2 text-sm hover:bg-(--surface) transition-colors"
        title="Edit profile"
      >
        <Settings className="mr-2 inline h-4 w-4" />
        Profile
      </Link>
      <button
        type="button"
        onClick={onLogout}
        className="rounded-full border border-(--border) px-3 py-2 text-sm hover:bg-(--surface) transition-colors"
        title="Sign out"
      >
        <LogOut className="mr-2 inline h-4 w-4" />
        Logout
      </button>
    </div>
  </div>
)
