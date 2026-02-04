import { IsEnum, IsOptional } from 'class-validator';
import { ReportType, ReportFormat } from '../types/report.types';

export class CreateReportDto {
  @IsEnum(['executive', 'detailed', 'investor'])
  reportType: ReportType = 'executive';

  @IsOptional()
  @IsEnum(['markdown', 'json'])
  format?: ReportFormat = 'markdown';
}
