import { EntityRepository } from '@mikro-orm/core';
import { UserInteraction } from '../entities/user-interaction.entity';
import { InteractionType } from '../types/recommendation.types';

/**
 * Custom repository for UserInteraction entity
 *
 * Provides queries for tracking and analyzing user interactions
 * to power collaborative filtering recommendations
 */
export class UserInteractionRepository extends EntityRepository<UserInteraction> {
  /**
   * Get user interaction history for a specific deck
   * @param userId - User ID
   * @param deckId - Deck ID
   */
  async findByUserAndDeck(
    userId: string,
    deckId: string,
  ): Promise<UserInteraction[]> {
    return this.find({ userId, deckId }, { orderBy: [{ timestamp: 'desc' }] });
  }

  /**
   * Get user's recently viewed decks
   * @param userId - User ID
   * @param limit - Max results to return
   */
  async findRecentlyViewed(
    userId: string,
    limit = 10,
  ): Promise<UserInteraction[]> {
    return this.find(
      {
        userId,
        action: InteractionType.VIEW,
      },
      {
        limit,
        orderBy: [{ timestamp: 'desc' }],
      },
    );
  }

  /**
   * Get user's liked decks
   * @param userId - User ID
   * @param limit - Max results to return
   */
  async findLikedDecks(userId: string, limit = 50): Promise<UserInteraction[]> {
    return this.find(
      {
        userId,
        action: InteractionType.LIKE,
      },
      {
        limit,
        orderBy: [{ timestamp: 'desc' }],
      },
    );
  }

  /**
   * Count interactions by type for a deck
   * Used for collaborative filtering signals
   * @param deckId - Deck ID to analyze
   */
  async countByDeck(deckId: string): Promise<Record<InteractionType, number>> {
    const interactions = await this.find({ deckId });

    return interactions.reduce((acc, interaction) => {
      acc[interaction.action] = (acc[interaction.action] || 0) + 1;
      return acc;
    }, {} as Record<InteractionType, number>);
  }

  /**
   * Find users with similar interaction patterns
   * @param userId - Reference user ID
   * @param limit - Max similar users to return
   */
  async findSimilarUsers(userId: string, limit = 20): Promise<string[]> {
    // Get user's liked decks
    const likedDecks = await this.findLikedDecks(userId, 100);
    const deckIds = likedDecks.map((i) => i.deckId);

    if (deckIds.length === 0) return [];

    // Find users who liked similar decks
    const similarInteractions = await this.find(
      {
        deckId: { $in: deckIds },
        action: InteractionType.LIKE,
        userId: { $ne: userId },
      },
      { limit: limit * 10 },
    );

    // Count user overlaps
    const userCounts = new Map<string, number>();
    for (const interaction of similarInteractions) {
      const count = userCounts.get(interaction.userId) || 0;
      userCounts.set(interaction.userId, count + 1);
    }

    // Return top users by overlap count
    return Array.from(userCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([userId]) => userId);
  }

  /**
   * Record a new user interaction
   * @param userId - User ID
   * @param deckId - Deck ID
   * @param action - Interaction type
   * @param metadata - Optional metadata
   */
  async recordInteraction(
    userId: string,
    deckId: string,
    action: InteractionType,
    metadata?: Record<string, unknown>,
  ): Promise<UserInteraction> {
    const interaction = this.create({
      userId,
      deckId,
      action,
      timestamp: new Date(),
      metadata,
    });

    await this.em.persistAndFlush(interaction);
    return interaction;
  }
}
