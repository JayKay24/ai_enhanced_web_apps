import pino from 'pino';

const isDev = process.env['NODE_ENV'] !== 'production';

/**
 * Shared Pino logger instance for structured, performance-oriented logging.
 * In development, output is colorized and pretty-printed. In production, logs are raw JSON streams.
 * Default log level is 'info', custom levels can be set via the `LOG_LEVEL` environment variable.
 */
export const logger = pino({
  level: process.env['LOG_LEVEL'] || 'info',
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
});
