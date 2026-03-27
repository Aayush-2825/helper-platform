import { defineConfig, globalIgnores } from "eslint/config";
import { config as baseConfig } from "@repo/eslint-config/base";

export default defineConfig([
  globalIgnores([
    "**/dist/**",
    "**/.turbo/**",
    "**/coverage/**",
    "**/node_modules/**",
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/*.json",
    "**/*.md",
  ]),
  ...baseConfig,
]);
