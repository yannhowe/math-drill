import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // Relative assets let the same build work at / and behind a reverse-proxy path.
  base: "./",
  server: { port: 5173 },
});
