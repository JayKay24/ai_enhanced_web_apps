import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { ProxyResult } from './compose';

// Initialize Redis client using environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Configure sliding window rate limiter: 5 requests per 10 seconds
const ratelimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10 s'),
  analytics: true,
});

/**
 * Edge-compatible Rate Limiting Proxy Middleware using Upstash Redis.
 * Verifies that the client IP address does not exceed the allowed request limit.
 * 
 * @param request - Incoming NextRequest object.
 * @param response - Outgoing NextResponse object.
 * @returns A promise resolving to the ProxyResult indicating if execution can continue.
 */
export async function rateLimitProxy(
  request: NextRequest,
  response: NextResponse
): Promise<ProxyResult> {
  // If Upstash credentials are missing in dev, skip rate limiting instead of crashing
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('Skipping rate limit: UPSTASH_REDIS env variables are not configured.');
    return { continue: true };
  }

  const identifier = (request as any).ip || request.headers.get('x-forwarded-for') || '127.0.0.1';

  try {
    const { success, limit, remaining, reset } = await ratelimiter.limit(identifier);

    if (!success) {
      const errorResponse = NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      );
      return { response: errorResponse, continue: false };
    }

    return { continue: true };
  } catch (error) {
    console.error('Rate limiting error:', error);
    return { continue: true }; // Fallback to allow connection if Redis is down
  }
}
