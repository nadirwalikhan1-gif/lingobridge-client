import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  console.log('VITE_AGORA_APP_ID at build time:', env.VITE_AGORA_APP_ID ? env.VITE_AGORA_APP_ID.substring(0, 6) + '...' : 'MISSING')
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5174,
    },
    build: {
      rollupOptions: {
        output: {
          // ─── Manual vendor chunks ───────────────────────────────────────
          // Splitting heavy, rarely-changing deps into their own files so
          // browsers can cache them independently of app code changes.
          manualChunks(id) {
            // Agora SDK — very heavy (~600 kB), only used in CallRoom
            if (id.includes('agora-rtc-sdk-ng')) return 'vendor-agora'

            // Recharts — only used in admin SessionsDonutChart
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) {
              return 'vendor-charts'
            }

            // Lucide icons — 34 files import from it, separate from app code
            if (id.includes('lucide-react')) return 'vendor-icons'

            // React core — framework, changes least often
            if (id.includes('node_modules/react/') ||
                id.includes('node_modules/react-dom/') ||
                id.includes('node_modules/scheduler/')) {
              return 'vendor-react'
            }

            // React Router
            if (id.includes('react-router')) return 'vendor-router'

            // Supabase + auth dependencies
            if (id.includes('@supabase')) return 'vendor-supabase'

            // TanStack Query
            if (id.includes('@tanstack')) return 'vendor-query'

            // Socket.IO client
            if (id.includes('socket.io-client') ||
                id.includes('engine.io-client')) {
              return 'vendor-socket'
            }

            // Everything else in node_modules → generic vendor chunk
            if (id.includes('node_modules')) return 'vendor'
          },

          entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
          chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        }
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/__tests__/setup.js'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
      },
    },
  }
})
