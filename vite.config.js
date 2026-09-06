import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          chart: ['chart.js', 'react-chartjs-2'],
          sweetalert: ['sweetalert2'],
          socketio: ['socket.io-client']
        }
      }
    }
  }
})
