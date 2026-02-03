import { Entity, Property, PrimaryKey, ManyToOne, Rel, Index } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { BaseEntity } from '@core/base/base.entity';
import { AnalysisResult } from './analysis-result.entity';
import { AgentStatus } from '../types/analysis.types';

/**
 * Agent execution state entity
 * Tracks agent workflow execution for debugging and replay
 *
 * Enables:
 * - Debugging failed agent workflows
 * - Replaying agent executions
 * - Performance analysis
 * - Audit trail
 */
@Entity({ collection: 'agent_states' })
export class AgentState extends BaseEntity {
  @PrimaryKey()
  _id!: ObjectId;

  /** Agent name (e.g., 'SectorMatchAgent', 'StrengthsAgent') */
  @Property()
  agentName!: string;

  /** Current execution status */
  @Property()
  status!: AgentStatus;

  /** Agent input (JSON) */
  @Property({ type: 'json', nullable: true })
  input?: Record<string, unknown>;

  /** Agent output (JSON) */
  @Property({ type: 'json', nullable: true })
  output?: Record<string, unknown>;

  /** Error message if status is 'failed' */
  @Property({ nullable: true })
  errorMessage?: string;

  /** When agent started */
  @Property({ nullable: true })
  startedAt?: Date;

  /** When agent completed */
  @Property({ nullable: true })
  completedAt?: Date;

  /** Execution order for sequence tracking */
  @Index()
  @Property()
  executionOrder!: number;

  /** Number of retries attempted */
  @Property({ default: 0 })
  retryCount!: number;

  @ManyToOne(() => AnalysisResult)
  analysis!: Rel<AnalysisResult>;

  constructor(partial?: Partial<AgentState>) {
    super();
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
