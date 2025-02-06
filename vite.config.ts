import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import { createRoutesFromFolders } from "@remix-run/v1-route-convention";

export default defineConfig({
  plugins: [
    remix({
      appDirectory: "app",
      buildDirectory: "build",
      ssr: true,
      routes(defineRoutes) {
        return createRoutesFromFolders(defineRoutes);
      },
    }),
  ],
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
  optimizeDeps: {
    include: [
      "@radix-ui/react-icons",
      "@radix-ui/react-navigation-menu",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "@radix-ui/react-toast",
      "lucide-react",
      "@radix-ui/react-slot",
      "@prisma/client",
      "@radix-ui/react-label",
      "@radix-ui/react-separator",
      "@radix-ui/react-accordion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-slider",
    ],
  },
});
