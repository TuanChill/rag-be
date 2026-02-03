/**
 * Sector Match Agent
 * Phase 4: Scoring Agents
 *
 * Evaluates industry/domain alignment with investment criteria
 * Weight: 30%
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
  SECTOR_MATCH_SYSTEM_PROMPT,
  SECTOR_MATCH_PROMPT,
} from './prompts/sector-match.prompt';

@Injectable()
export class SectorMatchAgent extends BaseAgent {
  constructor(
    private readonly ragTool: RagQueryTool,
    private readonly openaiTool: OpenAICallTool,
    configService: ConfigService,
  ) {
    const config: AgentConfig = {
      name: 'SectorMatchAgent',
      description: 'Evaluates sector alignment with investment criteria',
      timeout: configService.get<number>('analysis.timeoutMs', 90000),
      maxRetries: 3,
      temperature: configService.get<number>('analysis.temperature', 0.7),
    };
    super(config);
  }

  protected async performAnalysis(input: AgentInput): Promise<AgentOutput> {
    const scoringInput = input as ScoringInput;
    const criteria = scoringInput.investmentCriteria?.targetSectors || [];

    this.logger.debug(
      `SectorMatchAgent: deckId=${input.deckId}, targetSectors=${criteria.join(
        ', ',
      )}`,
    );

    // Query RAG for sector-relevant content
    const ragTool = this.ragTool.createTool(input.deckId);
    const ragResultStr = await ragTool.func(
      'What industry or sector does this company operate in? What markets do they target?',
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

    // Call OpenAI with sector match prompt
    const userPrompt = SECTOR_MATCH_PROMPT(criteria.join(', '), deckContent);

    const llmResponse = await this.openaiTool.call([
      new SystemMessage(SECTOR_MATCH_SYSTEM_PROMPT),
      new HumanMessage(userPrompt),
    ]);

    // Parse LLM response
    let analysis: {
      detectedSectors: string[];
      alignmentScore: number;
      justification: string;
      matchReasons: string[];
      concerns: string[];
    };

    try {
      // Extract JSON from response (handle potential markdown code blocks)
      const jsonMatch =
        llmResponse.match(/```json\n?([\s\S]*?)\n?```/) ||
        llmResponse.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : llmResponse;
      analysis = JSON.parse(jsonStr);
    } catch (error) {
      this.logger.error(`Failed to parse LLM response: ${llmResponse}`, error);
      throw new Error('Failed to parse sector analysis response');
    }

    const result: ScoringResult = {
      category: 'sector',
      score: Math.min(100, Math.max(0, analysis.alignmentScore)),
      weight: 0.3, // 30%
      justification: analysis.justification,
      details: {
        matchReasons: analysis.matchReasons || [],
        concerns: analysis.concerns || [],
      },
    };

    this.addIntermediateStep(
      'rag_query',
      { query: 'sector analysis' },
      ragResult,
    );
    this.addIntermediateStep('llm_analysis', { prompt: userPrompt }, analysis);

    return {
      success: true,
      data: result as unknown as Record<string, unknown>,
    };
  }
}
