import { ApiProperty } from '@nestjs/swagger';
import {
  AnalysisStatus,
  ScoreCategory,
  FindingType,
  FindingSeverity,
  AnalysisType,
} from '../types/analysis.types';
import { AnalysisResult } from '../entities/analysis-result.entity';

/**
 * Score data in response
 */
export class AnalysisScoreResponseDto {
  @ApiProperty({ description: 'Score category' })
  category!: ScoreCategory;

  @ApiProperty({ description: 'Score value (0-100)' })
  score!: number;

  @ApiProperty({ description: 'Weight in overall calculation' })
  weight!: number;

  @ApiProperty({ description: 'Detailed explanation', required: false })
  details?: string;

  @ApiProperty({ description: 'Source agent', required: false })
  sourceAgent?: string;
}

/**
 * Finding data in response
 */
export class AnalysisFindingResponseDto {
  @ApiProperty({ description: 'Type of finding' })
  type!: FindingType;

  @ApiProperty({ description: 'Short title' })
  title!: string;

  @ApiProperty({ description: 'Detailed description' })
  description!: string;

  @ApiProperty({
    description: 'Severity level',
    required: false,
    enum: ['critical', 'major', 'minor', 'info'],
  })
  severity?: FindingSeverity;

  @ApiProperty({ description: 'Source agent', required: false })
  source?: string;

  @ApiProperty({ description: 'Related slide reference', required: false })
  reference?: string;
}

/**
 * Complete analysis response
 */
export class AnalysisResponseDto {
  @ApiProperty({ description: 'Analysis UUID' })
  uuid!: string;

  @ApiProperty({ description: 'Overall score (0-100)', required: false })
  overallScore?: number;

  @ApiProperty({ description: 'Analysis status' })
  status!: AnalysisStatus;

  @ApiProperty({
    description: 'Analysis type',
    enum: ['full', 'sector', 'stage', 'thesis'],
  })
  analysisType!: AnalysisType;

  @ApiProperty({
    type: [AnalysisScoreResponseDto],
    description: 'Component scores',
  })
  scores!: AnalysisScoreResponseDto[];

  @ApiProperty({ type: [AnalysisFindingResponseDto], description: 'Findings' })
  findings!: AnalysisFindingResponseDto[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Completion timestamp', required: false })
  completedAt?: Date;

  @ApiProperty({ description: 'Job ID for tracking', required: false })
  jobId?: string;

  @ApiProperty({ description: 'Pitch deck UUID' })
  deckId!: string;

  /**
   * Convert entity to DTO
   */
  static fromEntity(entity: AnalysisResult): AnalysisResponseDto {
    return {
      uuid: entity.uuid,
      overallScore: entity.overallScore,
      status: entity.status,
      analysisType: entity.analysisType,
      scores:
        entity.scores?.map((s) => ({
          category: s.category,
          score: s.score,
          weight: s.weight,
          details: s.details,
          sourceAgent: s.sourceAgent,
        })) || [],
      findings:
        entity.findings?.map((f) => ({
          type: f.type,
          title: f.title,
          description: f.description,
          severity: f.severity,
          source: f.source,
          reference: f.reference,
        })) || [],
      createdAt: entity.createdAt,
      completedAt: entity.completedAt,
      jobId: entity.jobId,
      deckId: entity.deck?.uuid || '',
    };
  }
}

/**
 * Phase 9: Category Finding DTO for UI-compatible response
 */
export class CategoryFindingDto {
  @ApiProperty({ description: 'Finding title (5-10 words)' })
  title!: string;

  @ApiProperty({ description: 'Detailed description (2-3 sentences)' })
  description!: string;

  @ApiProperty({
    description: 'Impact type',
    enum: ['positive', 'negative', 'neutral'],
  })
  impact!: 'positive' | 'negative' | 'neutral';

  @ApiProperty({
    description: 'Severity level',
    enum: ['critical', 'major', 'minor'],
  })
  severity!: 'critical' | 'major' | 'minor';

  @ApiProperty({ description: 'Actionable recommendations', required: false })
  recommendations?: string[];

  @ApiProperty({ description: 'Supporting evidence', required: false })
  evidence?: {
    quote?: string;
    slideNumber?: number;
  };
}

/**
 * Phase 9: Category Analysis Response for UI
 */
export class CategoryAnalysisResponse {
  @ApiProperty({ description: 'Category score (0-100)' })
  score!: number;

  @ApiProperty({ description: '2-3 sentence summary' })
  summary!: string;

  @ApiProperty({ description: 'Category findings', type: [CategoryFindingDto] })
  findings!: CategoryFindingDto[];

  @ApiProperty({
    description: 'UI state hint - expanded by default',
    required: false,
  })
  isExpanded?: boolean;
}

/**
 * Phase 9: UI-Compatible Analysis Response with categories
 */
export class AnalysisResponseUiDto {
  @ApiProperty({ description: 'Analysis UUID' })
  uuid!: string;

  @ApiProperty({ description: 'Pitch deck ID' })
  deckId!: string;

  @ApiProperty({ description: 'Analysis status' })
  status!: AnalysisStatus;

  @ApiProperty({ description: 'Overall score (0-100)' })
  overallScore!: number;

  @ApiProperty({
    description: 'Overall assessment',
    type: CategoryAnalysisResponse,
  })
  overallAssessment!: CategoryAnalysisResponse;

  @ApiProperty({
    description: 'Market opportunity',
    type: CategoryAnalysisResponse,
  })
  marketOpportunity!: CategoryAnalysisResponse;

  @ApiProperty({
    description: 'Business model',
    type: CategoryAnalysisResponse,
  })
  businessModel!: CategoryAnalysisResponse;

  @ApiProperty({
    description: 'Team & execution',
    type: CategoryAnalysisResponse,
  })
  teamExecution!: CategoryAnalysisResponse;

  @ApiProperty({
    description: 'Financial projections',
    type: CategoryAnalysisResponse,
  })
  financialProjections!: CategoryAnalysisResponse;

  @ApiProperty({
    description: 'Competitive landscape',
    type: CategoryAnalysisResponse,
  })
  competitiveLandscape!: CategoryAnalysisResponse;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Completion timestamp', required: false })
  completedAt?: Date;
}
