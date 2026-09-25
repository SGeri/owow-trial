import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Validated environment. Import from `@/env` in app/server code.
 * Prisma CLI scripts keep using `process.env` + dotenv (outside Next).
 *
 * @see https://env.t3.gg/docs/nextjs
 */
export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.url(),
    AI_GATEWAY_API_KEY: z.string().min(1),
    /** Optional Gateway model id override (e.g. `openai/gpt-4o-mini`). */
    AI_CHAT_MODEL: z
      .string()
      .min(1)
      .refine((value) => value.includes("/"), {
        message: 'Expected a Gateway id like "openai/gpt-4o-mini"',
      })
      .optional(),
  },
  client: {},
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
    AI_CHAT_MODEL: process.env.AI_CHAT_MODEL,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
});
