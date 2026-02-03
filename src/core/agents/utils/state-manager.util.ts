import { Injectable } from '@nestjs/common';
import { IAgentState } from '../interfaces/agent-state.interface';
import { AgentStatus } from '../types/agent.types';
import { IntermediateStep, AgentError } from '../types/agent.types';

/**
 * State Manager Utility
 * Handles agent state creation, updates, and serialization
 * Used for debugging, replay, and audit trails
 */
@Injectable()
export class StateManagerUtil {
  /**
   * Create initial agent state
   */
  createInitialState(): IAgentState {
    return {
      input: {},
      intermediateSteps: [],
      errors: [],
      status: 'pending',
      retryCount: 0,
    };
  }

  /**
   * Add an intermediate step to state
   * Returns new state object (immutable)
   */
  addIntermediateStep(
    state: IAgentState,
    tool: string,
    input: unknown,
    output: unknown,
  ): IAgentState {
    const step: IntermediateStep = {
      tool,
      input,
      output,
      timestamp: new Date(),
    };

    return {
      ...state,
      intermediateSteps: [...state.intermediateSteps, step],
    };
  }

  /**
   * Add an error to state
   * Returns new state object (immutable)
   */
  addError(state: IAgentState, message: string): IAgentState {
    const error: AgentError = {
      message,
      timestamp: new Date(),
    };

    return {
      ...state,
      errors: [...state.errors, error],
    };
  }

  /**
   * Update state status
   * Returns new state object (immutable)
   */
  updateStatus(state: IAgentState, status: AgentStatus): IAgentState {
    return {
      ...state,
      status,
    };
  }

  /**
   * Serialize state to JSON string
   * Handles circular references and complex objects
   */
  serialize(state: IAgentState): string {
    try {
      return JSON.stringify(state, this.replacer, 2);
    } catch (error) {
      // Fallback for circular references
      const safeState = {
        input: state.input,
        output: state.output,
        intermediateSteps: state.intermediateSteps.length,
        errors: state.errors.length,
        status: state.status,
        startedAt: state.startedAt,
        completedAt: state.completedAt,
      };
      return JSON.stringify(safeState);
    }
  }

  /**
   * Deserialize JSON string to state
   */
  deserialize(data: string): IAgentState {
    return JSON.parse(data);
  }

  /**
   * Clone state (deep copy)
   */
  clone(state: IAgentState): IAgentState {
    return this.deserialize(this.serialize(state));
  }

  /**
   * JSON replacer to handle circular references
   */
  private replacer(key: string, value: unknown): unknown {
    if (typeof value === 'object' && value !== null) {
      if (value instanceof Error) {
        return {
          name: value.name,
          message: value.message,
          stack: value.stack,
        };
      }
      // Handle circular references
      const seen = new WeakSet();
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  }
}
