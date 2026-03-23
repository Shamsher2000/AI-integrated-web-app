// Protected routes read auth state from Redux so page access matches login state everywhere.
import { memo } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks.js'

const ProtectedRouteComponent = ({ children }) => {
  const token = useAppSelector((state) => state.app.token)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

export const ProtectedRoute = memo(ProtectedRouteComponent)
