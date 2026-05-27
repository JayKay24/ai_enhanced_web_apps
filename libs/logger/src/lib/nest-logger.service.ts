import { LoggerService } from '@nestjs/common';
import { logger } from './logger';

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
