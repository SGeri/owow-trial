import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { ensureTestDatabase, seedTestDatabase } from "../src/test/ensure-db";

const exec = promisify(execFile);

export default async function globalSetup() {
  await exec("bash", ["scripts/ensure-playwright-libs.sh"], {
    cwd: process.cwd(),
  });
  await ensureTestDatabase();
  await seedTestDatabase();
}
