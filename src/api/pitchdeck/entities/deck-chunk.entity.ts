import { Entity, Property, PrimaryKey, ManyToOne, Rel } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { BaseEntity } from '../../../core/base/base.entity';
import { PitchDeck } from './pitch-deck.entity';

@Entity({ collection: 'deck_chunks' })
export class DeckChunk extends BaseEntity {
  @PrimaryKey()
  _id!: ObjectId;

  @Property()
  astraId!: string;

  @Property()
  chunkIndex!: number;

  @Property({ nullable: true })
  pageNumber?: number;

  @Property()
  tokenCount!: number;

  @ManyToOne(() => PitchDeck)
  deck!: Rel<PitchDeck>;

  constructor(partial?: Partial<DeckChunk>) {
    super();
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
