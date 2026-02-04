import {
  Entity,
  Property,
  PrimaryKey,
  ManyToOne,
  Rel,
  OneToMany,
  Collection,
  Index,
  EntityRepositoryType,
} from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { BaseEntity } from '@core/base/base.entity';
import { User } from '@api/user/entities/user.entity';
import { PitchDeck } from '@api/pitchdeck/entities/pitch-deck.entity';
import { AnalysisScore } from './analysis-score.entity';
import { AnalysisFinding } from './analysis-finding.entity';
import { AgentState } from './agent-state.entity';
import { AnalysisStatus } from '../types/analysis.types';
import { AnalysisRepository } from '../repositories/analysis.repository';

/**
 * Main analysis result entity
 * Stores overall analysis score, status, and links to component data
 *
 * Relationships:
 * - belongs to one PitchDeck
 * - belongs to one User (owner)
 * - has many AnalysisScore
 * - has many AnalysisFinding
 * - has many AgentState
 */
@Entity({
  collection: 'analysis_results',
  repository: () => AnalysisRepository,
})
export class AnalysisResult extends BaseEntity {
  [EntityRepositoryType]?: AnalysisRepository;

  @PrimaryKey()
  _id!: ObjectId;

  @Index()
  @Property()
  uuid!: string;

  /** Overall score (0-100) - calculated from weighted component scores */
  @Property({ nullable: true })
  overallScore?: number;

  /** Current workflow status */
  @Index()
  @Property()
  status!: AnalysisStatus;

  /** When analysis started */
  @Property({ nullable: true })
  startedAt?: Date;

  /** When analysis completed (if applicable) */
  @Property({ nullable: true })
  completedAt?: Date;

  /** Error message if status is 'failed' */
  @Property({ nullable: true })
  errorMessage?: string;

  /** Analysis type - full or targeted */
  @Property()
  analysisType!: 'full' | 'sector' | 'stage' | 'thesis';

  /** Pitch deck UUID (public identifier) - stored for direct access without populating relation */
  @Index()
  @Property()
  deckUuid!: string;

  /** Job ID from queue for tracking */
  @Index()
  @Property({ nullable: true })
  jobId?: string;

  @ManyToOne(() => PitchDeck)
  deck!: Rel<PitchDeck>;

  @ManyToOne(() => User)
  owner!: Rel<User>;

  @OneToMany(() => AnalysisScore, (score) => score.analysis)
  scores = new Collection<AnalysisScore>(this);

  @OneToMany(() => AnalysisFinding, (finding) => finding.analysis)
  findings = new Collection<AnalysisFinding>(this);

  @OneToMany(() => AgentState, (state) => state.analysis)
  agentStates = new Collection<AgentState>(this);

  constructor(partial?: Partial<AnalysisResult>) {
    super();
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
