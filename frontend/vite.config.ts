import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
<<<<<<< HEAD
  
  server: {
    host: true,
  }
=======
>>>>>>> 8e4f80f3bec2d316a813eacf15e003c20af43cc5
});
