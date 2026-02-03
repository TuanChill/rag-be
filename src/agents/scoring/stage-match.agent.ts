/**
 * Stage Match Agent
 * Phase 4: Scoring Agents
 *
 * Evaluates funding stage fit (pre-seed to series C)
 * Weight: 25%
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from '@core/agents/base/agent.abstract';
import type {
  AgentInput,
  AgentOutput,
  AgentConfig,
} from '@core/agents/types/agent.types';
import { RagQueryTool } from '@core/agents/tools/rag-query.tool';
import { OpenAICallTool } from '@core/agents/tools/openai-call.tool';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ScoringResult } from './interfaces/scoring-result.interface';
import { ScoringInput } from './dto/scoring-input.dto';
import {
  STAGE_MATCH_SYSTEM_PROMPT,
  STAGE_MATCH_PROMPT,
} from './prompts/stage-match.prompt';

@Injectable()
export class StageMatchAgent extends BaseAgent {
  constructor(
    private readonly ragTool: RagQueryTool,
    private readonly openaiTool: OpenAICallTool,
    configService: ConfigService,
  ) {
    const config: AgentConfig = {
      name: 'StageMatchAgent',
      description: 'Evaluates funding stage fit',
      timeout: configService.get<number>('analysis.timeoutMs', 90000),
      maxRetries: 3,
      temperature: configService.get<number>('analysis.temperature', 0.7),
    };
    super(config);
  }

  protected async performAnalysis(input: AgentInput): Promise<AgentOutput> {
    const scoringInput = input as ScoringInput;
    const criteria = scoringInput.investmentCriteria?.targetStages || [
      'Seed',
      'Series A',
    ];

    this.logger.debug(
      `StageMatchAgent: deckId=${input.deckId}, targetStages=${criteria.join(
        ', ',
      )}`,
    );

    // Query RAG for stage-relevant content
    const ragTool = this.ragTool.createTool(input.deckId);
    const ragResultStr = await ragTool.func(
      'What is the current stage of this startup? What traction, revenue, or team size do they have?',
    );

    const ragResult = JSON.parse(ragResultStr);
    if (!ragResult.success) {
      throw new Error(`RAG query failed: ${ragResult.error}`);
    }

    // Format results for prompt
    const deckContent = ragResult.results
      ? ragResult.results
          .map((r: { content: string }) => r.content)
          .join('\n\n')
      : input.deckContent || '';

    // Call OpenAI with stage match prompt
    const userPrompt = STAGE_MATCH_PROMPT(criteria.join(', '), deckContent);

    const llmResponse = await this.openaiTool.call([
      new SystemMessage(STAGE_MATCH_SYSTEM_PROMPT),
      new HumanMessage(userPrompt),
    ]);

    // Parse LLM response
    let analysis: {
      detectedStage: string;
      alignmentScore: number;
      justification: string;
      metrics: {
        traction?: string;
        revenue?: string;
        teamSize?: number;
      };
    };

    try {
      const jsonMatch =
        llmResponse.match(/```json\n?([\s\S]*?)\n?```/) ||
        llmResponse.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : llmResponse;
      analysis = JSON.parse(jsonStr);
    } catch (error) {
      this.logger.error(`Failed to parse LLM response: ${llmResponse}`, error);
      throw new Error('Failed to parse stage analysis response');
    }

    const result: ScoringResult = {
      category: 'stage',
      score: Math.min(100, Math.max(0, analysis.alignmentScore)),
      weight: 0.25, // 25%
      justification: analysis.justification,
      details: {
        matchReasons: [`Detected stage: ${analysis.detectedStage}`],
        concerns: [],
        benchmark: `Target stages: ${criteria.join(', ')}`,
      },
    };

    this.addIntermediateStep(
      'rag_query',
      { query: 'stage analysis' },
      ragResult,
    );
    this.addIntermediateStep('llm_analysis', { prompt: userPrompt }, analysis);

    return {
      success: true,
      data: result as unknown as Record<string, unknown>,
    };
  }
}
