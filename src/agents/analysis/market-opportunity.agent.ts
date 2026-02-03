/**
 * Market Opportunity Agent
 * Phase 9: UI Output Format Modifications
 *
 * Analyzes market opportunity, TAM/SAM/SOM, and market positioning
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
import {
  CategoryAnalysisOutput,
  CategoryFinding,
  AnalysisCategory,
} from './interfaces/category-analysis.interface';
import {
  MARKET_OPPORTUNITY_SYSTEM_PROMPT,
  MARKET_OPPORTUNITY_PROMPT,
} from './prompts/market-opportunity.prompt';

@Injectable()
export class MarketOpportunityAgent extends BaseAgent {
  constructor(
    private readonly ragTool: RagQueryTool,
    private readonly openaiTool: OpenAICallTool,
    configService: ConfigService,
  ) {
    const config: AgentConfig = {
      name: 'MarketOpportunityAgent',
      description: 'Analyzes market opportunity and TAM/SAM/SOM',
      timeout: configService.get<number>('analysis.timeoutMs', 120000),
      maxRetries: 3,
      temperature: configService.get<number>('analysis.temperature', 0.7),
    };
    super(config);
  }

  protected async performAnalysis(input: AgentInput): Promise<AgentOutput> {
    const ragTool = this.ragTool.createTool(input.deckId);
    const ragResultStr = await ragTool.func(
      'What is the market opportunity? What are the TAM, SAM, and SOM? How is the market size justified?',
    );

    const ragResult = JSON.parse(ragResultStr);
    if (!ragResult.success) {
      throw new Error(`RAG query failed: ${ragResult.error}`);
    }

    const deckContent = ragResult.results
      ? ragResult.results
          .map((r: { content: string }) => r.content)
          .join('\n\n')
      : input.deckContent || '';

    const userPrompt = MARKET_OPPORTUNITY_PROMPT(deckContent);

    const llmResponse = await this.openaiTool.call([
      new SystemMessage(MARKET_OPPORTUNITY_SYSTEM_PROMPT),
      new HumanMessage(userPrompt),
    ]);

    const output = this.parseOutput(llmResponse);

    this.addIntermediateStep(
      'rag_query',
      { query: 'market opportunity' },
      ragResult,
    );
    this.addIntermediateStep('llm_analysis', { prompt: userPrompt }, output);

    return {
      success: true,
      data: output as unknown as Record<string, unknown>,
    };
  }

  protected parseOutput(raw: string): CategoryAnalysisOutput {
    let analysis: {
      score: number;
      summary: string;
      findings: Array<{
        title: string;
        description: string;
        impact: string;
        severity: string;
        recommendations?: string[];
        evidence?: { quote?: string; slideNumber?: number };
      }>;
    };

    try {
      const jsonMatch =
        raw.match(/```json\n?([\s\S]*?)\n?```/) ||
        raw.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : raw;
      analysis = JSON.parse(jsonStr);
    } catch (error) {
      this.logger.error(`Failed to parse LLM response: ${raw}`, error);
      throw new Error('Failed to parse market opportunity response');
    }

    const score = Math.max(0, Math.min(100, analysis.score || 70));

    const findings: CategoryFinding[] = (analysis.findings || []).map((f) => ({
      title: f.title,
      description: f.description,
      impact:
        f.impact === 'positive' ||
        f.impact === 'negative' ||
        f.impact === 'neutral'
          ? f.impact
          : 'neutral',
      severity:
        f.severity === 'critical' ||
        f.severity === 'major' ||
        f.severity === 'minor'
          ? f.severity
          : 'minor',
      recommendations: f.recommendations,
      evidence: f.evidence,
    }));

    return {
      category: 'market_opportunity' as AnalysisCategory,
      score,
      summary: analysis.summary || '',
      findings,
      metadata: {
        executionTime: 0,
        agent: 'market_opportunity',
        findingCount: findings.length,
      },
    };
  }
}
