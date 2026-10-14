import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().default(""),
  BASE_URL: z
    .string()
    .default("")
    .transform((url) => {
      if (url) return url.replace(/\/+$/, "");
      if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
      return "";
    }),
  FRONTEND_URL: z
    .string()
    .default("")
    .transform((url) => {
      if (url) return url.replace(/\/+$/, "");
      if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
      return "*";
    }),
  TEST_MODE: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CONTENT_MAX_CHARS: z.coerce.number().int().positive().default(1000000),
  BODY_LIMIT: z.string().default("4mb"),
  RATE_LIMIT_READ_PER_MIN: z.coerce.number().int().positive().default(300),
  RATE_LIMIT_CREATE_PER_MIN: z.coerce.number().int().positive().default(120),
  PURGE_GRACE_SECONDS: z.coerce.number().int().positive().default(86400),
  LOG_LEVEL: z.string().default("info"),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errorDetails = result.error.errors
      .map((err) => `  - ${err.path.join(".")}: ${err.message}`)
      .join("\n");
    console.error("Configuration validation failed:\n" + errorDetails);
    throw new Error("Invalid application environment configuration:\n" + errorDetails);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

export function resetCachedEnv(): void {
  cachedEnv = null;
}
