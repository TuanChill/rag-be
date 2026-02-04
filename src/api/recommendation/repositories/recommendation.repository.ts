import { EntityRepository } from '@mikro-orm/core';
import { Recommendation } from '../entities/recommendation.entity';
import { RecommendationType } from '../types/recommendation.types';

/**
 * Custom repository for Recommendation entity
 *
 * Provides optimized queries for recommendation retrieval and management
 */
export class RecommendationRepository extends EntityRepository<Recommendation> {
  /**
   * Find active recommendations for a user
   * @param userId - User ID to find recommendations for
   * @param limit - Max results to return
   * @param offset - Results offset for pagination
   */
  async findActiveByUser(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<Recommendation[]> {
    return this.find(
      {
        userId,
        expiresAt: { $gte: new Date() },
      },
      {
        limit,
        offset,
        orderBy: [{ similarityScore: 'desc' }],
      },
    );
  }

  /**
   * Find similar decks for a given deck
   * @param deckId - Source deck ID
   * @param limit - Max results to return
   * @param minScore - Minimum similarity score threshold
   */
  async findSimilarDecks(
    deckId: string,
    limit = 10,
    minScore = 0.5,
  ): Promise<Recommendation[]> {
    return this.find(
      {
        sourceDeckId: deckId,
        recommendationType: RecommendationType.SIMILAR,
        similarityScore: { $gte: minScore },
      },
      {
        limit,
        orderBy: [{ similarityScore: 'desc' }],
      },
    );
  }

  /**
   * Find trending recommendations
   * @param limit - Max results to return
   */
  async findTrending(limit = 20): Promise<Recommendation[]> {
    return this.find(
      {
        recommendationType: RecommendationType.TRENDING,
        expiresAt: { $gte: new Date() },
      },
      { limit, orderBy: [{ similarityScore: 'desc' }] },
    );
  }

  /**
   * Delete expired recommendations
   * @returns Number of deleted records
   */
  async deleteExpired(): Promise<number> {
    const expired = await this.find({
      expiresAt: { $lt: new Date() },
    });

    await this.em.remove(expired);
    return expired.length;
  }

  /**
   * Find recommendations by type for a user
   * @param userId - User ID
   * @param type - Recommendation type filter
   * @param limit - Max results
   */
  async findByType(
    userId: string,
    type: RecommendationType,
    limit = 20,
  ): Promise<Recommendation[]> {
    return this.find(
      {
        userId,
        recommendationType: type,
        expiresAt: { $gte: new Date() },
      },
      {
        limit,
        orderBy: [{ similarityScore: 'desc' }],
      },
    );
  }
}
