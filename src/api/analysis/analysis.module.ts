/**
 * Analysis Module
 * Phase 6: Orchestration Service - Implementation
 *
 * Orchestrates all agents for pitch deck analysis
 */
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ScoringModule } from '@agents/scoring/scoring.module';
import { AnalysisModule as AgentsAnalysisModule } from '@agents/analysis/analysis.module';
import { EventsModule } from '@core/events/events.module';
import { QueueModule } from '@core/queue/queue.module';
import { AnalysisResult } from './entities/analysis-result.entity';
import { AnalysisScore } from './entities/analysis-score.entity';
import { AnalysisFinding } from './entities/analysis-finding.entity';
import { AgentState } from './entities/agent-state.entity';
import { AnalysisService } from './services/analysis.service';
import { OrchestratorService } from './services/orchestrator.service';
import { CalculatorService } from './services/calculator.service';
import { AnalysisRepository } from './repositories/analysis.repository';
import { AnalysisJobProcessor } from './queue/analysis-job.processor';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      AnalysisResult,
      AnalysisScore,
      AnalysisFinding,
      AgentState,
    ]),
    EventsModule,
    QueueModule,
    ScoringModule,
    AgentsAnalysisModule,
  ],
  providers: [
    AnalysisService,
    OrchestratorService,
    CalculatorService,
    AnalysisRepository,
    AnalysisJobProcessor,
  ],
  exports: [AnalysisService, AnalysisJobProcessor],
})
export class AnalysisModule {}
