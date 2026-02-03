/**
 * Scoring agent output DTO
 * Phase 4: Scoring Agents
 */
import { ScoringResult } from '../interfaces/scoring-result.interface';

/** Output from scoring agents */
export interface ScoringOutput {
  results: ScoringResult[];
  overallScore: number;
  metadata: {
    executionTime: number;
    agentsExecuted: string[];
  };
}
