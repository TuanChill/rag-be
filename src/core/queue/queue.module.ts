import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { AnalysisQueueProducer } from './producers/analysis-queue.producer';
import { AnalysisQueueConsumer } from './consumers/analysis-queue.consumer';

/**
 * Queue module - provides BullMQ queue infrastructure
 * Enables async job processing with Redis backing
 */
@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'analysis',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>(
            'eventQueue.redisUrl',
            'redis://localhost:6379',
          ),
          port: config.get<number>('eventQueue.redisPort'),
          username: config.get<string>('eventQueue.redisUser'),
          password: config.get<string>('eventQueue.redisPassword'),
          db: config.get<number>('eventQueue.redisDb'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100, // Keep last 100 completed jobs
          removeOnFail: 50, // Keep last 50 failed jobs
          timeout: 300000, // 5 minutes default timeout
        },
      }),
    }),
  ],
  providers: [AnalysisQueueProducer, AnalysisQueueConsumer],
  exports: [AnalysisQueueProducer, BullModule],
})
export class QueueModule {}
