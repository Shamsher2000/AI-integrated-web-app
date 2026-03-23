// The root render tree wires together Redux, React Query, routing, and the app-level context.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AppContextProvider } from './context/AppContext.jsx'
import { queryClient } from './lib/queryClient.js'
import { store, persistor } from './store/store.js'
import './index.css'

// Performance monitoring in development
if (import.meta.env.DEV) {
  // Log Web Vitals for debugging
  if (
    typeof window !== 'undefined' &&
    'PerformanceObserver' in window
  ) {
    try {
      // Monitor Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        console.debug('📊 LCP:', lastEntry.renderTime || lastEntry.loadTime)
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // Monitor Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            console.debug('📊 CLS:', clsValue)
          }
        }
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      // Monitor First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        for (const entry of entries) {
          console.debug('📊 FID:', entry.processingDuration)
        }
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
    } catch (e) {
      // Silently fail if PerformanceObserver not available
    }
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <AppContextProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AppContextProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
