import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5179,
    host: true,  // 외부 접근 허용
    strictPort: false,  // 포트가 사용 중이면 자동으로 다음 포트 사용
    proxy: {
      // 백엔드 API 프록시 설정
      '/api': {
        target: 'http://localhost:8080',  // Spring Boot 주소
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path  // /api 그대로 유지
      }
    }
  }
})
