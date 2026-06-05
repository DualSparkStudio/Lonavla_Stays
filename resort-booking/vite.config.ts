import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { razorpayApiPlugin } from './vite-plugins/razorpay-api'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [mode === 'development' ? razorpayApiPlugin() : null, react()].filter(Boolean),
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@fullcalendar')) return 'fullcalendar';
          if (id.includes('@supabase')) return 'supabase';
          if (id.includes('node_modules')) {
            if (id.includes('react-router') || id.includes('react-dom') || /[/\\]react[/\\]/.test(id)) {
              return 'react-vendor';
            }
            if (id.includes('date-fns')) return 'date-fns';
            if (id.includes('@headlessui')) return 'headlessui';
          }
        },
      },
    },
  },
}))
