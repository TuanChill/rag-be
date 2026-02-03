/**
 * Scoring Agents Module
 * Phase 4: Scoring Agents
 *
 * Exports all scoring agents for use by orchestration layer
 */
import { Module } from '@nestjs/common';
import { AgentsModule } from '@core/agents/agents.module';
import { SectorMatchAgent } from './sector-match.agent';
import { StageMatchAgent } from './stage-match.agent';
import { ThesisOverlapAgent } from './thesis-overlap.agent';
import { HistoryBehaviorAgent } from './history-behavior.agent';

@Module({
  imports: [AgentsModule],
  providers: [
    SectorMatchAgent,
    StageMatchAgent,
    ThesisOverlapAgent,
    HistoryBehaviorAgent,
  ],
  exports: [
    SectorMatchAgent,
    StageMatchAgent,
    ThesisOverlapAgent,
    HistoryBehaviorAgent,
  ],
})
export class ScoringModule {}
