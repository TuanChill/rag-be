import { ReportType, ReportFormat, ReportStatus } from '../types/report.types';
import { AnalysisReport } from '../entities/analysis-report.entity';

export class ReportResponseDto {
  uuid: string;
  reportType: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  content?: string;
  generatedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: AnalysisReport): ReportResponseDto {
    return {
      uuid: entity.uuid,
      reportType: entity.reportType,
      format: entity.format,
      status: entity.status,
      content: entity.content,
      generatedAt: entity.generatedAt,
      errorMessage: entity.errorMessage,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
