/**
 * Analysis Agents Module
 * Phase 5: Analysis Agents
 * Phase 9: UI Output Format - Added category-based agents
 *
 * Exports all analysis agents for use by orchestration layer
 * Keeps legacy agents for backward compatibility
 */
import { Module } from '@nestjs/common';
import { AgentsModule } from '@core/agents/agents.module';
import { StrengthsAgent } from './strengths.agent';
import { WeaknessesAgent } from './weaknesses.agent';
import { CompetitiveAgent } from './competitive.agent';
import { FindingDeduplicatorUtil } from './utils/finding-deduplicator.util';
// Phase 9: Category-based agents
import { OverallAssessmentAgent } from './overall-assessment.agent';
import { MarketOpportunityAgent } from './market-opportunity.agent';
import { BusinessModelAgent } from './business-model.agent';
import { TeamExecutionAgent } from './team-execution.agent';
import { FinancialProjectionsAgent } from './financial-projections.agent';
import { CompetitiveLandscapeAgent } from './competitive-landscape.agent';

@Module({
  imports: [AgentsModule],
  providers: [
    // Legacy agents (backward compatibility)
    StrengthsAgent,
    WeaknessesAgent,
    CompetitiveAgent,
    FindingDeduplicatorUtil,
    // Phase 9: Category-based agents
    OverallAssessmentAgent,
    MarketOpportunityAgent,
    BusinessModelAgent,
    TeamExecutionAgent,
    FinancialProjectionsAgent,
    CompetitiveLandscapeAgent,
  ],
  exports: [
    // Legacy agents
    StrengthsAgent,
    WeaknessesAgent,
    CompetitiveAgent,
    FindingDeduplicatorUtil,
    // Phase 9: Category-based agents
    OverallAssessmentAgent,
    MarketOpportunityAgent,
    BusinessModelAgent,
    TeamExecutionAgent,
    FinancialProjectionsAgent,
    CompetitiveLandscapeAgent,
  ],
})
export class AnalysisModule {}
