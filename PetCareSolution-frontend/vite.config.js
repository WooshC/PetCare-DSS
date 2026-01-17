import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Deshabilitar sourcemaps para evitar exponer código fuente
    esbuild: {
      drop: ['console', 'debugger'], // Elimina todos los console.* y debugger del build
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})