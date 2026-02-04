/**
 * Analysis Job Processor
 * Phase 6: Orchestration Service
 *
 * BullMQ job processor for async analysis
 * Extends WorkerHost to process jobs from the analysis queue
 */
import {
  Inject,
  Injectable,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { OrchestratorService } from '../services/orchestrator.service';
import { AnalysisJobData } from '@core/queue/interfaces/queue-job.interface';

@Injectable()
@Processor('analysis')
export class AnalysisJobProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalysisJobProcessor.name);

  constructor(
    @Inject(forwardRef(() => OrchestratorService))
    private readonly orchestrator: OrchestratorService,
  ) {
    super();
  }

  async process(job: Job<AnalysisJobData>): Promise<void> {
    const { deckId, ownerId } = job.data;

    this.logger.log(`Processing analysis job: ${job.id}`);

    try {
      await job.updateProgress(10);

      await this.orchestrator.executeAnalysis(deckId, ownerId, deckId);

      await job.updateProgress(100);

      this.logger.log(`Analysis job completed: ${job.id}`);
    } catch (error) {
      this.logger.error(`Analysis job failed: ${job.id}`, error);
      throw error;
    }
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Analysis job ${job.id} started for deck: ${job.data.deckId}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Analysis job ${job.id} completed for deck: ${job.data.deckId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Analysis job ${job.id} failed for deck: ${job.data.deckId} - ${error.message}`,
    );
  }
}
