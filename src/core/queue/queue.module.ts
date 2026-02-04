import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { AnalysisQueueProducer } from './producers/analysis-queue.producer';
import { AnalysisQueueConsumer } from './consumers/analysis-queue.consumer';
import { ReportQueueProducer } from './producers/report-queue.producer';

/**
 * Queue module - provides BullMQ queue infrastructure
 * Enables async job processing with Redis backing
 *
 * Note: Processors are registered in their domain modules (AnalysisModule)
 * where their service dependencies are available.
 */

/**
 * Creates Redis connection config for BullMQ
 * Supports both full connection string and individual parameters
 */
function createRedisConnection(config: ConfigService) {
  const redisUrl = config.get<string>('eventQueue.redisUrl', 'localhost');

  // If redisUrl is a full connection string (contains ://), parse it
  if (redisUrl.includes('://')) {
    try {
      const url = new URL(redisUrl);
      const connection: any = {
        host: url.hostname,
        port: parseInt(url.port) || 6379,
      };

      if (url.username) {
        connection.username = url.username;
      }
      if (url.password) {
        connection.password = url.password;
      }

      // Extract database number from pathname (e.g., /2 -> db 2)
      const dbMatch = url.pathname.match(/^\/(\d+)$/);
      if (dbMatch) {
        connection.db = parseInt(dbMatch[1]);
      }

      return connection;
    } catch {
      // If parsing fails, fall through to individual parameters
    }
  }

  // Otherwise, build connection from individual parameters
  return {
    host: redisUrl,
    port: config.get<number>('eventQueue.redisPort', 6379),
    username: config.get<string>('eventQueue.redisUser'),
    password: config.get<string>('eventQueue.redisPassword'),
    db: config.get<number>('eventQueue.redisDb', 0),
  };
}

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'analysis',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: createRedisConnection(config),
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      }),
    }),
    BullModule.registerQueueAsync({
      name: 'report-generation',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: createRedisConnection(config),
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      }),
    }),
  ],
  providers: [AnalysisQueueProducer, AnalysisQueueConsumer, ReportQueueProducer],
  exports: [AnalysisQueueProducer, ReportQueueProducer, BullModule],
})
export class QueueModule {}
