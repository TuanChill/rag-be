import {
  Entity,
  Property,
  PrimaryKey,
  ManyToOne,
  Rel,
  Index,
} from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { BaseEntity } from '@core/base/base.entity';
import { AnalysisResult } from './analysis-result.entity';
import { ScoreCategory } from '../types/analysis.types';

/**
 * Component score entity
 * Stores individual scores for weighted scoring algorithm
 *
 * Scoring weights:
 * - sector: 30%
 * - stage: 25%
 * - thesis: 25%
 * - history: 20%
 */
@Entity({ collection: 'analysis_scores' })
export class AnalysisScore extends BaseEntity {
  @PrimaryKey()
  _id!: ObjectId;

  /** Score category (sector, stage, thesis, history, overall) */
  @Index()
  @Property()
  category!: ScoreCategory;

  /** Score value (0-100) */
  @Property()
  score!: number;

  /** Weight in overall calculation (0-1) */
  @Property()
  weight!: number;

  /** Detailed explanation of score */
  @Property({ nullable: true })
  details?: string;

  /** Which agent produced this score */
  @Property({ nullable: true })
  sourceAgent?: string;

  @ManyToOne(() => AnalysisResult)
  analysis!: Rel<AnalysisResult>;

  constructor(partial?: Partial<AnalysisScore>) {
    super();
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
