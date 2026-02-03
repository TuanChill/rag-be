/**
 * Financial Projections Agent
 * Phase 9: UI Output Format Modifications
 *
 * Analyzes financial projections, runway, and funding requirements
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
  FINANCIAL_PROJECTIONS_SYSTEM_PROMPT,
  FINANCIAL_PROJECTIONS_PROMPT,
} from './prompts/financial-projections.prompt';

@Injectable()
export class FinancialProjectionsAgent extends BaseAgent {
  constructor(
    private readonly ragTool: RagQueryTool,
    private readonly openaiTool: OpenAICallTool,
    configService: ConfigService,
  ) {
    const config: AgentConfig = {
      name: 'FinancialProjectionsAgent',
      description: 'Analyzes financial projections and runway',
      timeout: configService.get<number>('analysis.timeoutMs', 120000),
      maxRetries: 3,
      temperature: configService.get<number>('analysis.temperature', 0.7),
    };
    super(config);
  }

  protected async performAnalysis(input: AgentInput): Promise<AgentOutput> {
    const ragTool = this.ragTool.createTool(input.deckId);
    const ragResultStr = await ragTool.func(
      'What are the revenue projections? What is the burn rate and runway? How much are they raising and for what?',
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

    const userPrompt = FINANCIAL_PROJECTIONS_PROMPT(deckContent);

    const llmResponse = await this.openaiTool.call([
      new SystemMessage(FINANCIAL_PROJECTIONS_SYSTEM_PROMPT),
      new HumanMessage(userPrompt),
    ]);

    const output = this.parseOutput(llmResponse);

    this.addIntermediateStep(
      'rag_query',
      { query: 'financial projections' },
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
      throw new Error('Failed to parse financial projections response');
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
      category: 'financial_projections' as AnalysisCategory,
      score,
      summary: analysis.summary || '',
      findings,
      metadata: {
        executionTime: 0,
        agent: 'financial_projections',
        findingCount: findings.length,
      },
    };
  }
}
