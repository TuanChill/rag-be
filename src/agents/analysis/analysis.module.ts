/**
 * Analysis Agents Module
 * Phase 5: Analysis Agents
 *
 * Exports all analysis agents for use by orchestration layer
 */
import { Module } from '@nestjs/common';
import { AgentsModule } from '@core/agents/agents.module';
import { StrengthsAgent } from './strengths.agent';
import { WeaknessesAgent } from './weaknesses.agent';
import { CompetitiveAgent } from './competitive.agent';
import { FindingDeduplicatorUtil } from './utils/finding-deduplicator.util';

@Module({
  imports: [AgentsModule],
  providers: [
    StrengthsAgent,
    WeaknessesAgent,
    CompetitiveAgent,
    FindingDeduplicatorUtil,
  ],
  exports: [
    StrengthsAgent,
    WeaknessesAgent,
    CompetitiveAgent,
    FindingDeduplicatorUtil,
  ],
})
export class AnalysisModule {}
