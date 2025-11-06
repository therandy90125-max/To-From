import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Spring Boot를 통한 요청 (기본)
      "/api": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        // Flask로 직접 연결이 필요한 경우를 위한 fallback
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Spring Boot 연결 실패, Flask로 직접 연결 시도...');
          });
        }
      },
      // Flask 직접 연결 (백업용)
      "/api/flask": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/flask/, '/api')
      }
    }
  }
});
