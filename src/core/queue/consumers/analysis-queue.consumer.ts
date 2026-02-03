/**
 * Analysis Queue Consumer
 * Phase 6: Orchestration Service - Implementation
 *
 * Processes analysis jobs from the queue using actual agent orchestration
 */
import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AnalysisJobProcessor } from '@api/analysis/queue/analysis-job.processor';

export interface AnalysisJobData {
  deckId: string;
  deckUuid: string;
  ownerId: string;
  type: 'full' | 'sector' | 'stage' | 'thesis';
}

@Processor('analysis')
export class AnalysisQueueConsumer {
  private readonly logger = new Logger(AnalysisQueueConsumer.name);

  constructor(private readonly processor: AnalysisJobProcessor) {}

  @OnQueueActive()
  onActive(job: Job<AnalysisJobData>) {
    const jobId = job.id ?? 'unknown';
    this.logger.log(`Job ${jobId} started for deck: ${job.data.deckId}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job<AnalysisJobData>) {
    const jobId = job.id ?? 'unknown';
    this.logger.log(`Job ${jobId} completed for deck: ${job.data.deckId}`);
  }

  @OnQueueFailed()
  onFailed(job: Job<AnalysisJobData>, error: Error) {
    const jobId = job.id ?? 'unknown';
    this.logger.error(
      `Job ${jobId} failed for deck: ${job.data.deckId} - ${error.message}`,
    );
  }

  @Process('analyze-deck')
  async handleAnalysis(job: Job<AnalysisJobData>) {
    const jobId = job.id ?? 'unknown';
    this.logger.log(`Processing analysis job: ${jobId}`);
    return this.processor.handleAnalysis(job);
  }
}
