import { Logger } from '@nestjs/common';
import type { IAgent } from '../interfaces/agent.interface';
import type { IAgentState } from '../interfaces/agent-state.interface';
import {
  AgentInput,
  AgentOutput,
  AgentConfig,
  IntermediateStep,
  AgentError,
} from '../types/agent.types';

/**
 * Base agent abstract class
 * Template method pattern for consistent agent behavior
 * All concrete agents (Phase 4, 5) must extend this class
 *
 * Lifecycle:
 * 1. beforeExecute() - setup, validation
 * 2. performAnalysis() - abstract method implemented by concrete agents
 * 3. afterExecute() - cleanup, result processing
 * 4. handleError() - error handling if performAnalysis throws
 */
export abstract class BaseAgent implements IAgent {
  protected readonly logger: Logger;
  public readonly config: AgentConfig;
  protected state: IAgentState;

  constructor(config: AgentConfig) {
    this.config = config;
    this.logger = new Logger(config.name);
    this.state = {
      input: {},
      intermediateSteps: [],
      errors: [],
      status: 'pending',
      retryCount: 0,
    };
  }

  get Config(): AgentConfig {
    return this.config;
  }

  get State(): IAgentState {
    return this.state;
  }

  /**
   * Execute the agent with given input
   * Implements template method pattern with retry logic and timeout enforcement
   */
  async execute(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.state.input = input;
    this.state.status = 'running';
    this.state.startedAt = new Date();

    const maxRetries = this.config.maxRetries ?? 0;
    const timeout = this.config.timeout ?? 300000; // Default 5 minutes

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(
          `Executing agent: ${this.config.name} for deck: ${input.deckId}` +
            (attempt > 0 ? ` (attempt ${attempt + 1}/${maxRetries + 1})` : ''),
        );

        await this.beforeExecute(input);

        // Execute with timeout wrapper
        const result = await Promise.race([
          this.performAnalysis(input),
          this.createTimeoutPromise(timeout),
        ]);

        this.state.output = result.data;
        this.state.status = 'completed';
        this.state.completedAt = new Date();

        await this.afterExecute(result);

        return {
          ...result,
          metadata: {
            ...result.metadata,
            executionTime: Date.now() - startTime,
            attempt: attempt + 1,
          },
        };
      } catch (error) {
        this.state.retryCount = attempt;
        const isLastAttempt = attempt >= maxRetries;

        this.state.errors.push({
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
        });

        if (isLastAttempt) {
          this.state.status = 'failed';
          this.state.completedAt = new Date();

          this.logger.error(
            `Agent failed after ${attempt + 1} attempts: ${this.config.name} - ${this.state.errors[0].message}`,
            error,
          );
          return this.handleError(error as Error);
        }

        this.logger.warn(
          `Agent attempt ${attempt + 1} failed, retrying: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );

        // Exponential backoff before retry
        const backoffDelay = Math.min(1000 * 2 ** attempt, 10000);
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }

    // Should never reach here, but TypeScript needs it
    return this.handleError(new Error('Unexpected execution flow'));
  }

  /**
   * Create a promise that rejects after timeout
   */
  private createTimeoutPromise(timeoutMs: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Agent execution timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  /**
   * Abstract method - must be implemented by concrete agents
   * Contains the actual analysis logic for each agent type
   */
  protected abstract performAnalysis(input: AgentInput): Promise<AgentOutput>;

  /**
   * Hook called before agent execution
   * Override for custom setup logic
   */
  async beforeExecute(input: AgentInput): Promise<void> {
    this.logger.debug(`Before execute: deckId=${input.deckId}`);
  }

  /**
   * Hook called after agent execution
   * Override for custom cleanup logic
   */
  async afterExecute(output: AgentOutput): Promise<void> {
    this.logger.debug(
      `After execute: success=${output.success}, dataKeys=${
        output.data ? Object.keys(output.data).length : 0
      }`,
    );
  }

  /**
   * Handle errors during agent execution
   * Override for custom error handling
   */
  handleError(error: Error): AgentOutput {
    return {
      success: false,
      error: error.message,
    };
  }

  /**
   * Add an intermediate step to state tracking
   * Used by concrete agents to log tool usage
   */
  protected addIntermediateStep(
    tool: string,
    stepInput: unknown,
    stepOutput: unknown,
  ): void {
    const step: IntermediateStep = {
      tool,
      input: stepInput,
      output: stepOutput,
      timestamp: new Date(),
    };
    this.state.intermediateSteps.push(step);
  }
}
