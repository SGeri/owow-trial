import { TEST_DATABASE_URL } from "./test-database";

process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.AI_GATEWAY_API_KEY ??= "test-gateway-key";
