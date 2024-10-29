import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remix()],
  server: {
    hmr: {
      host: "localhost",
      protocol: "ws",
    },
  },
  resolve: {
    alias: {
      "@": "/app",
    },
  },
});
