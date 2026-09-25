import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Client } from "pg";

import {
  ADMIN_DATABASE_URL,
  TEST_DATABASE_NAME,
  TEST_DATABASE_URL,
} from "./test-database";

const exec = promisify(execFile);

function assertTestDatabase(url: string) {
  const parsed = new URL(url);
  if (parsed.pathname !== `/${TEST_DATABASE_NAME}`) {
    throw new Error(
      `Refusing to reset ${parsed.pathname}. Tests only reset ${TEST_DATABASE_NAME}.`,
    );
  }
}

async function run(command: string, args: string[], databaseUrl: string) {
  try {
    return await exec(command, args, {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: databaseUrl },
    });
  } catch (error) {
    const failure = error as { stderr?: string; stdout?: string; message?: string };
    throw new Error(
      `${command} ${args.join(" ")} failed:\n${failure.stderr || failure.stdout || failure.message}`,
    );
  }
}

async function schemaSql(databaseUrl: string) {
  const { stdout } = await run(
    "pnpm",
    [
      "exec",
      "prisma",
      "migrate",
      "diff",
      "--from-empty",
      "--to-schema",
      "prisma/schema.prisma",
      "--script",
    ],
    databaseUrl,
  );
  return stdout;
}

export async function ensureTestDatabase() {
  assertTestDatabase(TEST_DATABASE_URL);

  const admin = new Client({ connectionString: ADMIN_DATABASE_URL });
  await admin.connect();
  try {
    const existing = await admin.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [TEST_DATABASE_NAME],
    );
    if (existing.rowCount === 0) {
      await admin.query(`CREATE DATABASE "${TEST_DATABASE_NAME}"`);
    }
  } finally {
    await admin.end();
  }

  const sql = await schemaSql(TEST_DATABASE_URL);
  const test = new Client({ connectionString: TEST_DATABASE_URL });
  await test.connect();
  try {
    await test.query("DROP SCHEMA IF EXISTS public CASCADE");
    await test.query("CREATE SCHEMA public");
    await test.query(sql);
  } finally {
    await test.end();
  }
}

export async function seedTestDatabase() {
  assertTestDatabase(TEST_DATABASE_URL);
  await run("pnpm", ["exec", "tsx", "prisma/seed.ts"], TEST_DATABASE_URL);
}
