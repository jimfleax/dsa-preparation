import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: false, // We already have a public/manifest.json, so we just use that directly
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"], // Cache all safe static assets
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      proxy: {
        "/api": "http://localhost:3000"
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== "true",
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
  };
});
