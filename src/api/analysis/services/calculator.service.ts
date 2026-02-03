/**
 * Score Calculator Service
 * Phase 6: Orchestration Service
 * Phase 9: UI Output Format - Added category scoring
 */
import { Injectable } from '@nestjs/common';
import { AnalysisScore } from '../entities/analysis-score.entity';
import {
  AnalysisCategory,
  CategoryScoreMap,
} from '@agents/analysis/interfaces/category-analysis.interface';

@Injectable()
export class CalculatorService {
  /**
   * Calculate overall score from weighted components
   */
  calculateOverallScore(scores: AnalysisScore[]): number {
    let totalWeight = 0;
    let weightedSum = 0;

    for (const score of scores) {
      weightedSum += score.score * score.weight;
      totalWeight += score.weight;
    }

    if (totalWeight === 0) return 0;
    return Math.round(weightedSum / totalWeight);
  }

  /**
   * Normalize score to 0-100 range
   */
  normalizeScore(rawScore: number, min = 0, max = 100): number {
    if (rawScore < min) return min;
    if (rawScore > max) return max;
    return rawScore;
  }

  /**
   * Calculate percentile rank (for benchmarking)
   */
  calculatePercentile(score: number, benchmarkScores: number[]): number {
    if (benchmarkScores.length === 0) return 50;

    const lowerCount = benchmarkScores.filter((s) => s < score).length;
    return Math.round((lowerCount / benchmarkScores.length) * 100);
  }

  /**
   * Calculate overall score from category scores
   * Phase 9: UI Output Format - Equal 20% weights for all categories
   *
   * Weights: Market (20%), Business Model (20%), Team (20%), Financial (20%), Competitive (20%)
   * Overall Assessment is excluded from calculation (descriptive, not scored)
   */
  calculateOverallFromCategories(categoryScores: CategoryScoreMap): number {
    const weights: Record<AnalysisCategory, number> = {
      market_opportunity: 0.2,
      business_model: 0.2,
      team_execution: 0.2,
      financial_projections: 0.2,
      competitive_landscape: 0.2,
      overall_assessment: 0, // Excluded from calculation
    };

    let weightedSum = 0;
    let totalWeight = 0;

    for (const [category, score] of categoryScores.entries()) {
      if (weights[category] && weights[category] > 0) {
        weightedSum += score * weights[category];
        totalWeight += weights[category];
      }
    }

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  }

  /**
   * Calculate overall score from category array
   * Phase 9: UI Output Format - Helper method for array input
   */
  calculateOverallFromCategoryArray(
    categories: { category: AnalysisCategory; score: number }[],
  ): number {
    const scoreMap = new Map<AnalysisCategory, number>(
      categories.map((c) => [c.category, c.score]),
    );
    return this.calculateOverallFromCategories(scoreMap);
  }
}
