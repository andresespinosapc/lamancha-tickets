import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/*eslint sort-keys: "error"*/
export const env = createEnv({
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },
  emptyStringAsUndefined: true,
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    EVENT_NAME: process.env.EVENT_NAME,
    FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL,
    GLOBAL_SERVER_SYNC_API_KEY: process.env.GLOBAL_SERVER_SYNC_API_KEY,
    GLOBAL_SERVER_URL: process.env.GLOBAL_SERVER_URL,
    HASHIDS_SALT: process.env.HASHIDS_SALT,
    JWT_SECRET: process.env.JWT_SECRET,
    LOCAL_SERVER_ID: process.env.LOCAL_SERVER_ID,
    MAX_TICKETS_PER_SELLER: process.env.MAX_TICKETS_PER_SELLER,
    NODE_ENV: process.env.NODE_ENV,
    REDEMPTION_CODE_PRIVATE_KEY: process.env.REDEMPTION_CODE_PRIVATE_KEY,
    SERVER_MODE: process.env.SERVER_MODE,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
  },
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    DATABASE_URL: z.string().url(),
    EVENT_NAME: z.string(),
    FRONTEND_BASE_URL: z.string().url(),
    GLOBAL_SERVER_SYNC_API_KEY: z.string().optional(),
    GLOBAL_SERVER_URL: z.string().url().optional(),
    HASHIDS_SALT: z.string(),
    JWT_SECRET: z.string(),
    LOCAL_SERVER_ID: z.string().optional(),
    MAX_TICKETS_PER_SELLER: z.string().pipe(z.coerce.number()),
    NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
    REDEMPTION_CODE_PRIVATE_KEY: z.string(),
    SERVER_MODE: z.enum(["global", "local"]).default("global"),
    SMTP_HOST: z.string(),
    SMTP_PASSWORD: z.string(),
    SMTP_PORT: z.string().pipe(z.coerce.number()),
    SMTP_USER: z.string(),
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
