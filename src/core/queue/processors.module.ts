/**
 * Processors Module
 * Contains all Bull queue processors in a single module
 * to avoid double registration issues caused by circular dependencies
 *
 * Uses forwardRef for AnalysisModule to delay import resolution
 * and avoid Bull's explorer scanning processors twice.
 */
import { Module, forwardRef } from '@nestjs/common';
import { QueueModule } from './queue.module';
import { AnalysisModule } from '@api/analysis/analysis.module';
import { ReportAgentModule } from '@agents/report/report.module';
import { AnalysisJobProcessor } from '@api/analysis/queue/analysis-job.processor';
import { ReportQueueConsumer } from './consumers/report-queue.consumer';

@Module({
  imports: [
    QueueModule,
    forwardRef(() => AnalysisModule),
    forwardRef(() => ReportAgentModule),
  ],
  providers: [AnalysisJobProcessor, ReportQueueConsumer],
})
export class ProcessorsModule {}
