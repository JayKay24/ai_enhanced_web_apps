import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { ProxyResult } from './compose';

/**
 * Standard Security Headers Proxy.
 * Sets X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy.
 * 
 * @param request - Incoming NextRequest object.
 * @param response - Outgoing NextResponse object.
 * @returns A ProxyResult object indicating the pipeline should continue.
 */
export function securityHeadersProxy(
  request: NextRequest,
  response: NextResponse
): ProxyResult {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return { continue: true };
}

/**
 * CORS handling (if API routes are accessed from multiple origins).
 * Responds immediately to HTTP OPTIONS pre-flight requests.
 * 
 * @param request - Incoming NextRequest object.
 * @param response - Outgoing NextResponse object.
 * @returns A ProxyResult object indicating if pre-flight is finished or execution should continue.
 */
export function corsProxy(
  request: NextRequest,
  response: NextResponse
): ProxyResult {
  if (request.method === 'OPTIONS') {
    const corsResponse = NextResponse.next();
    corsResponse.headers.set('Access-Control-Allow-Origin', '*');
    corsResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    corsResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return { response: corsResponse, continue: false };
  }
  return { continue: true };
}
