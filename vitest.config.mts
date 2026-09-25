import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/server/schemas/**",
        "src/server/controllers/sessions.ts",
        "src/server/chat/stream-chat.ts",
        "src/server/chat/context.ts",
      ],
      thresholds: {
        lines: 70,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          setupFiles: ["./src/test/setup.ts"],
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.integration.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "component",
          environment: "jsdom",
          setupFiles: ["./src/test/setup.ts", "./src/test/setup-dom.ts"],
          include: ["src/**/*.test.tsx"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          environment: "node",
          setupFiles: ["./src/test/setup.ts"],
          globalSetup: ["./src/test/global-setup.ts"],
          fileParallelism: false,
          include: ["src/**/*.integration.test.ts"],
          hookTimeout: 60_000,
          testTimeout: 30_000,
        },
      },
    ],
  },
});
