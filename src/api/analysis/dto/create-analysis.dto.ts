import { IsOptional, IsEnum, IsUUID, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AnalysisType } from '../types/analysis.types';

/**
 * DTO for creating a new analysis request
 */
export class CreateAnalysisDto {
  @ApiProperty({ description: 'Pitch deck UUID to analyze' })
  @IsUUID()
  deckId!: string;

  @ApiProperty({
    description: 'Analysis type',
    enum: ['full', 'sector', 'stage', 'thesis'],
    default: 'full',
    required: false,
  })
  @IsOptional()
  @IsEnum(['full', 'sector', 'stage', 'thesis'])
  type?: AnalysisType;

  @ApiProperty({
    description: 'Priority for queue processing (1=high, 10=low)',
    minimum: 1,
    maximum: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  priority?: number;
}
