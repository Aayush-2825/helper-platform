import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
      "@features": path.resolve(process.cwd(), "src/features"),
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"],
  },
});
