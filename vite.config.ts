import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    remix({
      routes(defineRoutes) {
        return defineRoutes((route) => {
          route("/simulate", "routes/frontend/simulate/index.tsx");
          route("/", "routes/frontend/home/index.tsx");
          route("generate-tree", "routes/frontend/generate-tree/index.tsx");
          route("/api/add-random-ballots", "routes/api/add-random-ballots.ts");
          route(
            "/api/generate-merkle-tree",
            "routes/api/generate-merkle-tree.ts"
          );
          route("/api/delete-all-ballots", "routes/api/delete-all-ballots.ts");
          route("/api/generate-proof", "routes/api/generate-proof.ts");
        });
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
});
