import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import type { ProxyResult } from './compose';
import { logger } from '@ai-enhanced-web-apps/logger';

// Initialize Upstash Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

const DAILY_QUOTA_LIMIT = 10;

/**
 * Edge-compatible User Quota Proxy Middleware using Upstash Redis.
 * Enforces a daily limit on requests per authenticated user.
 */
export async function userQuotaProxy(
  request: NextRequest,
  response: NextResponse
): Promise<ProxyResult> {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    // If route doesn't have an auth session, proceed (secondary route protection handles it if needed)
    return { continue: true };
  }

  // Skip checks if Upstash credentials are missing in dev
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    logger.warn('Skipping quota limit check: Redis credentials not configured.');
    return { continue: true };
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const key = `user_quota:${userId}:${today}`;

    // Increment request count in Redis
    const count = await redis.incr(key);
    
    // Set 24h expiration key on first daily request
    if (count === 1) {
      await redis.expire(key, 24 * 60 * 60);
    }

    if (count > DAILY_QUOTA_LIMIT) {
      logger.info({ userId }, 'Daily message quota limit exceeded');
      const errorResponse = NextResponse.json(
        { error: `Message quota exceeded. You can only send ${DAILY_QUOTA_LIMIT} queries per day.` },
        { status: 429 }
      );
      return { response: errorResponse, continue: false };
    }

    return { continue: true };
  } catch (error) {
    logger.error(error, 'User quota middleware execution error:');
    return { continue: true }; // Fallback to let request complete if Redis fails
  }
}
