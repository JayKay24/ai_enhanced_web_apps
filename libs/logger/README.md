# `@ai-enhanced-web-apps/logger`

A shared, structured logging library built on top of [Pino](https://github.com/pinojs/pino). It provides performance-optimized logging for Next.js applications and NestJS standalone services.

## Core Features

- **Pino Integration**: Reuses Pino's fast logging architecture.
- **Environments**:
  - **Development (`NODE_ENV !== 'production'`)**: Logs are piped through `pino-pretty` for colorized, human-readable terminal output. Timestamps are formatted, and metadata is stripped for cleaner terminal feeds.
  - **Production**: Logs are emitted as structured JSON lines, optimized for high throughput and cloud ingestion services (like Datadog, ELK, or Google Cloud Logging).
- **NestJS Service Adapter**: Integrates with NestJS applications by providing `NestLoggerService`, redirecting standard NestJS core events through the unified Pino stream.

## Usage

### 1. General Import (Next.js, TS Modules)
```typescript
import { logger } from '@ai-enhanced-web-apps/logger';

// Info level
logger.info({ route: '/api/chat' }, 'Processing chat request...');

// Error level with error payload
logger.error({ err: error }, 'Failed to stream LLM response');
```

### 2. NestJS CLI Integration (`main.ts`)
```typescript
import { NestLoggerService } from '@ai-enhanced-web-apps/logger';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: new NestLoggerService(),
  });
  // ...
}
```

## Configuration

Set the logging severity threshold via the `LOG_LEVEL` environment variable:
*   `fatal` | `error` | `warn` | `info` (default) | `debug` | `trace`
