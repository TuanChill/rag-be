import { ApiProperty } from '@nestjs/swagger';
import { AnalysisResult } from '../entities/analysis-result.entity';
import { toUiDto } from '../utils/analysis-mapper.util';

/**
 * VC Framework Category Types - matches frontend VCCategory
 */
export type VCCategory =
  | 'teamAndFounders'
  | 'marketSize'
  | 'productSolution'
  | 'traction'
  | 'businessModel'
  | 'competition'
  | 'financials';

/**
 * Impact level for strength items
 */
export type ImpactLevel = 'high' | 'medium' | 'low';

/**
 * Severity level for improvement items
 */
export type SeverityLevel = 'high' | 'medium' | 'low';

/**
 * Market trend direction
 */
export type MarketTrend = 'rising' | 'stable' | 'declining';

/**
 * Evidence quote from pitch deck
 */
export class EvidenceQuoteDto {
  @ApiProperty({ description: 'Quote text from pitch deck' })
  text!: string;

  @ApiProperty({ description: 'Slide number reference', required: false })
  slide?: number;

  @ApiProperty({
    description: 'Category this evidence supports',
    enum: [
      'teamAndFounders',
      'marketSize',
      'productSolution',
      'traction',
      'businessModel',
      'competition',
      'financials',
    ],
  })
  category!: VCCategory;
}

/**
 * Individual category score
 */
export class VCCategoryScoreDto {
  @ApiProperty({ description: 'Score value (0-100)' })
  score!: number;

  @ApiProperty({ description: 'Weight in overall calculation (0-1)' })
  weight!: number;

  @ApiProperty({ description: 'Detailed explanation', required: false })
  details?: string;
}

/**
 * All category scores mapped by VCCategory
 */
export class VCCategoryScoreMapDto {
  @ApiProperty({ description: 'Team and Founders score' })
  teamAndFounders!: VCCategoryScoreDto;

  @ApiProperty({ description: 'Market Size score' })
  marketSize!: VCCategoryScoreDto;

  @ApiProperty({ description: 'Product/Solution score' })
  productSolution!: VCCategoryScoreDto;

  @ApiProperty({ description: 'Traction score' })
  traction!: VCCategoryScoreDto;

  @ApiProperty({ description: 'Business Model score' })
  businessModel!: VCCategoryScoreDto;

  @ApiProperty({ description: 'Competition score' })
  competition!: VCCategoryScoreDto;

  @ApiProperty({ description: 'Financials score' })
  financials!: VCCategoryScoreDto;
}

/**
 * Strength item
 */
export class StrengthItemDto {
  @ApiProperty({ description: 'Unique identifier' })
  id!: string;

  @ApiProperty({ description: 'Short title (5-10 words)' })
  title!: string;

  @ApiProperty({ description: 'Detailed description (2-3 sentences)' })
  description!: string;

  @ApiProperty({
    description: 'Supporting evidence from pitch deck',
    type: [EvidenceQuoteDto],
  })
  evidence!: EvidenceQuoteDto[];

  @ApiProperty({
    description: 'Impact level',
    enum: ['high', 'medium', 'low'],
  })
  impact!: ImpactLevel;

  @ApiProperty({
    description: 'Associated category',
    enum: [
      'teamAndFounders',
      'marketSize',
      'productSolution',
      'traction',
      'businessModel',
      'competition',
      'financials',
    ],
  })
  category!: VCCategory;
}

/**
 * Improvement item
 */
export class ImprovementItemDto {
  @ApiProperty({ description: 'Unique identifier' })
  id!: string;

  @ApiProperty({ description: 'Short title (5-10 words)' })
  title!: string;

  @ApiProperty({ description: 'Detailed description (2-3 sentences)' })
  description!: string;

  @ApiProperty({ description: 'Actionable recommendation' })
  recommendation!: string;

