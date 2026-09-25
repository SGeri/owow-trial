import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "@/env";

const globalForDb = globalThis as unknown as {
  db: PrismaClient | undefined;
};

function createDb() {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const db = globalForDb.db ?? createDb();

if (env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
