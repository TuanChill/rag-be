import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class DocumentMetadataDto {
  @ApiPropertyOptional({ description: 'Source of the document', example: 'user-upload' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  source?: string;

  @ApiPropertyOptional({ description: 'Title of the document', example: 'Product Documentation' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @ApiPropertyOptional({ description: 'Author of the document', example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  author?: string;

  @ApiPropertyOptional({ description: 'Creation date', example: '2026-02-03T10:00:00Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAt?: Date;
}

class DocumentDto {
  @ApiProperty({ description: 'Document content', example: 'This is the main content of the document...' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100000, { message: 'Document content exceeds 100KB limit' })
  pageContent: string;

  @ApiPropertyOptional({ description: 'Document metadata', type: DocumentMetadataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentMetadataDto)
  metadata?: DocumentMetadataDto;
}

export class IngestDocumentDto {
  @ApiProperty({ description: 'Array of documents to ingest', type: [DocumentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents: DocumentDto[];
}
