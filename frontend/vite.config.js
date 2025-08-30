import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const FRONTEND_PORT = Number(env.FRONTEND_PORT || 5173)
  const BACKEND_PORT  = Number(env.BACKEND_PORT  || 5004)
  const VITE_API_URL  = env.VITE_API_URL || `http://localhost:${BACKEND_PORT}`

  return defineConfig({
    plugins: [react()],
    server: {
      port: FRONTEND_PORT,
      strictPort: true,
      proxy: {
        // Any frontend fetch to `/api/...` will be forwarded to the backend
        '/api': {
          target: VITE_API_URL,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: FRONTEND_PORT,
      strictPort: true,
    },
    define: {
      __BACKEND_PORT__: JSON.stringify(BACKEND_PORT),
      __FRONTEND_PORT__: JSON.stringify(FRONTEND_PORT),
    },
  })
}
