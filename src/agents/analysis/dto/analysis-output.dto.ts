/**
 * Analysis agent output DTO
 * Phase 5: Analysis Agents
 */
import { Finding } from '../interfaces/finding.interface';

/** Output from analysis agents */
export interface AnalysisOutput {
  findings: Finding[];
  summary: string;
  metadata: {
    executionTime: number;
    agent: string;
    findingCount: number;
  };
}
