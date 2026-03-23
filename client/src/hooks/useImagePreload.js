/**
 * useImagePreload Hook
 * Preloads images on component mount for faster display
 * Useful for critical images that should load immediately
 */
import { useEffect } from 'react'

export const useImagePreload = (imageUrls = []) => {
  useEffect(() => {
    // Verify if browser supports Image
    if (typeof Image === 'undefined') return

    // Preload each image
    imageUrls.forEach((url) => {
      if (url) {
        const img = new Image()
        img.src = url
      }
    })
  }, [imageUrls])
}
