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
import { InteractionType } from '../types/recommendation.types';

/**
 * UserInteraction entity - tracks user feedback for collaborative filtering
 *
 * Records all user interactions with pitch decks to power
 * collaborative filtering recommendations. Each interaction
 * contributes to understanding user preferences.
 */
@Entity({ collection: 'user_interactions' })
export class UserInteraction extends BaseEntity {
  @PrimaryKey()
  _id!: ObjectId;

  @Index()
  @Property()
  userId!: string;

  @Index()
  @Property()
  deckId!: string;

  @Index()
  @Property()
  action!: InteractionType;

  @Index()
  @Property()
  timestamp!: Date;

  @Property({ nullable: true })
  sessionId?: string;

  @Property({ nullable: true })
  metadata?: Record<string, unknown>;

  @ManyToOne(() => User)
  user!: Rel<User>;

  @ManyToOne(() => PitchDeck)
  deck!: Rel<PitchDeck>;

  constructor(partial?: Partial<UserInteraction>) {
    super();
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
