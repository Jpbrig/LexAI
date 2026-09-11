import { z } from "zod";

const optionalSecret = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  AUTH_SECRET: optionalSecret,
  AUTH_URL: z.string().url().optional(),
  AUTH_TRUST_HOST: z.enum(["true", "false"]).optional(),
  DATABASE_URL: z.string().min(1).optional(),
  DIRECT_URL: z.string().min(1).optional(),
  DATAJUD_API_KEY: optionalSecret,
  GEMINI_API_KEY: optionalSecret,
  OPENAI_API_KEY: optionalSecret,
  RESEND_API_KEY: optionalSecret,
  EMAIL_FROM: z.string().email().optional(),
  STRIPE_SECRET_KEY: optionalSecret,
  STRIPE_WEBHOOK_SECRET: optionalSecret,
  CRON_SECRET: optionalSecret,
  INTEGRATION_ENCRYPTION_KEY: optionalSecret,
  CLICSIGN_API_KEY: optionalSecret,
  CLICSIGN_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
  JUSBRASIL_API_URL: z.string().url().optional(),
  JUSBRASIL_API_KEY: optionalSecret,
  SERPRO_API_URL: z.string().url().optional(),
  SERPRO_CLIENT_ID: optionalSecret,
  SERPRO_CLIENT_SECRET: optionalSecret,
  SENATRAN_API_URL: z.string().url().optional(),
  SENATRAN_CLIENT_ID: optionalSecret,
  SENATRAN_CLIENT_SECRET: optionalSecret,
  INPI_API_URL: z.string().url().optional(),
  INPI_API_KEY: optionalSecret,
  IEPTB_API_URL: z.string().url().optional(),
  IEPTB_API_KEY: optionalSecret,
  SENTRY_DSN: z.string().url().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success && process.env.NODE_ENV === "production") {
  throw new Error("Configuração de ambiente inválida. Verifique as variáveis obrigatórias.");
}

export const env = parsedEnv.success
  ? parsedEnv.data
  : envSchema.parse({ NODE_ENV: process.env.NODE_ENV || "development" });

export function requireServerSecret(
  name: "AUTH_SECRET" | "DATAJUD_API_KEY" | "GEMINI_API_KEY" | "OPENAI_API_KEY" | "RESEND_API_KEY" | "STRIPE_SECRET_KEY" | "STRIPE_WEBHOOK_SECRET" | "CRON_SECRET" | "INTEGRATION_ENCRYPTION_KEY"
): string | null {
  const value = env[name];
  return value || null;
}
