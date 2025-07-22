import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("firebase") || id.includes("@firebase")) {
            return "firebase";
          }

          if (
            id.includes("react-dom") ||
            id.includes("react-router") ||
            id.includes("@reduxjs") ||
            id.includes("react-redux") ||
            id.includes("redux-persist") ||
            /node_modules\/(react|scheduler)\//.test(id)
          ) {
            return "vendor";
          }
        },
      },
    },
  },
});
