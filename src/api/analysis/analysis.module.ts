import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AnalysisResult } from './entities/analysis-result.entity';
import { AnalysisScore } from './entities/analysis-score.entity';
import { AnalysisFinding } from './entities/analysis-finding.entity';
import { AgentState } from './entities/agent-state.entity';

/**
 * Analysis module skeleton
 * Phase 2: Entity definitions only
 *
 * Later phases will add:
 * - Phase 6: AnalysisService
 * - Phase 7: AnalysisController
 */
@Module({
  imports: [
    MikroOrmModule.forFeature([
      AnalysisResult,
      AnalysisScore,
      AnalysisFinding,
      AgentState,
    ]),
  ],
  providers: [],
  controllers: [],
  exports: [],
})
export class AnalysisModule {}
