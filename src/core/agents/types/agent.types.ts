/**
 * Agent type definitions for Pitch Deck AI Analysis Engine
 * Phase 3: Agent Framework
 */

/** Agent execution status */
export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed';

/** Input data for agent execution */
export interface AgentInput {
  deckId: string;
  deckContent?: string;
  context?: Record<string, unknown>;
  analysisType?: 'full' | 'sector' | 'stage' | 'thesis';
}

/** Output data from agent execution */
export interface AgentOutput {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  metadata?: {
    executionTime: number;
    tokensUsed?: number;
    model?: string;
    attempt?: number;
  };
}

/** Agent configuration */
export interface AgentConfig {
  name: string;
  description: string;
  timeout: number;
  maxRetries: number;
  temperature?: number;
}

/** Intermediate step for agent state tracking */
export interface IntermediateStep {
  tool: string;
  input: unknown;
  output: unknown;
  timestamp: Date;
}

/** Error entry for agent state tracking */
export interface AgentError {
  message: string;
  timestamp: Date;
}
