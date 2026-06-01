import { composeProxy } from './compose';
import { rateLimitProxy } from './rate-limit';
import { userQuotaProxy } from './quota';
import { securityHeadersProxy, corsProxy } from './security';

export const apiProxyChain = composeProxy([
  corsProxy,
  rateLimitProxy,
  userQuotaProxy,
  securityHeadersProxy,
]);
