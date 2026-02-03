import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, JobState, JobProgress } from 'bullmq';
import { AnalysisJobData } from '../interfaces/queue-job.interface';

/**
 * Queue producer - adds jobs to the analysis queue
 * Called by controllers/services to trigger async analysis
 */
@Injectable()
export class AnalysisQueueProducer {
  private readonly logger = new Logger(AnalysisQueueProducer.name);

  constructor(@InjectQueue('analysis') private readonly analysisQueue: Queue) {}

  /**
   * Add analysis job to queue
   * @param jobData Job data containing deckId, ownerId, and type
   * @returns Job ID for tracking
   */
  async addAnalysisJob(jobData: AnalysisJobData): Promise<string> {
    // Include timestamp to allow re-analysis of same deck
    const jobId = `${jobData.deckId}-${jobData.type}-${Date.now()}`;

    const job = await this.analysisQueue.add('analyze-deck', jobData, {
      jobId,
      priority: jobData.priority || 5,
      delay: 0, // Process immediately
    });

    // Guard: job.id is always set by BullMQ after adding
    const addedJobId = job.id ?? jobId;
    this.logger.log(
      `Analysis job queued: ${addedJobId} for deck: ${jobData.deckId}`,
    );

    return addedJobId;
  }

  /**
   * Get current job state
   * @param jobId Job ID to query
   * @returns Job state or null if not found
   */
  async getJobState(jobId: string): Promise<JobState | null> {
    try {
      const job = await this.analysisQueue.getJob(jobId);
      if (!job) return null;

      const state = await job.getState();
      return state as JobState;
    } catch (error) {
      this.logger.warn(`Failed to get job state: ${jobId}`, error);
      return null;
    }
  }

  /**
   * Get job progress
   * @param jobId Job ID to query
   * @returns Progress data or null if not found
   */
  async getJobProgress(
    jobId: string,
  ): Promise<{ progress: JobProgress; data: unknown } | null> {
    try {
      const job = await this.analysisQueue.getJob(jobId);
      if (!job) return null;

      return { progress: job.progress, data: job.data };
    } catch (error) {
      this.logger.warn(`Failed to get job progress: ${jobId}`, error);
      return null;
    }
  }

  /**
   * Remove job from queue
   * @param jobId Job ID to remove
   */
  async removeJob(jobId: string): Promise<boolean> {
    try {
      const job = await this.analysisQueue.getJob(jobId);
      if (!job) return false;

      await job.remove();
      this.logger.log(`Job removed: ${jobId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to remove job: ${jobId}`, error);
      return false;
    }
  }
}
