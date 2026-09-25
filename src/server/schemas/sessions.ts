import { z } from "zod";

export const sessionIdSchema = z.string().min(1).max(64);
