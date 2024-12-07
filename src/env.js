import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/*eslint sort-keys: "error"*/
export const env = createEnv({
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },
  emptyStringAsUndefined: true,
  runtimeEnv: {
    AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
    AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    REDEMPTION_CODE_PRIVATE_KEY: process.env.REDEMPTION_CODE_PRIVATE_KEY,
  },
  server: {
    AUTH_DISCORD_ID: z.string(),
    AUTH_DISCORD_SECRET: z.string(),
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
    REDEMPTION_CODE_PRIVATE_KEY: z.string(),
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
