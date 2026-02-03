/**
 * Scoring agent input DTO
 * Phase 4: Scoring Agents
 */
import { AgentInput } from '@core/agents/types/agent.types';

/** Extended input for scoring agents */
export interface ScoringInput extends AgentInput {
  investmentCriteria?: {
    targetSectors?: string[];
    targetStages?: string[];
    thesis?: string;
    dealSizeRange?: { min: number; max: number };
  };
}
