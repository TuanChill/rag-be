import {
  Entity,
  Property,
  PrimaryKey,
  ManyToOne,
  OneToMany,
  Collection,
  Rel,
} from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { BaseEntity } from '../../../core/base/base.entity';
import { User } from '../../user/entities/user.entity';
import { DeckChunk } from './deck-chunk.entity';

export type DeckStatus = 'uploading' | 'processing' | 'ready' | 'error';
export type MimeType =
  | 'application/pdf'
  | 'application/vnd.ms-powerpoint'
  | 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

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
  originalFileName!: string;

  @Property()
  mimeType!: MimeType;

  @Property()
  fileSize!: number;

  @Property()
  storagePath!: string;

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
