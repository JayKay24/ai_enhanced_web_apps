import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@ai-enhanced-web-apps/logger';

export type ProxyResult = {
  response?: NextResponse;
  continue: boolean;
};

export type ProxyFunction = (
  request: NextRequest,
  response: NextResponse
) => Promise<ProxyResult> | ProxyResult;

/**
 * Composes an array of proxy functions into a single proxy runner.
 * 
 * @param proxies - Array of proxy middleware functions to execute in order.
 * @returns A composite function that runs the proxy middleware pipeline.
 */
export function composeProxy(proxies: ProxyFunction[]) {
  return async (request: NextRequest) => {
    const response = NextResponse.next();

    for (const proxy of proxies) {
      try {
        const result = await proxy(request, response);
        if (result.response) {
          return result.response;
        }
        if (!result.continue) {
          break;
        }
      } catch (error) {
        logger.error(error, 'Proxy execution error:');
        return NextResponse.json(
          { error: 'Internal Server Error' },
          { status: 500 }
        );
      }
    }

    return response;
  };
}
