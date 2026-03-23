// App owns only routing. Runtime theme/offline behavior now lives in AppContext.
import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { OfflineBanner } from './components/common/OfflineBanner.jsx'
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx'

// Each page is lazy-loaded so the first bundle stays smaller and secondary routes load on demand.
const ChatPage = lazy(() =>
  import('./pages/ChatPage.jsx').then((module) => ({
    default: module.ChatPage,
  })),
)
const LoginPage = lazy(() =>
  import('./pages/LoginPage.jsx').then((module) => ({
    default: module.LoginPage,
  })),
)
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage.jsx').then((module) => ({
    default: module.ProfilePage,
  })),
)
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage.jsx').then((module) => ({
    default: module.RegisterPage,
  })),
)

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center px-4">
    <div className="glass-panel rounded-[2rem] px-6 py-4 text-sm muted-text">
      Loading page...
    </div>
  </div>
)

function App() {
  return (
    <div className="min-h-screen">
      <OfflineBanner />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
