import { AgentInput, AgentOutput, AgentConfig } from '../types/agent.types';

/**
 * Agent interface - contract for all AI agents
 * Defines the lifecycle methods that concrete agents must implement
 */
export interface IAgent {
  /** Read-only agent configuration */
  readonly config: AgentConfig;

  /**
   * Execute the agent with given input
   * Main entry point for agent execution
   */
  execute(input: AgentInput): Promise<AgentOutput>;

  /**
   * Hook called before agent execution
   * Use for setup, validation, logging
   */
  beforeExecute(input: AgentInput): Promise<void>;

  /**
   * Hook called after agent execution
   * Use for cleanup, result processing, logging
   */
  afterExecute(output: AgentOutput): Promise<void>;

  /**
   * Handle errors during agent execution
   * Called when execute() throws an error
   */
  handleError(error: Error): AgentOutput;
}
