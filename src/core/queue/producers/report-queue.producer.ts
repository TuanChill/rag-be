import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobState, JobProgress } from 'bullmq';
import { ReportJobData } from '../interfaces/report-job.interface';

/**
 * Queue producer - adds jobs to the report generation queue
 * Called by services to trigger async report generation
 */
@Injectable()
export class ReportQueueProducer {
  private readonly logger = new Logger(ReportQueueProducer.name);

  constructor(
    @InjectQueue('report-generation') private readonly reportQueue: Queue,
  ) {}

  /**
   * Add report generation job to queue
   * @param jobData Job data containing reportUuid, analysisUuid, ownerId, reportType, and format
   * @returns Job ID for tracking
   */
  async addReportJob(jobData: ReportJobData): Promise<string> {
    // Include timestamp to allow regeneration of same report
    const jobId = `${jobData.reportUuid}-${Date.now()}`;

    const job = await this.reportQueue.add('generate-report', jobData, {
      jobId,
      priority: jobData.priority || 5,
      delay: 0, // Process immediately
    });

    // Guard: job.id is always set by BullMQ after adding
    const addedJobId = job.id ?? jobId;
    this.logger.log(
      `Report job queued: ${addedJobId} for analysis: ${jobData.analysisUuid}`,
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
      const job = await this.reportQueue.getJob(jobId);
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
      const job = await this.reportQueue.getJob(jobId);
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
      const job = await this.reportQueue.getJob(jobId);
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
