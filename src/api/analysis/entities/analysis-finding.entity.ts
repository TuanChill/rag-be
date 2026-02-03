import { Entity, Property, PrimaryKey, ManyToOne, Rel } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { BaseEntity } from '@core/base/base.entity';
import { AnalysisResult } from './analysis-result.entity';
import { FindingType, FindingSeverity } from '../types/analysis.types';

/**
 * Analysis finding entity
 * Stores strengths, weaknesses, opportunities, and threats
 * Produced by analysis agents in Phase 5
 */
@Entity({ collection: 'analysis_findings' })
export class AnalysisFinding extends BaseEntity {
  @PrimaryKey()
  _id!: ObjectId;

  /** Type of finding (strength, weakness, opportunity, threat) */
  @Property()
  type!: FindingType;

  /** Short title for the finding */
  @Property()
  title!: string;

  /** Detailed description */
  @Property()
  description!: string;

  /** Severity level (for weaknesses/threats) */
  @Property({ nullable: true })
  severity?: FindingSeverity;

  /** Which agent produced this finding */
  @Property({ nullable: true })
  source?: string;

  /** Related slide/page reference (optional) */
  @Property({ nullable: true })
  reference?: string;

  @ManyToOne(() => AnalysisResult)
  analysis!: Rel<AnalysisResult>;

  constructor(partial?: Partial<AnalysisFinding>) {
    super();
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
