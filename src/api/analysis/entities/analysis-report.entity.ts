import {
  Entity,
  Property,
  PrimaryKey,
  ManyToOne,
  Rel,
  Index,
  EntityRepositoryType,
} from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { BaseEntity } from '@core/base/base.entity';
import { User } from '@api/user/entities/user.entity';
import { AnalysisResult } from './analysis-result.entity';
import { ReportStatus, ReportFormat, ReportType } from '../types/report.types';
import { ReportRepository } from '../repositories/report.repository';

/**
 * Analysis Report Entity
 * Stores generated reports for analysis results
 *
 * Relationships:
 * - belongs to one AnalysisResult
 * - belongs to one User (owner)
 */
@Entity({ collection: 'analysis_reports', repository: () => ReportRepository })
export class AnalysisReport extends BaseEntity {
  [EntityRepositoryType]?: ReportRepository;

  @PrimaryKey()
  _id!: ObjectId;

  @Index()
  @Property()
  uuid!: string;

  /** Report type variant */
  @Property()
  reportType!: ReportType;

  /** Report format */
  @Property()
  format!: ReportFormat;

  /** Generated report content */
  @Property({ type: 'text', nullable: true })
  content?: string;

  /** Report generation status */
  @Index()
  @Property()
  status!: ReportStatus;

  /** When report was generated */
  @Property({ nullable: true })
  generatedAt?: Date;

  /** Error message if status is 'failed' */
  @Property({ nullable: true })
  errorMessage?: string;

  @ManyToOne(() => AnalysisResult)
  analysis!: Rel<AnalysisResult>;

  @ManyToOne(() => User)
  owner!: Rel<User>;

  constructor(partial?: Partial<AnalysisReport>) {
    super();
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
