import { ApiProperty } from '@nestjs/swagger';
import { FileStatus } from '../entities/pitch-deck-file.entity';
import { PitchDeckFile } from '../entities/pitch-deck-file.entity';

export class PitchDeckFileResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  uuid!: string;

  @ApiProperty()
  originalFileName!: string;

  @ApiProperty()
  mimeType!: string;

  @ApiProperty()
  fileSize!: number;

  @ApiProperty()
  status!: FileStatus;

  @ApiProperty({ required: false })
  errorMessage?: string;

  @ApiProperty()
  createdAt!: Date;

  static fromEntity(entity: PitchDeckFile): PitchDeckFileResponseDto {
    if (!entity) {
      throw new Error('Entity is required');
    }
    return {
      id: entity._id.toString(),
      uuid: entity.uuid,
      originalFileName: entity.originalFileName,
      mimeType: entity.mimeType,
      fileSize: entity.fileSize,
      status: entity.status,
      errorMessage: entity.errorMessage,
      createdAt: entity.createdAt,
    };
  }
}
