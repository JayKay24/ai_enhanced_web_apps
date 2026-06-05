import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { apiProxyChain } from '@ai-enhanced-web-apps/shared-utils/middleware';

const isProtectedRoute = createRouteMatcher([
  '/',
]);

const isApiRoute = createRouteMatcher([
  '/api/(.*)',
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  if (isApiRoute(req)) {
    const { userId } = await auth();
    if (userId) {
      req.headers.set('x-user-id', userId);
    }
    return await apiProxyChain(req);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
