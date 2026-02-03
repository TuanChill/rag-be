import { IsArray, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteDocumentDto {
  @ApiProperty({
    description: 'Array of document IDs to delete',
    example: ['id1', 'id2'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  ids!: string[];
}
