/**
 * Analysis Service
 * Phase 6: Orchestration Service
 *
 * Main service for managing pitch deck analysis
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository, Reference } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { PitchDeck } from '@api/pitchdeck/entities/pitch-deck.entity';
import { User } from '@api/user/entities/user.entity';
import { AnalysisResult } from '../entities/analysis-result.entity';
import { AnalysisRepository } from '../repositories/analysis.repository';
import { OrchestratorService } from './orchestrator.service';
import { AnalysisQueueProducer } from '@core/queue/producers/analysis-queue.producer';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(AnalysisResult)
    private readonly analysisRepository: AnalysisRepository,
    @InjectRepository(PitchDeck)
    private readonly pitchDeckRepository: EntityRepository<PitchDeck>,
    private readonly em: EntityManager,
    private readonly orchestrator: OrchestratorService,
    private readonly queueProducer: AnalysisQueueProducer,
  ) {}

  async startAnalysis(
    deckUuid: string,
    ownerId: string,
  ): Promise<AnalysisResult> {
    // Find pitch deck
    const deck = await this.pitchDeckRepository.findOne({
      uuid: deckUuid,
      owner: new ObjectId(ownerId),
    });

    if (!deck) {
      throw new NotFoundException('Pitch deck not found');
    }

    // Check for existing analysis
    const existing = await this.analysisRepository.findByDeckId(
      deck._id.toString(),
    );
    if (existing && existing.status !== 'failed') {
      return existing;
    }

    // Queue analysis job
    const jobId = await this.queueProducer.addAnalysisJob({
      deckId: deck._id.toString(),
      ownerId,
      type: 'full',
    });

    // Return pending analysis result
    const analysis = this.analysisRepository.create({
      uuid: jobId,
      status: 'pending' as any,
      deck: Reference.createFromPK(PitchDeck, deck._id),
      owner: Reference.createFromPK(User, new ObjectId(ownerId)),
      analysisType: 'full',
    });

    this.em.persist(analysis);
    await this.em.flush();
    return analysis;
  }

  async getAnalysisStatus(
    analysisUuid: string,
    ownerId: string,
  ): Promise<{
    uuid: string;
    status: string;
    progress: number;
    currentStep: string;
    agents: Array<{ agentName: string; status: string }>;
    errorMessage?: string;
  }> {
    const analysis = await this.analysisRepository.findOne(
      {
        uuid: analysisUuid,
        owner: new ObjectId(ownerId),
      },
      { populate: ['agentStates'] },
    );

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    return {
      uuid: analysis.uuid,
      status: analysis.status,
      progress: this.calculateProgress(analysis),
      currentStep: this.getCurrentStep(analysis),
      agents:
        analysis.agentStates?.map((state) => ({
          agentName: state.agentName,
          status: state.status,
        })) || [],
      errorMessage: analysis.errorMessage,
    };
  }

  async getAnalysisResult(analysisUuid: string, ownerId: string) {
    const analysis = await this.analysisRepository.findOne(
      {
        uuid: analysisUuid,
        owner: new ObjectId(ownerId),
      },
      { populate: ['scores', 'findings', 'agentStates'] },
    );

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    return analysis;
  }

  private calculateProgress(analysis: AnalysisResult): number {
    if (analysis.status === 'completed') return 100;
    if (analysis.status === 'pending') return 0;
    if (analysis.status === 'failed') return 0;

    // Count completed agents
    const completedCount =
      analysis.agentStates?.filter((s) => s.status === 'completed').length || 0;
    const totalCount = analysis.agentStates?.length || 7;

    return Math.round((completedCount / totalCount) * 100);
  }

  private getCurrentStep(analysis: AnalysisResult): string {
    const running = analysis.agentStates?.find((s) => s.status === 'running');
    if (running) return `Running ${running.agentName}`;

    const pending = analysis.agentStates?.find((s) => s.status === 'pending');
    if (pending) return `Queued ${pending.agentName}`;

    return analysis.status;
  }
}
