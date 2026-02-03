/**
 * Analysis Job Processor
 * Phase 6: Orchestration Service
 *
 * BullMQ job processor for async analysis
 */
import { Injectable, Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bullmq';
import { OrchestratorService } from '../services/orchestrator.service';
import { AnalysisJobData } from '@core/queue/interfaces/queue-job.interface';

@Injectable()
@Processor('analysis')
export class AnalysisJobProcessor {
  private readonly logger = new Logger(AnalysisJobProcessor.name);

  constructor(private readonly orchestrator: OrchestratorService) {}

  @Process('analyze-deck')
  async handleAnalysis(job: Job<AnalysisJobData>): Promise<void> {
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
}
