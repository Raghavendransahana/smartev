import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';

const server = http.createServer(app);

const start = async (): Promise<void> => {
  try {
    await connectDatabase();

    server.listen(env.PORT, () => {
      logger.info(`FlexiEVChain API listening on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error as Error);
    process.exit(1);
  }
};

void start();

const gracefulShutdown = () => {
  logger.info('Shutting down server');
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
