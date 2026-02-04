/**
 * Analysis Job Processor
 * Phase 6: Orchestration Service
 *
 * BullMQ job processor for async analysis
 * Extends WorkerHost to process jobs from the analysis queue
 *
 * IMPORTANT: Uses em.fork() to create isolated EntityManager context
 * MikroORM v6 disallows using global EntityManager in async workers
 */
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
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
    // Inject MikroORM instance directly for fork() operations
    // The ORM is provided globally from AppModule's MikroOrmModule.forRootAsync()
    @Inject(MikroORM)
    private readonly orm: MikroORM,
  ) {
    super();
  }

  async process(job: Job<AnalysisJobData>): Promise<void> {
    const { deckId, deckUuid, ownerId } = job.data;

    this.logger.log(`Processing analysis job: ${job.id}`);

    // Create isolated EntityManager context for this job
    // MikroORM v6 requires fork() for async operations to avoid context issues
    const forkedEm = this.orm.em.fork();

    try {
      await job.updateProgress(10);

      await this.orchestrator.executeAnalysis(
        deckId,
        ownerId,
        deckUuid,
        forkedEm,
      );

      await job.updateProgress(100);

      this.logger.log(`Analysis job completed: ${job.id}`);
    } catch (error) {
      this.logger.error(`Analysis job failed: ${job.id}`, error);
      throw error;
    }
    // Note: forked EntityManager doesn't need explicit cleanup in MikroORM v6
    // It will be garbage collected automatically
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(
      `Analysis job ${job.id} started for deck: ${job.data.deckId}`,
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(
      `Analysis job ${job.id} completed for deck: ${job.data.deckId}`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Analysis job ${job.id} failed for deck: ${job.data.deckId} - ${error.message}`,
    );
  }
}
