import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  plugins: [react()],
  test: {
    setupFiles: ["./src/__tests__/setupTests.ts"],
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "Builder",
    },
    rollupOptions: {
      external: ["react"],
    },
    sourcemap: true,
  },
};
