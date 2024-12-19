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
    HASHIDS_SALT: process.env.HASHIDS_SALT,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    REDEMPTION_CODE_PRIVATE_KEY: process.env.REDEMPTION_CODE_PRIVATE_KEY,
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
    HASHIDS_SALT: z.string(),
    JWT_SECRET: z.string(),
    NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
    REDEMPTION_CODE_PRIVATE_KEY: z.string(),
    SMTP_HOST: z.string(),
    SMTP_PASSWORD: z.string(),
    SMTP_PORT: z.string().pipe(z.coerce.number()),
    SMTP_USER: z.string(),
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