  @ApiProperty({
    description: 'Severity level',
    enum: ['high', 'medium', 'low'],
  })
  severity!: SeverityLevel;

  @ApiProperty({ description: 'Priority ranking (1=high, 10=low)' })
  priority!: number;

  @ApiProperty({
    description: 'Associated category',
    enum: [
      'teamAndFounders',
      'marketSize',
      'productSolution',
      'traction',
      'businessModel',
      'competition',
      'financials',
    ],
  })
  category!: VCCategory;
}

/**
 * Competitive position on positioning map
 */
export class CompetitivePositionDto {
  @ApiProperty({ description: 'Unique identifier' })
  id!: string;

  @ApiProperty({ description: 'Company name' })
  name!: string;

  @ApiProperty({ description: 'X-axis position (e.g., market presence)' })
  x!: number;

  @ApiProperty({ description: 'Y-axis position (e.g., innovation level)' })
  y!: number;

  @ApiProperty({ description: "Whether this is the user's pitch deck" })
  isUser!: boolean;
}

/**
 * Differentiator aspect
 */
export class DifferentiatorDto {
  @ApiProperty({ description: 'Unique identifier' })
  id!: string;

  @ApiProperty({ description: 'Aspect name (e.g., pricing, technology)' })
  aspect!: string;

  @ApiProperty({ description: "User's pitch deck score (0-100)" })
  userScore!: number;

  @ApiProperty({ description: 'Average competitor score (0-100)' })
  competitorAvg!: number;

  @ApiProperty({ description: 'Description of the differentiation' })
  description!: string;
}

/**
 * Market opportunity data
 */
export class MarketOpportunityDto {
  @ApiProperty({ description: 'Market size (e.g., $10B TAM)' })
  size!: string;

  @ApiProperty({ description: 'Growth rate (e.g., 15% CAGR)' })
  growth!: string;

  @ApiProperty({
    description: 'Market trend direction',
    enum: ['rising', 'stable', 'declining'],
  })
  trend!: MarketTrend;
}

/**
 * Competitive analysis
 */
export class CompetitiveAnalysisDto {
  @ApiProperty({
    description: 'Positioning map data',
    type: [CompetitivePositionDto],
  })
  positioning!: CompetitivePositionDto[];

  @ApiProperty({
    description: 'Key differentiators',
    type: [DifferentiatorDto],
  })
  differentiators!: DifferentiatorDto[];

  @ApiProperty({ description: 'Market opportunity assessment' })
  marketOpportunity!: MarketOpportunityDto;
}

/**
 * UI-Compatible Analysis Result
 * Matches frontend AnalysisResult type exactly
 */
export class UIAnalysisResultDto {
  @ApiProperty({ description: 'Pitch deck UUID' })
  deckId!: string;

  @ApiProperty({ description: 'Original filename (optional)', required: false })
  filename?: string;

  @ApiProperty({ description: 'Overall score (0-100)' })
  overallScore!: number;

  @ApiProperty({ description: 'Scores for all VC categories' })
  categoryScores!: VCCategoryScoreMapDto;

  @ApiProperty({ description: 'Strengths identified', type: [StrengthItemDto] })
  strengths!: StrengthItemDto[];

  @ApiProperty({
    description: 'Improvements needed',
    type: [ImprovementItemDto],
  })
  improvements!: ImprovementItemDto[];

  @ApiProperty({
    description: 'Competitive analysis (optional)',
    required: false,
  })
  competitiveAnalysis?: CompetitiveAnalysisDto;

  @ApiProperty({ description: 'When analysis was completed (ISO 8601)' })
  analyzedAt!: string;

  /**
   * Convert AnalysisResult entity to UI-compatible DTO
   * Phase 02: Uses analysis mapper utility for transformation
   * Phase 03: Will include intelligent category mapping
   */
  static fromEntity(analysis: AnalysisResult): UIAnalysisResultDto {
    return toUiDto(analysis);
  }
}
