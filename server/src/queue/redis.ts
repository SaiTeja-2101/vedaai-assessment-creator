import { Redis } from "ioredis";
import { env } from "../config/env.js";

// Plain options (not a shared client) so BullMQ instantiates its own connection
// — avoids the duplicate-ioredis type clash. Upstash needs TLS via rediss://.
function parseConnection(url: string) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: Number(u.port || 6379),
    username: u.username || undefined,
    password: u.password || undefined,
    tls: u.protocol === "rediss:" ? {} : undefined,
    maxRetriesPerRequest: null as null,
  };
}

export const redisConnection = env.REDIS_URL ? parseConnection(env.REDIS_URL) : null;

// Separate client used for health checks (and caching later).
export const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, { maxRetriesPerRequest: null })
  : null;

let ready = false;
if (redis) {
  redis.on("ready", () => {
    ready = true;
    console.log("Redis connected");
  });
  redis.on("error", (err) => {
    ready = false;
    console.error("Redis error:", err.message);
  });
}

export function redisStatus() {
  if (!redis) return "down";
  return ready ? "ok" : "down";
}
