/** Isolated Postgres database for Vitest and Playwright. Never the dev `owow` DB. */
export const TEST_DATABASE_NAME = "owow_test";

export const ADMIN_DATABASE_URL =
  process.env.TEST_ADMIN_DATABASE_URL ??
  "postgresql://owow:owow@localhost:5432/owow";

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  `postgresql://owow:owow@localhost:5432/${TEST_DATABASE_NAME}?schema=public`;
