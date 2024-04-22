// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";

// // https://vitejs.dev/config/
// export default defineConfig({
//   server: {
//     proxy: {
//       "/api": {
//         target: "http://localhost:3000",  // 所有对'/api'路径的请求都会代理到'localhost:3000'服务器
//         secure: false, // proxy不会验证SSL证书
//       },
//     },
//   },
//   plugins: [react()],
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // 确保输出目录是 'dist'
  },
  // 移除了server.proxy配置，因为在生产环境中不再需要
});
