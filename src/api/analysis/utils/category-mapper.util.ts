import { AnalysisCategory } from '@agents/analysis/interfaces/category-analysis.interface';
import { VCCategory } from '../dto/ui-analysis-response.dto';

/**
 * Category Mapper Utility
 * Phase 03: Intelligent category mapping from 6 backend to 7 frontend categories
 */

/**
 * How much of the source category score to apply to each target category
 * Used when one backend category maps to multiple frontend categories
 */
export interface CategoryDistribution {
  targetCategory: VCCategory;
  percentage: number; // 0-1, the portion of score to apply
}

/**
 * Mapping configuration for each backend category
 */
export interface CategoryMapping {
  targets: CategoryDistribution[];
  distribute?: boolean; // If true, distribute overall score across all categories
}

/**
 * Category mapping configuration
 * Maps 6 backend AnalysisCategory to 7 frontend VCCategory
 *
 * Strategy:
 * - market_opportunity splits into marketSize (50%), traction (30%), productSolution (20%)
 * - Overall assessment distributes evenly across all 7 categories
 * - Other categories have direct 1:1 mapping
 */
export const CATEGORY_MAPPING: Record<AnalysisCategory, CategoryMapping> = {
  overall_assessment: {
    targets: [
      { targetCategory: 'teamAndFounders', percentage: 1 / 7 },
      { targetCategory: 'marketSize', percentage: 1 / 7 },
      { targetCategory: 'productSolution', percentage: 1 / 7 },
      { targetCategory: 'traction', percentage: 1 / 7 },
      { targetCategory: 'businessModel', percentage: 1 / 7 },
      { targetCategory: 'competition', percentage: 1 / 7 },
      { targetCategory: 'financials', percentage: 1 / 7 },
    ],
    distribute: true,
  },
  market_opportunity: {
    targets: [
      { targetCategory: 'marketSize', percentage: 0.5 },
      { targetCategory: 'traction', percentage: 0.3 },
      { targetCategory: 'productSolution', percentage: 0.2 },
    ],
  },
  business_model: {
    targets: [{ targetCategory: 'businessModel', percentage: 1.0 }],
  },
  team_execution: {
    targets: [{ targetCategory: 'teamAndFounders', percentage: 1.0 }],
  },
  financial_projections: {
    targets: [{ targetCategory: 'financials', percentage: 1.0 }],
  },
  competitive_landscape: {
    targets: [{ targetCategory: 'competition', percentage: 1.0 }],
  },
};

/**
 * Default scores for categories that have no backend source
 * These will remain as null/undefined to indicate missing data
 */
export const UNMAPPED_CATEGORIES: VCCategory[] = [];

/**
 * Map a single backend category score to multiple frontend categories
 *
 * @param backendCategory - The backend AnalysisCategory
 * @param score - The score value (0-100)
 * @param weight - The weight value (0-1)
 * @returns Array of mapped frontend categories with their scores
 */
export function mapBackendToFrontend(
  backendCategory: AnalysisCategory,
  score: number,
  weight: number,
): Map<VCCategory, { score: number; weight: number }> {
  const result = new Map<VCCategory, { score: number; weight: number }>();
  const mapping = CATEGORY_MAPPING[backendCategory];

  if (!mapping) {
    return result;
  }

  for (const target of mapping.targets) {
    const adjustedScore = score * target.percentage;
    const adjustedWeight = weight * target.percentage;

    // If this category already has a value from another source,
    // we need to decide how to handle it. For Phase 03, we'll
    // add to existing values (cumulative).
    const existing = result.get(target.targetCategory);
    if (existing) {
      result.set(target.targetCategory, {
        score: existing.score + adjustedScore,
        weight: existing.weight + adjustedWeight,
      });
    } else {
      result.set(target.targetCategory, {
        score: adjustedScore,
        weight: adjustedWeight,
      });
    }
  }

  return result;
}

/**
 * Check if a frontend category has any backend source
 */
export function isCategoryMapped(category: VCCategory): boolean {
  for (const mapping of Object.values(CATEGORY_MAPPING)) {
    if (mapping.targets.some((t) => t.targetCategory === category)) {
      return true;
    }
  }
  return false;
}

/**
 * Get list of frontend categories that have no backend mapping
 */
export function getUnmappedCategories(): VCCategory[] {
  const allCategories: VCCategory[] = [
    'teamAndFounders',
    'marketSize',
    'productSolution',
    'traction',
    'businessModel',
    'competition',
    'financials',
  ];

  return allCategories.filter((cat) => !isCategoryMapped(cat));
}
