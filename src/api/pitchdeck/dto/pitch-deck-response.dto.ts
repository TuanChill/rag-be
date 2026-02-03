import { PitchDeck, DeckStatus } from '../entities/pitch-deck.entity';
import { ApiProperty } from '@nestjs/swagger';

export class PitchDeckResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  uuid!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  originalFileName!: string;

  @ApiProperty()
  mimeType!: string;

  @ApiProperty()
  fileSize!: number;

  @ApiProperty()
  status!: DeckStatus;

  @ApiProperty()
  chunkCount!: number;

  @ApiProperty({ required: false })
  errorMessage?: string;

  @ApiProperty({ required: false, type: [String] })
  tags?: string[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty()
  lastAccessedAt!: Date;

  static fromEntity(entity: PitchDeck): PitchDeckResponseDto {
    return {
      id: entity.id,
      uuid: entity.uuid,
      title: entity.title,
      description: entity.description,
      originalFileName: entity.originalFileName,
      mimeType: entity.mimeType,
      fileSize: entity.fileSize,
      status: entity.status,
      chunkCount: entity.chunkCount,
      errorMessage: entity.errorMessage,
      tags: entity.tags,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      lastAccessedAt: entity.lastAccessedAt,
    };
  }
}
