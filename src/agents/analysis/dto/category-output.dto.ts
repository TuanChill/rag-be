/**
 * Category Analysis Output DTO
 * Phase 9: UI Output Format Modifications
 */
import {
  CategoryAnalysisOutput,
  CategoryFinding,
  AnalysisCategory,
} from '../interfaces/category-analysis.interface';

/** DTO wrapper for category analysis output */
export class CategoryOutputDto implements CategoryAnalysisOutput {
  category: AnalysisCategory;
  score: number;
  summary: string;
  findings: CategoryFinding[];
  metadata: {
    executionTime: number;
    agent: string;
    findingCount: number;
  };
}

/** DTO for single category finding */
export class CategoryFindingDto implements CategoryFinding {
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  severity: 'critical' | 'major' | 'minor';
  recommendations?: string[];
  evidence?: {
    quote?: string;
    slideNumber?: number;
  };
}

/** DTO for category-based response in API */
export class CategoryAnalysisResponse {
  score: number;
  summary: string;
  findings: CategoryFindingDto[];
  isExpanded?: boolean; // UI state hint
}
