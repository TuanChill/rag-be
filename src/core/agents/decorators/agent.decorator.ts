import { AgentConfig } from '../types/agent.types';

/**
 * Agent Decorator
 * Class decorator for agent configuration
 * Applies config to agent classes for metadata
 *
 * Usage:
 * @Agent({
 *   name: 'SectorMatchAgent',
 *   description: 'Analyzes sector match',
 *   timeout: 60000,
 *   maxRetries: 3,
 * })
 * export class SectorMatchAgent extends BaseAgent { ... }
 */
export function Agent(config: AgentConfig): ClassDecorator {
  return (target: unknown) => {
    Object.assign(target, { config });
  };
}
