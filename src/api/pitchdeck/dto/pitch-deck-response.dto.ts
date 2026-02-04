import { PitchDeck, DeckStatus } from '../entities/pitch-deck.entity';
import { PitchDeckFileResponseDto } from './pitch-deck-file-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { PitchDeckFile } from '../entities/pitch-deck-file.entity';

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
  status!: DeckStatus;

  @ApiProperty()
  chunkCount!: number;

  @ApiProperty()
  fileCount!: number;

  @ApiProperty({ required: false })
  errorMessage?: string;

  @ApiProperty({ required: false, type: [String] })
  tags?: string[];

  @ApiProperty({ type: [PitchDeckFileResponseDto] })
  files!: PitchDeckFileResponseDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty()
  lastAccessedAt!: Date;

  static fromEntity(
    entity: PitchDeck,
    files?: PitchDeckFile[],
  ): PitchDeckResponseDto {
    if (!entity) {
      throw new Error('Entity is required');
    }
    return {
      id: entity._id.toString(),
      uuid: entity.uuid,
      title: entity.title,
      description: entity.description,
      status: entity.status,
      chunkCount: entity.chunkCount,
      fileCount: entity.fileCount,
      errorMessage: entity.errorMessage,
      tags: entity.tags,
      files: files?.map((f) => PitchDeckFileResponseDto.fromEntity(f)) || [],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      lastAccessedAt: entity.lastAccessedAt,
    };
  }
}
