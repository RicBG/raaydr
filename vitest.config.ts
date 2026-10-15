import path from "node:path";
import { defineConfig } from "vitest/config";

// Lets a test import a module that itself uses the "@/" alias (app/sitemap.ts),
// the same way tsconfig.json resolves it. Nothing else is configured.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
});
