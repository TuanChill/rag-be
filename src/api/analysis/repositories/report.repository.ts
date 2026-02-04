import { EntityRepository } from '@mikro-orm/core';
import { AnalysisReport } from '../entities/analysis-report.entity';

export class ReportRepository extends EntityRepository<AnalysisReport> {
  async findByAnalysisId(analysisUuid: string): Promise<AnalysisReport[]> {
    return this.find(
      { analysis: { uuid: analysisUuid } },
      { orderBy: { createdAt: 'DESC' } },
    );
  }

  async findLatestByAnalysis(
    analysisUuid: string,
  ): Promise<AnalysisReport | null> {
    return this.findOne(
      { analysis: { uuid: analysisUuid } },
      { orderBy: { createdAt: 'DESC' } },
    );
  }
}
