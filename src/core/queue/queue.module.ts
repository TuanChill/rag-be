import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AnalysisQueueProducer } from './producers/analysis-queue.producer';
import { AnalysisQueueConsumer } from './consumers/analysis-queue.consumer';
import { ReportQueueProducer } from './producers/report-queue.producer';

/**
 * Queue module - provides BullMQ queue infrastructure for producers
 * Enables async job processing with Redis backing
 *
 * Note: BullModule.forRootAsync is in AppModule for global connection
 * Note: Processors are registered in ProcessorsModule
 */

@Module({
  imports: [
    // Register queues for producer injection - uses global connection from AppModule
    BullModule.registerQueue({
      name: 'analysis',
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
    BullModule.registerQueue({
      name: 'report-generation',
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
  ],
  providers: [
    AnalysisQueueProducer,
    AnalysisQueueConsumer,
    ReportQueueProducer,
  ],
  exports: [AnalysisQueueProducer, ReportQueueProducer, BullModule],
})
export class QueueModule {}
