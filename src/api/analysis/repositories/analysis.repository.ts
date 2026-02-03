/**
 * Analysis Repository
 * Phase 6: Orchestration Service
 *
 * Custom repository for AnalysisResult queries
 */
import { EntityRepository } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { AnalysisResult } from '../entities/analysis-result.entity';
import { AnalysisStatus } from '../types/analysis.types';

export class AnalysisRepository extends EntityRepository<AnalysisResult> {
  /**
   * Find analysis result by deck ID with all relations
   */
  async findByDeckId(deckId: string): Promise<AnalysisResult | null> {
    return this.findOne(
      { deck: deckId },
      { populate: ['scores', 'findings', 'agentStates'] },
    );
  }

  /**
   * Find pending or running analysis for a deck
   */
  async findPendingAnalysis(deckId: string): Promise<AnalysisResult | null> {
    return this.findOne({
      deck: deckId,
      status: { $in: ['pending', 'running'] },
    });
  }

  /**
   * Find analyses by owner with optional filters and pagination
   */
  async findByOwner(
    ownerId: string,
    options?: {
      status?: AnalysisStatus;
      limit?: number;
      offset?: number;
    },
  ): Promise<AnalysisResult[]> {
    const where: any = { owner: new ObjectId(ownerId) };

    if (options?.status) {
      where.status = options.status;
    }

    return this.find(where, {
      populate: ['scores', 'findings', 'agentStates'],
      limit: options?.limit || 20,
      offset: options?.offset || 0,
      orderBy: { createdAt: 'desc' },
    });
  }
}
