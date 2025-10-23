import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const backendTarget = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5172,
    proxy: {
      "/chatkit": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/tasks": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/opportunities": {
        target: backendTarget,
        changeOrigin: true,
      },
    },
    allowedHosts: [
      ".ngrok.io",
      ".trycloudflare.com",
    ],
  },
});

