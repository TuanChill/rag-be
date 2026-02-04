/**
 * Analysis Queue Consumer
 * Phase 6: Orchestration Service - Implementation
 *
 * Event hooks for analysis job queue processing
 */
import { OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

export interface AnalysisJobData {
  deckId: string;
  deckUuid: string;
  ownerId: string;
  type: 'full' | 'sector' | 'stage' | 'thesis';
}

export class AnalysisQueueConsumer {
  private readonly logger = new Logger(AnalysisQueueConsumer.name);

  @OnWorkerEvent('active')
  onActive(job: Job<AnalysisJobData>) {
    const jobId = job.id ?? 'unknown';
    this.logger.log(`Job ${jobId} started for deck: ${job.data.deckId}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<AnalysisJobData>) {
    const jobId = job.id ?? 'unknown';
    this.logger.log(`Job ${jobId} completed for deck: ${job.data.deckId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<AnalysisJobData>, error: Error) {
    const jobId = job.id ?? 'unknown';
    this.logger.error(
      `Job ${jobId} failed for deck: ${job.data.deckId} - ${error.message}`,
    );
  }
}
