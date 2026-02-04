/**
 * Analysis Repository
 * Phase 6: Orchestration Service
 *
 * Custom repository for AnalysisResult queries
 */
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { AnalysisResult } from '../entities/analysis-result.entity';
import { AnalysisStatus } from '../types/analysis.types';
import { PitchDeck } from '@api/pitchdeck/entities/pitch-deck.entity';

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
   * Find most recent analysis result by deck UUID
   * Searches by deck.uuid field (not deck._id ObjectId)
   */
  async findByDeckUuid(
    em: EntityManager,
    deckUuid: string,
  ): Promise<AnalysisResult | null> {
    // First find the deck by UUID to get its _id
    const deck = await em.findOne(PitchDeck, { uuid: deckUuid });
    if (!deck) {
      return null;
    }

    // Find the most recent analysis for this deck
    return this.findOne(
      { deck: deck._id },
      {
        populate: ['scores', 'findings', 'agentStates'],
        orderBy: { createdAt: 'desc' },
      },
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
