import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/web.ts",
    "src/realtime.ts",
    "src/config/index.ts",
    "src/schema/index.ts",
    "src/schema/web.ts",
    "src/schema/realtime.ts",
  ],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  sourcemap: true,
});
