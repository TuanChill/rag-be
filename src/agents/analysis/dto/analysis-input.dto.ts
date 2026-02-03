/**
 * Analysis agent input DTO
 * Phase 5: Analysis Agents
 */
import type { AgentInput } from '@core/agents/types/agent.types';

/** Extended input for analysis agents */
export interface AnalysisInput extends Omit<AgentInput, 'analysisType'> {
  agentAnalysisType?: 'strengths' | 'weaknesses' | 'competitive';
  maxFindings?: number;
  severityThreshold?: 'critical' | 'major' | 'minor' | 'info';
}
