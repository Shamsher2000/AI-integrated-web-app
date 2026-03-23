// Offline status comes from the shared app context so every part of the UI sees the same network state.
import { WifiOff } from 'lucide-react'
import { useAppContext } from '../../context/AppContext.jsx'

export const OfflineBanner = () => {
  const { isOnline } = useAppContext()

  if (isOnline) {
    return null
  }

  return (
    <div className="sticky top-0 z-50 border-b border-amber-400/40 bg-amber-100 px-4 py-3 text-sm text-amber-900">
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        <WifiOff className="h-4 w-4" />
        Connection lost. Sending is disabled until you are back online.
      </div>
    </div>
  )
}
