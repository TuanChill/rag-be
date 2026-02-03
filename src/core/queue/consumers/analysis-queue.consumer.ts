import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AnalysisJobData } from '../interfaces/queue-job.interface';

/**
 * Queue consumer - processes analysis jobs from the queue
 * Worker that executes agent workflows asynchronously
 *
 * NOTE: Actual agent execution injected in Phase 6 (Orchestration Service)
 * This is a skeleton that handles job lifecycle and progress tracking
 */
@Processor('analysis')
export class AnalysisQueueConsumer {
  private readonly logger = new Logger(AnalysisQueueConsumer.name);

  /** Track active jobs for monitoring */
  private readonly activeJobs = new Set<string>();

  @OnQueueActive()
  onActive(job: Job<AnalysisJobData>) {
    // Guard: job.id is always set by BullMQ for active jobs
    const jobId = job.id ?? 'unknown';
    this.activeJobs.add(jobId);
    this.logger.log(`Job ${jobId} started for deck: ${job.data.deckId}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job<AnalysisJobData>) {
    // Guard: job.id is always set by BullMQ for completed jobs
    const jobId = job.id ?? 'unknown';
    this.activeJobs.delete(jobId);
    this.logger.log(`Job ${jobId} completed for deck: ${job.data.deckId}`);
  }

  @OnQueueFailed()
  onFailed(job: Job<AnalysisJobData>, error: Error) {
    // Guard: job.id is always set by BullMQ for failed jobs
    const jobId = job.id ?? 'unknown';
    this.activeJobs.delete(jobId);
    this.logger.error(
      `Job ${jobId} failed for deck: ${job.data.deckId} - ${error.message}`,
    );
  }

  @Process('analyze-deck')
  async handleAnalysis(job: Job<AnalysisJobData>): Promise<unknown> {
    const { deckId, type } = job.data;
    // Guard: job.id is always set by BullMQ for processing jobs
    const jobId = job.id ?? 'unknown';

    this.logger.log(`Processing analysis job: ${jobId} - type: ${type}`);

    try {
      // Initialize progress
      await job.updateProgress(0);

      // Phase 6 (Orchestration Service) will inject actual agent execution here
      // For now, this is a placeholder that simulates processing
      await this.simulateAgentExecution(job);

      await job.updateProgress(100);

      return {
        success: true,
        deckId,
        type,
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Job failed: ${jobId}`, error);
      throw error; // BullMQ will handle retry based on job options
    }
  }

  /**
   * Placeholder for agent execution
   * Will be replaced with actual orchestration in Phase 6
   */
  private async simulateAgentExecution(
    job: Job<AnalysisJobData>,
  ): Promise<void> {
    const steps = [
      'Extracting pitch deck content',
      'Running scoring agents',
      'Running analysis agents',
      'Aggregating results',
      'Storing in database',
    ];

    for (let i = 0; i < steps.length; i++) {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 100));

      const progress = Math.round(((i + 1) / steps.length) * 100);
      await job.updateProgress(progress);

      this.logger.log(
        `Job ${job.id}: Step ${i + 1}/${steps.length} - ${steps[i]}`,
      );
    }
  }

  /**
   * Get currently active job count
   */
  getActiveJobCount(): number {
    return this.activeJobs.size;
  }
}
