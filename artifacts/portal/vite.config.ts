import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const port = Number(process.env.PORT);
if (!port) throw new Error("PORT is required");

const basePath = process.env.BASE_PATH;
if (!basePath) throw new Error("BASE_PATH is required");

export default defineConfig({
  base: basePath,
  plugins: [react()],
  server: { port, host: "0.0.0.0", allowedHosts: true },
  preview: { port, host: "0.0.0.0", allowedHosts: true },
  build: { outDir: "dist/public", emptyOutDir: true },
});
