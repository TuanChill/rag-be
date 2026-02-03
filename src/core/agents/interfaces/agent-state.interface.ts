import { IntermediateStep, AgentError } from '../types/agent.types';
import { AgentStatus, AgentInput } from '../types/agent.types';

/**
 * Agent state interface for tracking agent execution
 * Used for debugging, replay, and audit trails
 */
export interface IAgentState {
  /** Input data passed to agent */
  input: AgentInput | Record<string, unknown>;

  /** Output data from agent (if completed) */
  output?: Record<string, unknown>;

  /** Intermediate steps taken during execution */
  intermediateSteps: IntermediateStep[];

  /** Errors encountered during execution */
  errors: AgentError[];

  /** Current execution status */
  status: AgentStatus;

  /** When execution started */
  startedAt?: Date;

  /** When execution completed (success or failure) */
  completedAt?: Date;

  /** Number of retry attempts */
  retryCount?: number;
}
