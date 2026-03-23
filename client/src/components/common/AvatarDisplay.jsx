/**
 * Avatar Display Component
 * Optimized with lazy loading for faster page loads
 */
import { useMemo } from 'react'
import { getAvatarImageUrl } from '../../lib/avatars.js'
import { UserRound } from 'lucide-react'
import { LazyImage } from './LazyImage.jsx'

export const AvatarDisplay = ({ avatarValue = 'spark', size = 48, className = '' }) => {
  const imageUrl = useMemo(() => getAvatarImageUrl(avatarValue), [avatarValue])

  if (!imageUrl) {
    return (
      <div
        className={`inline-flex items-center justify-center bg-(--surface) rounded-lg ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
        role="img"
        aria-label={`User avatar: ${avatarValue}`}
      >
        <UserRound className="w-6 h-6 muted-text" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center rounded-lg overflow-hidden" style={{ width: `${size}px`, height: `${size}px` }}>
      <LazyImage
        src={imageUrl}
        alt={`User avatar: ${avatarValue}`}
        className={`w-full h-full object-cover ${className}`}
        width={size}
        height={size}
        placeholder={true}
      />
    </div>
  )
}
