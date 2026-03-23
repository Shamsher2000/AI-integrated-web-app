/**
 * Avatar configuration - Individual static images
 * Each avatar is a separate WebP image file
 * Images are imported as Vite modules for optimal bundling
 */
import avatar1 from '../../public/img/avatar_1.webp'
import avatar2 from '../../public/img/avatar__2.webp'
import avatar3 from '../../public/img/avatar_3.webp'
import avatar4 from '../../public/img/avatar_4.webp'
import avatar5 from '../../public/img/avatar_5.webp'
import avatar6 from '../../public/img/avatar__6.webp'
import avatar7 from '../../public/img/avatar_7.webp'
import avatar8 from '../../public/img/avatar_8.webp'

export const AVATAR_PRESETS = {
  spark: {
    name: 'Spark',
    type: 'preset',
    imageUrl: avatar1,
  },
  wave: {
    name: 'Wave',
    type: 'preset',
    imageUrl: avatar2,
  },
  glow: {
    name: 'Glow',
    type: 'preset',
    imageUrl: avatar3,
  },
  solar: {
    name: 'Solar',
    type: 'preset',
    imageUrl: avatar4,
  },
  nova: {
    name: 'Nova',
    type: 'preset',
    imageUrl: avatar5,
  },
  nexus: {
    name: 'Nexus',
    type: 'preset',
    imageUrl: avatar6,
  },
  pulse: {
    name: 'Pulse',
    type: 'preset',
    imageUrl: avatar7,
  },
  zen: {
    name: 'Zen',
    type: 'preset',
    imageUrl: avatar8,
  },
}

export const DEFAULT_AVATAR = 'spark'

/**
 * Get avatar image URL for a given avatar preset
 * @param {string} avatarValue - Avatar preset key
 * @returns {string} Image URL for the avatar
 */
export const getAvatarImageUrl = (avatarValue) => {
  const preset = AVATAR_PRESETS[avatarValue] || AVATAR_PRESETS[DEFAULT_AVATAR]
  return preset.imageUrl
}

/**
 * Get all available avatars for selection
 * @returns {array} List of {id, name, imageUrl} objects
 */
export const getAvailableAvatars = () => {
  return Object.entries(AVATAR_PRESETS).map(([id, preset]) => ({
    id,
    name: preset.name,
    imageUrl: preset.imageUrl,
  }))
}