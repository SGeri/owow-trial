import { ensureTestDatabase } from "./ensure-db";

export async function setup() {
  await ensureTestDatabase();
}
