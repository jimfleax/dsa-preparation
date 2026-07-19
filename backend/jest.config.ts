import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.json",
      },
    ],
  },
  moduleNameMapper: {
    // ESM .js → .ts resolution for imports like './lib/db.js'
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^(\\.{1,2}/.*)\\.ts$": "$1",
  },
  testMatch: ["**/__tests__/**/*.test.ts"],
  setupFilesAfterFramework: [],
  setupFiles: ["dotenv/config"],
  testTimeout: 30000, // Real DB + LeetCode API calls need time
  clearMocks: true,
  // Run serially to avoid DB state collisions on shared test database
  maxWorkers: 1,
};

export default config;
