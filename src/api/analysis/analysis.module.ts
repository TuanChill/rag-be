/**
 * Analysis Module
 * Phase 6: Orchestration Service - Implementation
 * Phase 7: API Endpoints - Added controller, guard, interceptor
 *
 * Orchestrates all agents for pitch deck analysis
 * Note: Processors are registered in ProcessorsModule to avoid double registration
 * Note: ReportAgentModule is NOT imported here to avoid circular dependency
 */
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ScoringModule } from '@agents/scoring/scoring.module';
import { AnalysisModule as AgentsAnalysisModule } from '@agents/analysis/analysis.module';
import { EventsModule } from '@core/events/events.module';
import { QueueModule } from '@core/queue/queue.module';
import { PitchDeckModule } from '@api/pitchdeck/pitchdeck.module';
import { AnalysisResult } from './entities/analysis-result.entity';
import { AnalysisScore } from './entities/analysis-score.entity';
import { AnalysisFinding } from './entities/analysis-finding.entity';
import { AgentState } from './entities/agent-state.entity';
import { AnalysisReport } from './entities/analysis-report.entity';
import { PitchDeck } from '@api/pitchdeck/entities/pitch-deck.entity';
import { AnalysisService } from './services/analysis.service';
import { OrchestratorService } from './services/orchestrator.service';
import { CalculatorService } from './services/calculator.service';
import { ReportService } from './services/report.service';
import { AnalysisRepository } from './repositories/analysis.repository';
import { AnalysisController } from './analysis.controller';
import { AnalysisTransformInterceptor } from './interceptors/transform.interceptor';
import { AnalysisRateLimitGuard } from './guards/rate-limit.guard';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      AnalysisResult,
      AnalysisScore,
      AnalysisFinding,
      AgentState,
      AnalysisReport,
      PitchDeck,
    ]),
    EventsModule,
    QueueModule,
    ScoringModule,
    AgentsAnalysisModule,
    PitchDeckModule,
  ],
  controllers: [AnalysisController],
  providers: [
    AnalysisService,
    OrchestratorService,
    CalculatorService,
    ReportService,
    AnalysisRepository,
    AnalysisTransformInterceptor,
    AnalysisRateLimitGuard,
  ],
  exports: [AnalysisService, OrchestratorService, ReportService],
})
export class AnalysisModule {}
