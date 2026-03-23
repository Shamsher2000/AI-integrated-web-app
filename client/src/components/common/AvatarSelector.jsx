/**
 * Avatar Selector Component
 * Optimized with lazy loading and loading states
 * Only loads images as user scrolls or interacts
 */
import { useMemo } from 'react'
import { getAvailableAvatars } from '../../lib/avatars.js'
import { LazyImage } from './LazyImage.jsx'

export const AvatarSelector = ({ selectedAvatar = 'spark', onChange }) => {
  const avatars = useMemo(() => getAvailableAvatars(), [])

  return (
    <div>
      <label className="mb-3 block text-sm font-medium" style={{ color: 'var(--text)' }}>
        Select Avatar
      </label>
      <div className="grid grid-cols-4 gap-3">
        {avatars.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onChange(avatar.id)}
            className={`rounded-lg p-2 transition-all overflow-hidden relative group flex flex-col items-center justify-center ${
              selectedAvatar === avatar.id
                ? 'ring-2 ring-(--accent) bg-(--surface)'
                : 'hover:bg-(--surface) border border-(--border) hover:border-(--accent)'
            }`}
            title={avatar.name}
          >
            <div className="flex justify-center items-center relative w-full h-20 rounded mb-2 overflow-hidden">
              <LazyImage
                src={avatar.imageUrl}
                alt={avatar.name}
                className="w-full h-full object-cover"
                width={80}
                height={80}
                placeholder={true}
              />
            </div>
            <p className="text-xs text-center font-medium truncate">{avatar.name}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
