/**
 * Weaknesses Agent
 * Phase 5: Analysis Agents
 *
 * Identifies risks and concerns in pitch decks
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
import { Finding } from './interfaces/finding.interface';
import { AnalysisInput } from './dto/analysis-input.dto';
import {
  WEAKNESSES_SYSTEM_PROMPT,
  WEAKNESSES_PROMPT,
} from './prompts/weaknesses.prompt';

@Injectable()
export class WeaknessesAgent extends BaseAgent {
  constructor(
    private readonly ragTool: RagQueryTool,
    private readonly openaiTool: OpenAICallTool,
    configService: ConfigService,
  ) {
    const config: AgentConfig = {
      name: 'WeaknessesAgent',
      description: 'Identifies pitch deck weaknesses and concerns',
      timeout: configService.get<number>('analysis.timeoutMs', 90000),
      maxRetries: 3,
      temperature: configService.get<number>('analysis.temperature', 0.7),
    };
    super(config);
  }

  protected async performAnalysis(input: AgentInput): Promise<AgentOutput> {
    const analysisInput = input as unknown as AnalysisInput;
    const maxFindings = analysisInput.maxFindings || 5;

    this.logger.debug(
      `WeaknessesAgent: deckId=${input.deckId}, maxFindings=${maxFindings}`,
    );

    // Query RAG for relevant content
    const ragTool = this.ragTool.createTool(input.deckId);
    const ragResultStr = await ragTool.func(
      'What are the weaknesses, risks, or concerns in this pitch? Consider team gaps, weak traction, competitive threats, and market challenges.',
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

    // Call OpenAI with weaknesses prompt
    const userPrompt = WEAKNESSES_PROMPT(deckContent);

    const llmResponse = await this.openaiTool.call([
      new SystemMessage(WEAKNESSES_SYSTEM_PROMPT),
      new HumanMessage(userPrompt),
    ]);

    // Parse LLM response
    let analysis: {
      weaknesses: Array<{
        title: string;
        description: string;
        severity: string;
        recommendations: string[];
        evidence?: { quote?: string; slideNumber?: number };
      }>;
      summary: string;
    };

    try {
      const jsonMatch =
        llmResponse.match(/```json\n?([\s\S]*?)\n?```/) ||
        llmResponse.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : llmResponse;
      analysis = JSON.parse(jsonStr);
    } catch (error) {
      this.logger.error(`Failed to parse LLM response: ${llmResponse}`, error);
      throw new Error('Failed to parse weaknesses analysis response');
    }

    const findings: Finding[] = analysis.weaknesses
      .slice(0, maxFindings)
      .map((f) => ({
        type: 'weakness' as const,
        title: f.title,
        description: f.description,
        severity:
          f.severity === 'critical' ||
          f.severity === 'major' ||
          f.severity === 'minor' ||
          f.severity === 'info'
            ? f.severity
            : 'minor',
        recommendations: f.recommendations,
        source: 'WeaknessesAgent',
        evidence: f.evidence,
      }));

    this.addIntermediateStep(
      'rag_query',
      { query: 'weaknesses analysis' },
      ragResult,
    );
    this.addIntermediateStep('llm_analysis', { prompt: userPrompt }, analysis);

    return {
      success: true,
      data: {
        findings,
        summary: analysis.summary,
      } as unknown as Record<string, unknown>,
    };
  }
}
