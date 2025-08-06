import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    server: {
      watch: {
        usePolling: true
      }
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        }
      }
    }
  }
})
