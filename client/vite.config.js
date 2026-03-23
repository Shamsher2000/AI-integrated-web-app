import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 4173,
  },
  
  // Build optimization for production
  build: {
    // Target modern browsers for smaller output
    target: 'esnext',
    
    // Minify with esbuild (fastest)
    minify: 'esbuild',
    
    // Rollup options for better code splitting
    rollupOptions: {
      output: {
        // Manual chunks for better caching and parallel loading
        manualChunks: {
          // Vendor chunks - split dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          'vendor-ui': ['lucide-react', 'react-markdown', 'highlight.js'],
        },
      },
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 500,
    
    // Report compressed size for better visibility
    reportCompressedSize: true,
  },
  
  // Optimization hints
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@reduxjs/toolkit',
      'react-redux',
      'redux-persist',
    ],
  },
})
