import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? Redis.fromEnv()
  : null;

const ratelimiters = new Map<string, Ratelimit>();

export function requestFingerprint(req: NextRequest): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(ip).digest("hex");
}

export async function isRateLimited(req: NextRequest, scope: string, limit: number, windowMs: number): Promise<boolean> {
  // Fallback: se o Redis não estiver configurado (dev local), permite tudo para não quebrar.
  if (!redis) {
    console.warn(`[RateLimit] Redis não configurado. Ignorando rate limit para ${scope}.`);
    return false;
  }

  const key = `${limit}-${windowMs}`;
  let ratelimit = ratelimiters.get(key);
  if (!ratelimit) {
    const seconds = Math.ceil(windowMs / 1000);
    ratelimit = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(limit, `${seconds} s`),
    });
    ratelimiters.set(key, ratelimit);
  }

  const identifier = `${scope}:${requestFingerprint(req)}`;
  const { success } = await ratelimit.limit(identifier);
  
  return !success;
}
