/**
 * Report Agent Module
 * Phase 02: Analytics Report Generation - Backend
 *
 * Exports ReportGeneratorAgent for creating narrative reports
 * Uses forwardRef to import AnalysisModule for AnalysisService dependency
 */
import { Module, forwardRef } from '@nestjs/common';
import { AgentsModule } from '@core/agents/agents.module';
import { AnalysisModule } from '@api/analysis/analysis.module';
import { ReportGeneratorAgent } from './report-generator.agent';

@Module({
  imports: [AgentsModule, forwardRef(() => AnalysisModule)],
  providers: [ReportGeneratorAgent],
  exports: [ReportGeneratorAgent],
})
export class ReportAgentModule {}
