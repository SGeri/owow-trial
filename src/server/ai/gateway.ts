import { createGateway } from "ai";

import { env } from "@/env";

export type AiGateway = ReturnType<typeof createGateway>;

export type CreateAiGatewayOptions = Omit<
  NonNullable<Parameters<typeof createGateway>[0]>,
  "apiKey"
> & {
  /** Defaults to `env.AI_GATEWAY_API_KEY`. Prefer that in production. */
  apiKey?: string;
};

/** Prefer the shared `ai` singleton from `./client` in application code. */
export function createAiGateway(
  options: CreateAiGatewayOptions = {},
): AiGateway {
  const { apiKey = env.AI_GATEWAY_API_KEY, ...rest } = options;

  return createGateway({
    apiKey,
    ...rest,
  });
}
