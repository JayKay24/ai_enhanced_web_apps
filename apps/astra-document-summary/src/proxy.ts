import type { NextRequest } from 'next/server';
import { apiProxyChain } from '@ai-enhanced-web-apps/shared-utils/middleware';

/**
 * Next.js 16+ Edge Proxy Middleware for astra-document-summary.
 * Chains CORS checking, Upstash rate limiting, and security header insertion.
 * 
 * @param request - Incoming NextRequest object.
 * @returns The final NextResponse.
 */
export async function proxy(request: NextRequest) {
  return await apiProxyChain(request);
}

export const config = {
  matcher: '/api/:path*',
};
