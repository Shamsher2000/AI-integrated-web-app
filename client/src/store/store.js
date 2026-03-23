import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { appReducer } from './appSlice.js'

// Simplified store configuration with automatic persistence
// All app state (auth + ui) managed in one reducer
const persistConfig = {
  key: 'mern-ai-root',
  storage,
  // Only persist auth and essential UI state
  whitelist: ['token', 'user', 'theme', 'selectedChatId'],
}

const persistedReducer = persistReducer(persistConfig, appReducer)

export const store = configureStore({
  reducer: {
    app: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // redux-persist requires this to ignore persist actions
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)