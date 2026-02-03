/**
 * Thesis Overlap Agent
 * Phase 4: Scoring Agents
 *
 * Calculates semantic similarity to investment thesis
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
import { JaccardCalculatorUtil } from './utils/jaccard-calculator.util';
import { ScoringResult } from './interfaces/scoring-result.interface';
import { ScoringInput } from './dto/scoring-input.dto';
import {
  THESIS_OVERLAP_SYSTEM_PROMPT,
  THESIS_OVERLAP_PROMPT,
} from './prompts/thesis-overlap.prompt';

@Injectable()
export class ThesisOverlapAgent extends BaseAgent {
  constructor(
    private readonly ragTool: RagQueryTool,
    private readonly openaiTool: OpenAICallTool,
    configService: ConfigService,
  ) {
    const config: AgentConfig = {
      name: 'ThesisOverlapAgent',
      description: 'Calculates thesis semantic similarity',
      timeout: configService.get<number>('analysis.timeoutMs', 90000),
      maxRetries: 3,
      temperature: configService.get<number>('analysis.temperature', 0.7),
    };
    super(config);
  }

  protected async performAnalysis(input: AgentInput): Promise<AgentOutput> {
    const scoringInput = input as ScoringInput;
    const thesis = scoringInput.investmentCriteria?.thesis || '';

    if (!thesis) {
      // No thesis provided, return neutral score
      const result: ScoringResult = {
        category: 'thesis',
        score: 50,
        weight: 0.25, // 25%
        justification: 'No investment thesis provided, using neutral score.',
      };
      return {
        success: true,
        data: result as unknown as Record<string, unknown>,
      };
    }

    this.logger.debug(
      `ThesisOverlapAgent: deckId=${input.deckId}, thesis length=${thesis.length}`,
    );

    // Query RAG for full deck content
    const ragTool = this.ragTool.createTool(input.deckId);
    const ragResultStr = await ragTool.func(
      'Summarize the entire pitch deck: business model, market, team, traction.',
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

    // Call OpenAI with thesis overlap prompt
    const userPrompt = THESIS_OVERLAP_PROMPT(thesis, deckContent);

    const llmResponse = await this.openaiTool.call([
      new SystemMessage(THESIS_OVERLAP_SYSTEM_PROMPT),
      new HumanMessage(userPrompt),
    ]);

    // Parse LLM response
    let analysis: {
      thesisKeywords: string[];
      deckKeywords: string[];
      semanticSimilarity: number;
      justification: string;
      alignmentPoints: string[];
      gaps: string[];
    };

    try {
      const jsonMatch =
        llmResponse.match(/```json\n?([\s\S]*?)\n?```/) ||
        llmResponse.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : llmResponse;
      analysis = JSON.parse(jsonStr);
    } catch (error) {
      this.logger.error(`Failed to parse LLM response: ${llmResponse}`, error);
      throw new Error('Failed to parse thesis analysis response');
    }

    // Calculate Jaccard similarity as validation
    const jaccardScore = JaccardCalculatorUtil.fromArrays(
      analysis.thesisKeywords,
      analysis.deckKeywords,
    );

    // Average semantic and Jaccard similarity
    const finalScore = (analysis.semanticSimilarity + jaccardScore * 100) / 2;

    const result: ScoringResult = {
      category: 'thesis',
      score: Math.min(100, Math.max(0, finalScore)),
      weight: 0.25, // 25%
      justification: analysis.justification,
      details: {
        matchReasons: analysis.alignmentPoints || [],
        concerns: analysis.gaps || [],
      },
    };

    this.addIntermediateStep(
      'rag_query',
      { query: 'thesis analysis' },
      ragResult,
    );
    this.addIntermediateStep(
      'jaccard_calculation',
      {
        thesisKeywords: analysis.thesisKeywords,
        deckKeywords: analysis.deckKeywords,
      },
      { jaccardSimilarity: jaccardScore },
    );
    this.addIntermediateStep('llm_analysis', { prompt: userPrompt }, analysis);

    return {
      success: true,
      data: result as unknown as Record<string, unknown>,
    };
  }
}
