import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class FilterDto {
  @ApiPropertyOptional({
    description: 'Filter by source',
    example: 'user-upload',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  source?: string;

  @ApiPropertyOptional({
    description: 'Filter by title',
    example: 'Product Documentation',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @ApiPropertyOptional({ description: 'Filter by author', example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  author?: string;

  // Index signature to allow additional filter properties
  [key: string]: unknown;
}

export class QueryDocumentDto {
  @ApiProperty({ description: 'Search query', example: 'What is RAG?' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000, { message: 'Query exceeds 1000 character limit' })
  query: string;

  @ApiPropertyOptional({
    description: 'Number of results to return',
    example: 5,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  topK?: number = 5;

  @ApiPropertyOptional({ description: 'Metadata filter', type: FilterDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterDto)
  filter?: FilterDto;
}
