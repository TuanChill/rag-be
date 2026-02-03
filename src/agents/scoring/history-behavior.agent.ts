/**
 * History Behavior Agent
 * Phase 4: Scoring Agents
 *
 * Analyzes historical patterns (placeholder for V2)
 * Weight: 20%
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from '@core/agents/base/agent.abstract';
import type {
  AgentInput,
  AgentOutput,
  AgentConfig,
} from '@core/agents/types/agent.types';
import { ScoringResult } from './interfaces/scoring-result.interface';
import { ScoringInput } from './dto/scoring-input.dto';

@Injectable()
export class HistoryBehaviorAgent extends BaseAgent {
  constructor(configService: ConfigService) {
    const config: AgentConfig = {
      name: 'HistoryBehaviorAgent',
      description: 'Analyzes historical patterns (V2)',
      timeout: configService.get<number>('analysis.timeoutMs', 90000),
      maxRetries: 3,
    };
    super(config);
  }

  protected async performAnalysis(input: AgentInput): Promise<AgentOutput> {
    const scoringInput = input as ScoringInput;

    this.logger.debug(
      `HistoryBehaviorAgent: deckId=${input.deckId} - V2 placeholder`,
    );

    // Placeholder: V2 will implement historical pattern analysis
    // This would analyze:
    // - Founder background/exits
    // - Industry historical performance
    // - Similar company outcomes
    // - Market timing patterns

    const result: ScoringResult = {
      category: 'history',
      score: 50, // Neutral score for now
      weight: 0.2, // 20%
      justification:
        'Historical behavior analysis not yet implemented (V2 feature). Using neutral score.',
      details: {
        matchReasons: [],
        concerns: [
          'Historical pattern analysis requires founder data and market history',
        ],
      },
    };

    return {
      success: true,
      data: result as unknown as Record<string, unknown>,
    };
  }
}
