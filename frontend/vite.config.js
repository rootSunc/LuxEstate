import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",  // 所有对'/api'路径的请求都会代理到'localhost:3000'服务器
        secure: false, // proxy不会验证SSL证书
      },
    },
  },
  plugins: [react()],
});
