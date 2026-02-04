/**
 * Processors Module
 * Contains all Bull queue processors in a single module
 * to avoid double registration issues caused by circular dependencies
 *
 * Uses forwardRef for AnalysisModule to delay import resolution
 * and avoid Bull's explorer scanning processors twice.
 *
 * Note: BullModule.forRootAsync is in AppModule for global connection
 * Note: MikroORM instance is injected directly for fork() operations
 */
import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroORM } from '@mikro-orm/core';
import { AnalysisModule } from '@api/analysis/analysis.module';
import { ReportAgentModule } from '@agents/report/report.module';
import { AnalysisJobProcessor } from '@api/analysis/queue/analysis-job.processor';
import { ReportQueueConsumer } from './consumers/report-queue.consumer';

@Module({
  imports: [
    // Import MikroORM to access EntityManager and MikroORM in processors
    // EntityManager and MikroORM instance are provided globally from AppModule
    MikroOrmModule,
    // Register queues for workers - MUST match producer configuration
    // Both producer and worker register the same queue to ensure they connect
    // to the same Redis keyspace
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
    forwardRef(() => AnalysisModule),
    forwardRef(() => ReportAgentModule),
  ],
  providers: [AnalysisJobProcessor, ReportQueueConsumer],
})
export class ProcessorsModule {}
