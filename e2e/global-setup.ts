import { ensureTestDatabase, seedTestDatabase } from "../src/test/ensure-db";

export default async function globalSetup() {
  await ensureTestDatabase();
  await seedTestDatabase();
}
