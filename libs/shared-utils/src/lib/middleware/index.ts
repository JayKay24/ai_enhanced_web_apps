import { composeProxy } from './compose';
import { rateLimitProxy } from './rate-limit';
import { securityHeadersProxy, corsProxy } from './security';

export const apiProxyChain = composeProxy([
  corsProxy,
  rateLimitProxy,
  securityHeadersProxy,
]);
