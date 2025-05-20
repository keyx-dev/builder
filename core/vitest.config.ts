import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./src/__tests__/setupTests.ts"],
    globals: true, // Optional: if you want to use globals like describe, it, expect
    environment: "jsdom", // Optional: if you are testing React components
  },
});
