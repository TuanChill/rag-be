/**
 * Start Analysis DTO
 * Phase 7: API Endpoints
 *
 * Request DTO for starting a new pitch deck analysis
 */
import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartAnalysisDto {
  @ApiProperty({ description: 'Pitch deck UUID to analyze' })
  @IsUUID()
  deckId!: string;

  @ApiProperty({
    description: 'Analysis type',
    enum: ['full', 'sector', 'stage', 'thesis'],
    required: false,
    default: 'full',
  })
  @IsOptional()
  @IsEnum(['full', 'sector', 'stage', 'thesis'])
  type?: 'full' | 'sector' | 'stage' | 'thesis' = 'full';
}
