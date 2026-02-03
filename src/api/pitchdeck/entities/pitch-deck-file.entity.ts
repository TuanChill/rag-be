import {
  Entity,
  Property,
  PrimaryKey,
  ManyToOne,
  Rel,
  Index,
} from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { BaseEntity } from '../../../core/base/base.entity';
import { PitchDeck } from './pitch-deck.entity';
import { MimeType } from '../constants/file-types';

export type FileStatus = 'uploading' | 'ready' | 'error';

@Entity({ collection: 'pitch_deck_files' })
export class PitchDeckFile extends BaseEntity {
  @PrimaryKey()
  _id!: ObjectId;

  @Property()
  uuid!: string;

  @Property()
  originalFileName!: string;

  @Property()
  mimeType!: MimeType;

  @Property()
  fileSize!: number;

  @Property()
  storagePath!: string;

  @Property()
  status!: FileStatus;

  @Property({ nullable: true })
  errorMessage?: string;

  @Index()
  @ManyToOne(() => PitchDeck)
  deck!: Rel<PitchDeck>;

  constructor(partial?: Partial<PitchDeckFile>) {
    super();
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
