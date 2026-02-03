import {
  Entity,
  Property,
  PrimaryKey,
  ManyToOne,
  OneToMany,
  Collection,
  Rel,
  Cascade,
} from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { BaseEntity } from '../../../core/base/base.entity';
import { User } from '../../user/entities/user.entity';
import { DeckChunk } from './deck-chunk.entity';
import { PitchDeckFile } from './pitch-deck-file.entity';
import { MimeType } from '../constants/file-types';

export type DeckStatus = 'uploading' | 'processing' | 'ready' | 'error';

@Entity({ collection: 'pitch_decks' })
export class PitchDeck extends BaseEntity {
  @PrimaryKey()
  _id!: ObjectId;

  @Property()
  uuid!: string;

  @Property()
  title!: string;

  @Property({ nullable: true })
  description?: string;

  @Property()
  status!: DeckStatus;

  @Property()
  chunkCount!: number;

  @Property()
  astraCollection!: string;

  @Property({ nullable: true })
  errorMessage?: string;

  @ManyToOne(() => User)
  owner!: Rel<User>;

  @OneToMany(() => DeckChunk, (chunk) => chunk.deck)
  chunks = new Collection<DeckChunk>(this);

  @OneToMany(() => PitchDeckFile, (file) => file.deck, {
    cascade: [Cascade.REMOVE],
  })
  files = new Collection<PitchDeckFile>(this);

  @Property()
  fileCount!: number;

  @Property({ nullable: true })
  tags?: string[];

  @Property()
  lastAccessedAt!: Date;

  constructor(partial?: Partial<PitchDeck>) {
    super();
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
