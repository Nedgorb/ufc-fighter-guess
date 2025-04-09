// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify('pk_test_dGVhY2hpbmctZWxlcGhhbnQtNDguY2xlcmsuYWNjb3VudHMuZGV2JA')
  },
  server: {
    historyApiFallback: true
  },
  build: {
    outDir: 'dist'
  }
})
