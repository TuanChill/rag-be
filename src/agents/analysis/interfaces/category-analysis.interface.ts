/**
 * Category Analysis interfaces for UI-compatible output
 * Phase 9: UI Output Format Modifications
 *
 * Provides category-based analysis with scores (0-100) for UI rendering
 */

/** Analysis category types matching UI sections */
export type AnalysisCategory =
  | 'overall_assessment'
  | 'market_opportunity'
  | 'business_model'
  | 'team_execution'
  | 'financial_projections'
  | 'competitive_landscape';

/** Category finding with impact-based classification */
export interface CategoryFinding {
  title: string; // 5-10 words
  description: string; // 2-3 sentences
  impact: 'positive' | 'negative' | 'neutral';
  severity: 'critical' | 'major' | 'minor';
  recommendations?: string[];
  evidence?: {
    quote?: string;
    slideNumber?: number;
  };
}

/** Complete category analysis output with score */
export interface CategoryAnalysisOutput {
  category: AnalysisCategory;
  score: number; // 0-100
  summary: string; // 2-3 sentence summary
  findings: CategoryFinding[];
  metadata: {
    executionTime: number;
    agent: string;
    findingCount: number;
  };
}

/** Map of category scores for overall calculation */
export type CategoryScoreMap = Map<AnalysisCategory, number>;
