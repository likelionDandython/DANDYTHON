import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      // 개발 중 /api 요청을 백엔드 서버로 넘겨요 (CORS 회피)
      proxy: {
        '/api': { target: env.VITE_PROXY_TARGET || 'http://localhost:8080', changeOrigin: true },
      },
    },
  }
})
