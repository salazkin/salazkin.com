import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  root: "./src",
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "index.js"
      }
    }
  }
});
