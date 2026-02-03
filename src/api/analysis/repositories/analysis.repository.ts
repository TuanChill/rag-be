/**
 * Analysis Repository
 * Phase 6: Orchestration Service
 *
 * Custom repository for AnalysisResult queries
 */
import { EntityRepository } from '@mikro-orm/core';
import { AnalysisResult } from '../entities/analysis-result.entity';

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
}
