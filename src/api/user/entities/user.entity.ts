import {
  Entity,
  Property,
  PrimaryKey,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { BaseEntity } from '../../../core/base/base.entity';
import { Exclude } from 'class-transformer';
import { PitchDeck } from '../../pitchdeck/entities/pitch-deck.entity';

@Entity({
  collection: 'users',
})
export class User extends BaseEntity {
  @PrimaryKey()
  _id!: ObjectId;

  @Property()
  username!: string;

  @Property()
  @Exclude()
  password!: string;

  @OneToMany(() => PitchDeck, (deck) => deck.owner)
  pitchDecks = new Collection<PitchDeck>(this);

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }
}
