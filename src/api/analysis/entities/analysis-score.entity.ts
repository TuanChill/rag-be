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
import { AnalysisCategory } from '@agents/analysis/interfaces/category-analysis.interface';

/**
 * Component score entity
 * Stores individual scores for weighted scoring algorithm
 *
 * Scoring weights (legacy):
 * - sector: 30%
 * - stage: 25%
 * - thesis: 25%
 * - history: 20%
 *
 * Phase 9: Category-based scoring (equal 20% weights):
 * - market_opportunity: 20%
 * - business_model: 20%
 * - team_execution: 20%
 * - financial_projections: 20%
 * - competitive_landscape: 20%
 */
@Entity({ collection: 'analysis_scores' })
export class AnalysisScore extends BaseEntity {
  @PrimaryKey()
  _id!: ObjectId;

  /** Score category (sector, stage, thesis, history, overall) - Legacy */
  @Index()
  @Property()
  category!: ScoreCategory;

  /** Phase 9: Analysis category for UI-based scoring */
  @Index()
  @Property({ nullable: true })
  analysisCategory?: AnalysisCategory;

  /** Score value (0-100) */
  @Property()
  score!: number;

  /** Weight in overall calculation (0-1) */
  @Property()
  weight!: number;

  /** Detailed explanation of score */
  @Property({ nullable: true })
  details?: string;

  /** Summary of the analysis (Phase 9) */
  @Property({ nullable: true, type: 'text' })
  summary?: string;

  /** Which agent produced this score */
  @Property({ nullable: true })
  sourceAgent?: string;

  /** Findings data (Phase 9: JSON string of CategoryFinding[]) */
  @Property({ nullable: true, type: 'json' })
  findingsData?: unknown;

  @ManyToOne(() => AnalysisResult)
  analysis!: Rel<AnalysisResult>;

  constructor(partial?: Partial<AnalysisScore>) {
    super();
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
