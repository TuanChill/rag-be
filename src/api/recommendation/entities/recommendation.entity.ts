import {
  Entity,
  Property,
  PrimaryKey,
  Index,
  ManyToOne,
  Rel,
} from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { BaseEntity } from '../../../core/base/base.entity';
import { User } from '../../user/entities/user.entity';
import { PitchDeck } from '../../pitchdeck/entities/pitch-deck.entity';
import { RecommendationType } from '../types/recommendation.types';

/**
 * Recommendation entity - stores generated recommendations with scores
 *
 * Tracks similarity-based, trending, and collaborative recommendations
 * for pitch decks. Each recommendation links a source deck to target decks
 * with similarity scores and reasoning.
 */
@Entity({ collection: 'recommendations' })
export class Recommendation extends BaseEntity {
  @PrimaryKey()
  _id!: ObjectId;

  @Index()
  @Property()
  uuid!: string;

  @Index()
  @Property()
  userId!: string;

  @Index()
  @Property()
  sourceDeckId!: string;

  @Index()
  @Property()
  targetDeckId!: string;

  @Property()
  similarityScore!: number;

  @Index()
  @Property()
  recommendationType!: RecommendationType;

  @Property()
  reason!: string;

  @Property({ nullable: true })
  metadata?: Record<string, unknown>;

  @Property({ nullable: true })
  expiresAt?: Date;

  @Property()
  generatedAt!: Date;

  @ManyToOne(() => User)
  owner!: Rel<User>;

  @ManyToOne(() => PitchDeck)
  sourceDeck!: Rel<PitchDeck>;

  @ManyToOne(() => PitchDeck)
  targetDeck!: Rel<PitchDeck>;

  constructor(partial?: Partial<Recommendation>) {
    super();
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
