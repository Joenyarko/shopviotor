import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'SHOP VIOTOR',
        short_name: 'SHOP VIOTOR',
        description: 'The ATU Student Marketplace',
        theme_color: '#ffb800',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/shopviotorlogo.jpeg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: '/shopviotorlogo.jpeg',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      }
    })
  ],
  server: {
    host: true,           // listen on all network interfaces
    allowedHosts: 'all',  // allow Cloudflare, ngrok, and any tunnel
  },
})
