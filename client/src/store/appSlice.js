import { createSlice } from '@reduxjs/toolkit'

// Single consolidated app slice: cleaner, easier to maintain, faster updates
// Combines auth + ui logic into one reducer
// Detect system theme preference on app initialization
const getSystemTheme = () => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const appSlice = createSlice({
  name: 'app',
  initialState: {
    // Auth state
    token: '',
    user: null,

    // UI state - initialize with system theme on first load
    theme: 'system', // Will resolve to actual system preference via AppContext
    selectedChatId: null,
    temporaryMode: false,
    composerFullScreen: false,
  },

  reducers: {
    // Auth actions
    setSession: (state, action) => {
      state.token = action.payload.token
      state.user = action.payload.user
      // On login, use user's saved theme preference (or system if not set)
      if (action.payload.user?.preferences?.theme) {
        state.theme = action.payload.user.preferences.theme
      } else {
        // First-time users: set to 'system' which AppContext will resolve
        state.theme = 'system'
      }
    },

    setUser: (state, action) => {
      state.user = action.payload
    },

    clearSession: (state) => {
      state.token = ''
      state.user = null
      // Also clear chat UI state on logout
      state.selectedChatId = null
      state.temporaryMode = false
      state.composerFullScreen = false
    },

    // UI actions
    setTheme: (state, action) => {
      state.theme = action.payload
    },

    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
    },

    setSelectedChatId: (state, action) => {
      state.selectedChatId = action.payload
    },

    setTemporaryMode: (state, action) => {
      state.temporaryMode = action.payload
    },

    setComposerFullScreen: (state, action) => {
      state.composerFullScreen = action.payload
    },

    resetChatUiState: (state) => {
      state.selectedChatId = null
      state.temporaryMode = false
      state.composerFullScreen = false
    },
  },
})

export const {
  // Auth actions
  setSession,
  setUser,
  clearSession,
  // UI actions
  setTheme,
  toggleTheme,
  setSelectedChatId,
  setTemporaryMode,
  setComposerFullScreen,
  resetChatUiState,
} = appSlice.actions

export const appReducer = appSlice.reducer
