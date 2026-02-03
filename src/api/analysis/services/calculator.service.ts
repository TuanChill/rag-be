/**
 * Score Calculator Service
 * Phase 6: Orchestration Service
 */
import { Injectable } from '@nestjs/common';
import { AnalysisScore } from '../entities/analysis-score.entity';

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
}
