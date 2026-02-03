import { IsArray, IsOptional, IsString, MaxLength, ValidateNested, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

class DeleteFilterDto {
  @ApiPropertyOptional({ description: 'Filter by source', example: 'user-upload' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  source?: string;

  @ApiPropertyOptional({ description: 'Filter by title', example: 'Product Documentation' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @ApiPropertyOptional({ description: 'Filter by author', example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  author?: string;
}

export class DeleteDocumentDto {
  @ApiPropertyOptional({ description: 'Array of document IDs to delete', example: ['id1', 'id2'] })
  @ValidateIf((o) => !o.filter)
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  ids?: string[];

  @ApiPropertyOptional({ description: 'Metadata filter for deletion', type: DeleteFilterDto })
  @ValidateIf((o) => !o.ids)
  @ValidateNested()
  @Type(() => DeleteFilterDto)
  filter?: DeleteFilterDto;
}
