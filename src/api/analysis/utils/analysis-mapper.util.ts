import { AnalysisResult } from '../entities/analysis-result.entity';
import { AnalysisFinding } from '../entities/analysis-finding.entity';
import { EntityDTO } from '@mikro-orm/core';
import {
  UIAnalysisResultDto,
  VCCategoryScoreMapDto,
  VCCategoryScoreDto,
  EvidenceQuoteDto,
  StrengthItemDto,
  ImprovementItemDto,
  VCCategory,
  ImpactLevel,
  SeverityLevel,
} from '../dto/ui-analysis-response.dto';
import { mapBackendToFrontend as mapCategoryWithDistribution } from './category-mapper.util';

/**
 * Analysis Mapper Utility
 * Transforms AnalysisResult entity to UI-compatible DTO
 * Phase 02: Response Mapper
 * Phase 03: Enhanced with intelligent category mapping
 */

/** Default weight for each category (1/7 for equal weighting) */
const DEFAULT_CATEGORY_WEIGHT = 1 / 7;

/** Default score for unmapped categories */
const DEFAULT_CATEGORY_SCORE = 0;

/**
 * Extract all category scores from AnalysisResult
 * Phase 03: Enhanced with intelligent category mapping
 */
function mapCategoryScores(analysis: AnalysisResult): VCCategoryScoreMapDto {
  // Initialize all 7 categories with defaults
  const categoryScores: Record<VCCategory, VCCategoryScoreDto> = {
    teamAndFounders: {
      score: DEFAULT_CATEGORY_SCORE,
      weight: DEFAULT_CATEGORY_WEIGHT,
    },
    marketSize: {
      score: DEFAULT_CATEGORY_SCORE,
      weight: DEFAULT_CATEGORY_WEIGHT,
    },
    productSolution: {
      score: DEFAULT_CATEGORY_SCORE,
      weight: DEFAULT_CATEGORY_WEIGHT,
    },
    traction: {
      score: DEFAULT_CATEGORY_SCORE,
      weight: DEFAULT_CATEGORY_WEIGHT,
    },
    businessModel: {
      score: DEFAULT_CATEGORY_SCORE,
      weight: DEFAULT_CATEGORY_WEIGHT,
    },
    competition: {
      score: DEFAULT_CATEGORY_SCORE,
      weight: DEFAULT_CATEGORY_WEIGHT,
    },
    financials: {
      score: DEFAULT_CATEGORY_SCORE,
      weight: DEFAULT_CATEGORY_WEIGHT,
    },
  };

  // Accumulator for mapped scores (handles cumulative mapping)
  const accumulator = new Map<
    VCCategory,
    { score: number; weight: number; details?: string }
  >();

  // Map scores from entity using category mapper
  if (analysis.scores) {
    for (const scoreEntity of analysis.scores) {
      if (scoreEntity.analysisCategory) {
        // Use intelligent category mapper from Phase 03
        const mappedCategories = mapCategoryWithDistribution(
          scoreEntity.analysisCategory,
          scoreEntity.score,
          scoreEntity.weight || DEFAULT_CATEGORY_WEIGHT,
        );

        // Accumulate mapped scores
        for (const [category, value] of mappedCategories.entries()) {
          const existing = accumulator.get(category);
          if (existing) {
            accumulator.set(category, {
              score: existing.score + value.score,
              weight: existing.weight + value.weight,
              details:
                scoreEntity.summary || scoreEntity.details || existing.details,
            });
          } else {
            accumulator.set(category, {
              score: value.score,
              weight: value.weight,
              details: scoreEntity.summary || scoreEntity.details,
            });
          }
        }
      }
    }
  }

  // Apply accumulated scores to categoryScores
  for (const [category, value] of accumulator.entries()) {
    categoryScores[category] = {
      score: Math.min(100, value.score), // Cap at 100
      weight: value.weight,
      details: value.details,
    };
  }

  return categoryScores as VCCategoryScoreMapDto;
}

/**
 * Map finding severity to frontend impact/severity levels
 */
function mapFindingSeverity(
  backendSeverity: string | undefined,
): ImpactLevel | SeverityLevel {
  if (!backendSeverity) return 'medium';

  const mapping: Record<string, ImpactLevel | SeverityLevel> = {
    critical: 'high',
    major: 'high',
    minor: 'low',
    info: 'low',
  };

  return (mapping[backendSeverity] || 'medium') as ImpactLevel | SeverityLevel;
}

/**
 * Map VCCategory string to enum type
 */
function toVCCategory(category: string): VCCategory {
  const validCategories: VCCategory[] = [
    'teamAndFounders',
    'marketSize',
    'productSolution',
    'traction',
    'businessModel',
    'competition',
    'financials',
  ];

  if (validCategories.includes(category as VCCategory)) {
    return category as VCCategory;
  }

  return 'businessModel'; // Default fallback
}

/**
 * Extract evidence quotes from findings
 */
function extractEvidenceQuotes(_finding: AnalysisFinding): EvidenceQuoteDto[] {
  // Phase 02: Return empty array - Phase 03 can extract from description
  // Future enhancement: parse description for quoted content
  return [];
}

/**
 * Map findings to StrengthItem array
 */
function mapStrengths(
  findings: (AnalysisFinding | EntityDTO<AnalysisFinding>)[],
): StrengthItemDto[] {
  return findings
    .filter((f) => f.type === 'strength')
    .map((finding) => ({
      id: finding._id.toString(),
      title: finding.title,
      description: finding.description,
      evidence: extractEvidenceQuotes(finding as AnalysisFinding),
      impact: mapFindingSeverity(finding.severity) as ImpactLevel,
      category: toVCCategory(finding.source || 'businessModel'),
    }));
}

/**
 * Map findings to ImprovementItem array
 */
function mapImprovements(
  findings: (AnalysisFinding | EntityDTO<AnalysisFinding>)[],
): ImprovementItemDto[] {
  return findings
    .filter((f) => f.type === 'weakness' || f.type === 'threat')
    .map((finding, index) => ({
      id: finding._id.toString(),
      title: finding.title,
      description: finding.description,
      recommendation: finding.description, // Use description as recommendation for now
      severity: mapFindingSeverity(finding.severity) as SeverityLevel,
      priority: index + 1, // Simple priority based on order
      category: toVCCategory(finding.source || 'businessModel'),
    }));
}

/**
 * Build competitive analysis from findings
 * Phase 02: Returns undefined - competitive data requires dedicated extraction
 */
function buildCompetitiveAnalysis(
  _analysis: AnalysisResult,
): UIAnalysisResultDto['competitiveAnalysis'] {
  // Phase 02: No competitive analysis data available
  // Phase 03 or future: Extract from competitive_landscape findings
  return undefined;
}

/**
 * Main transformation function
 * Converts AnalysisResult entity to UIAnalysisResultDto
 */
export function toUiDto(analysis: AnalysisResult): UIAnalysisResultDto {
  // Convert Collection to array for findings
  const findings = analysis.findings?.toArray() ?? [];

  return {
    deckId: analysis.deckUuid,
    overallScore: analysis.overallScore ?? DEFAULT_CATEGORY_SCORE,
    categoryScores: mapCategoryScores(analysis),
    strengths: mapStrengths(findings),
    improvements: mapImprovements(findings),
    competitiveAnalysis: buildCompetitiveAnalysis(analysis),
    analyzedAt: analysis.completedAt?.toISOString() ?? new Date().toISOString(),
  };
}
