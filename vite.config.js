import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      // ส่งต่อคำขอ API ทั้งหมดไปยัง Node.js/Express backend ที่พอร์ต 4000
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true
      }
    }
  }
});
