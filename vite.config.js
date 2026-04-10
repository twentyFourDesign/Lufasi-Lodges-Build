/* eslint-disable no-undef */
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: ["unamazedly-unpetrifying-sherie.ngrok-free.dev", "localhost"],
  },
  build: {
    minify: false,
    rollupOptions: {
      external: ["lucide-react"],
    },
  },
  esbuild: {
    legalComments: "none",
  },
});
