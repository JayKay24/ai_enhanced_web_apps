import { LoggerService } from '@nestjs/common';
import { logger } from './logger';

/**
 * NestJS compatible LoggerService implementation.
 * Intercepts standard NestJS logging calls (e.g. log, error, warn, debug, verbose)
 * and redirects them to the shared monorepo Pino logger, preserving context, levels, and output structures.
 */
export class NestLoggerService implements LoggerService {
  /**
   * Write a 'log' level log.
   */
  log(message: string, ...optionalParams: unknown[]) {
    logger.info({ context: optionalParams[optionalParams.length - 1] }, message);
  }

  /**
   * Write an 'error' level log.
   */
  error(message: string, ...optionalParams: unknown[]) {
    logger.error({ context: optionalParams[optionalParams.length - 1] }, message);
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: string, ...optionalParams: unknown[]) {
    logger.warn({ context: optionalParams[optionalParams.length - 1] }, message);
  }

  /**
   * Write a 'debug' level log.
   */
  debug?(message: string, ...optionalParams: unknown[]) {
    logger.debug({ context: optionalParams[optionalParams.length - 1] }, message);
  }

  /**
   * Write a 'verbose' level log.
   */
  verbose?(message: string, ...optionalParams: unknown[]) {
    logger.trace({ context: optionalParams[optionalParams.length - 1] }, message);
  }
}
