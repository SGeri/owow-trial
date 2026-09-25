import { beforeEach, describe, expect, it, vi } from "vitest";

const { testEnv } = vi.hoisted(() => ({
  testEnv: {
    NODE_ENV: "test" as const,
    DATABASE_URL: "postgresql://owow:owow@localhost:5432/owow_test",
    AI_GATEWAY_API_KEY: "test-gateway-key",
    AI_CHAT_MODEL: undefined as string | undefined,
  },
}));

vi.mock("@/env", () => ({
  env: testEnv,
}));

import { ai, chatModel } from "./client";
import {
  AI_MODELS,
  AI_MODEL_FALLBACKS,
  gatewayProviderOptions,
} from "./models";

describe("chat models", () => {
  beforeEach(() => {
    testEnv.AI_CHAT_MODEL = undefined;
  });

  it("keeps a stable guardrail model id", () => {
    expect(AI_MODELS.guardrail).toBe("openai/gpt-4o-mini-fast");
    expect(AI_MODELS.chat).toBe("openai/gpt-4o-mini");
  });

  it("uses the default chat model, then AI_CHAT_MODEL, then an explicit override", () => {
    const spy = vi.spyOn(ai, "chat");

    chatModel();
    expect(spy).toHaveBeenLastCalledWith(AI_MODELS.chat);

    testEnv.AI_CHAT_MODEL = "openai/gpt-4.1";
    chatModel();
    expect(spy).toHaveBeenLastCalledWith("openai/gpt-4.1");

    chatModel("google/gemini-2.5-flash");
    expect(spy).toHaveBeenLastCalledWith("google/gemini-2.5-flash");
  });

  it("exposes gateway model fallbacks for providerOptions", () => {
    expect(AI_MODEL_FALLBACKS).toEqual([
      "google/gemini-2.5-flash",
      "anthropic/claude-haiku-4.5",
    ]);
    expect(gatewayProviderOptions()).toEqual({
      gateway: { models: [...AI_MODEL_FALLBACKS] },
    });
    expect(
      gatewayProviderOptions(["openai/gpt-4.1-mini" as const]),
    ).toEqual({
      gateway: { models: ["openai/gpt-4.1-mini"] },
    });
  });
});
