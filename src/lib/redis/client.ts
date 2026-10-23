import { Redis } from "@upstash/redis";
import crypto from "crypto";
import { Quiz } from "@/types/quiz";

// In-memory fallback cache if Upstash Redis credentials are not provided
const inMemoryCache = new Map<string, { data: Quiz; expiresAt: number }>();

let redisClient: Redis | null = null;

// Default namespace prefix to isolate this project from other projects on the same Upstash DB
export const DEFAULT_REDIS_NAMESPACE = "examprep_ai";

/**
 * Retrieves the project-specific namespace key prefix.
 * Configurable via process.env.UPSTASH_REDIS_KEY_PREFIX
 */
export function getProjectKeyPrefix(): string {
  const customPrefix = process.env.UPSTASH_REDIS_KEY_PREFIX;
  if (customPrefix && customPrefix.trim()) {
    return customPrefix.trim().replace(/:+$/, "");
  }
  return DEFAULT_REDIS_NAMESPACE;
}

/**
 * Ensures any key is prefixed with the project namespace (e.g. "examprep_ai:quiz:cache:...")
 * preventing collision with other apps sharing the same Upstash Redis instance.
 */
export function formatNamespacedKey(key: string): string {
  const prefix = getProjectKeyPrefix();
  if (key.startsWith(`${prefix}:`)) {
    return key;
  }
  return `${prefix}:${key}`;
}

export function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token || url.includes("your-database")) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis({
      url,
      token,
    });
  }

  return redisClient;
}

/**
 * Computes a deterministic SHA-256 hash for cache key generation
 * with guaranteed project namespace isolation.
 */
export function generateCacheKey(input: {
  mode: string;
  payload: string;
  questionCount: number;
  difficulty: string;
}): string {
  const normalized = `${input.mode.trim()}|${input.payload.trim().toLowerCase()}|${input.questionCount}|${input.difficulty.trim()}`;
  const hash = crypto.createHash("sha256").update(normalized).digest("hex");
  return formatNamespacedKey(`quiz:cache:${hash}`);
}

/**
 * Gets a cached quiz payload by cache key (namespaced)
 */
export async function getCachedQuiz(cacheKey: string): Promise<Quiz | null> {
  const namespacedKey = formatNamespacedKey(cacheKey);
  const redis = getRedisClient();

  if (redis) {
    try {
      const data = await redis.get<Quiz>(namespacedKey);
      if (data) {
        return { ...data, cached: true };
      }
    } catch (err) {
      console.warn("Upstash Redis get error, falling back to local cache:", err);
    }
  }

  // Fallback to in-memory store
  const cached = inMemoryCache.get(namespacedKey);
  if (cached) {
    if (Date.now() < cached.expiresAt) {
      return { ...cached.data, cached: true };
    }
    inMemoryCache.delete(namespacedKey);
  }

  return null;
}

/**
 * Saves a quiz payload to cache with a 24-hour TTL (86400 seconds)
 * using the project namespace.
 */
export async function setCachedQuiz(
  cacheKey: string,
  quiz: Quiz,
  ttlSeconds: number = 86400
): Promise<void> {
  const namespacedKey = formatNamespacedKey(cacheKey);
  const redis = getRedisClient();

  if (redis) {
    try {
      await redis.set(namespacedKey, quiz, { ex: ttlSeconds });
      return;
    } catch (err) {
      console.warn("Upstash Redis set error, falling back to local cache:", err);
    }
  }

  // Store in in-memory fallback
  inMemoryCache.set(namespacedKey, {
    data: quiz,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}
