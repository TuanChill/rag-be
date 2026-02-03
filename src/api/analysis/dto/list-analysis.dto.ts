/**
 * List Analysis DTO
 * Phase 7: API Endpoints
 *
 * Query parameters for listing user's analyses
 */
import { IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AnalysisStatus } from '../types/analysis.types';

export class ListAnalysisDto {
  @ApiProperty({
    description: 'Filter by status',
    required: false,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
  })
  @IsOptional()
  @IsEnum(['pending', 'running', 'completed', 'failed', 'cancelled'])
  status?: AnalysisStatus;

  @ApiProperty({
    description: 'Limit results',
    required: false,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({
    description: 'Offset for pagination',
    required: false,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}
