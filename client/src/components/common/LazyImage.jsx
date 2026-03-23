/**
 * LazyImage Component
 * Optimized image loading with lazy loading, blur-up effect, and error handling
 * Reduces initial page load by deferring off-screen image loads
 */
import { useState, useCallback } from 'react'

export const LazyImage = ({
  src,
  alt,
  className = '',
  style = {},
  width=null,
  height=null,
  placeholder = true,
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
  }, [])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoaded(true)
  }, [])

  if (hasError) {
    return (
      <div
        className={`bg-(--surface) flex items-center justify-center ${className}`}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : '100%',
          ...style,
        }}
        role="img"
        aria-label={`${alt} (failed to load)`}
      />
    )
  }

  return (
    <>
      {placeholder && !isLoaded && (
        <div
          className={`absolute inset-0 bg-(--surface) blur-sm animate-pulse ${className}`}
          style={{
            width: width ? `${width}px` : '100%',
            height: height ? `${height}px` : '100%',
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : '100%',
          ...style,
        }}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
      />
    </>
  )
}
