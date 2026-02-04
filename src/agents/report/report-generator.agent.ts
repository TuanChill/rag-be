/**
 * Report Generator Agent
 * Phase 02: Analytics Report Generation - Backend
 *
 * Consolidates analysis results into professional narrative reports for VCs
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
import { AnalysisService } from '@api/analysis/services/analysis.service';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ReportOutput } from './interfaces/report-output.interface';
import { REPORT_SYSTEM_PROMPT } from './prompts/report-system.prompt';
import { REPORT_USER_PROMPT } from './prompts/report-user.prompt';
import { AnalysisResult } from '@api/analysis/entities/analysis-result.entity';

interface ReportAgentInput extends AgentInput {
  analysisUuid: string;
  ownerId: string;
  reportType?: 'executive' | 'detailed' | 'investor';
}

@Injectable()
export class ReportGeneratorAgent extends BaseAgent {
  constructor(
    private readonly ragTool: RagQueryTool,
    private readonly openaiTool: OpenAICallTool,
    private readonly analysisService: AnalysisService,
    configService: ConfigService,
  ) {
    const config: AgentConfig = {
      name: 'ReportGeneratorAgent',
      description: 'Generates narrative reports from analysis results',
      timeout: configService.get<number>('analysis.reportTimeoutMs', 180000),
      maxRetries: 2,
      temperature: 0.5, // Lower for consistent formatting
    };
    super(config);
  }

  protected async performAnalysis(input: AgentInput): Promise<AgentOutput> {
    // Extract from context
    const analysisUuid = input.context?.analysisUuid as string;
    const ownerId = input.context?.ownerId as string;
    const reportType =
      (input.context?.reportType as 'executive' | 'detailed' | 'investor') ||
      'executive';

    this.logger.debug(`ReportGeneratorAgent: analysisUuid=${analysisUuid}`);

    // 1. Fetch completed analysis with scores/findings
    const analysis = await this.analysisService.getAnalysisResult(
      analysisUuid,
      ownerId,
    );

    if (!analysis || analysis.status !== 'completed') {
      throw new Error(
        `Analysis not completed. Status: ${analysis?.status || 'not found'}`,
      );
    }

    // 2. RAG query for deck content
    // Use deckId from input which is required by AgentInput interface
    const deckUuid = input.deckId;
    const ragTool = this.ragTool.createTool(deckUuid);
    const deckContentStr = await ragTool.func(
      'Full pitch deck content including team, market, financials, and product',
    );

    const deckResult = JSON.parse(deckContentStr);
    if (!deckResult.success) {
      throw new Error(`RAG query failed: ${deckResult.error}`);
    }

    // 3. Format analysis data for prompt
    const analysisData = this.formatAnalysisData(analysis);

    // 4. Format deck content from RAG results
    const deckContent = deckResult.results
      ? deckResult.results
          .map((r: { content: string }) => r.content)
          .join('\n\n')
      : '';

    // 5. Generate report via LLM
    const llmResponse = await this.openaiTool.call([
      new SystemMessage(REPORT_SYSTEM_PROMPT),
      new HumanMessage(
        REPORT_USER_PROMPT(deckContent, analysisData, reportType),
      ),
    ]);

    // 6. Parse and validate output
    const output = this.parseOutput(llmResponse);
    output.metadata.analysisUuid = analysisUuid;
    output.metadata.reportType = reportType;

    this.addIntermediateStep(
      'analysis_fetch',
      { uuid: analysisUuid },
      { status: analysis.status, scoreCount: analysis.scores.length },
    );
    this.addIntermediateStep('rag_query', { deckUuid }, deckResult);
    this.addIntermediateStep('llm_generation', { reportType }, output);

    return {
      success: true,
      data: output as unknown as Record<string, unknown>,
    };
  }

  private formatAnalysisData(analysis: AnalysisResult): string {
    const scores = analysis.scores
      .getItems()
      .map((s) => `${s.category}: ${s.score}/100 - ${s.summary}`)
      .join('\n');

    const findings = analysis.findings
      .getItems()
      .map((f) => `[${f.type.toUpperCase()}] ${f.title}: ${f.description}`)
      .join('\n');

    return `OVERALL SCORE: ${
      analysis.overallScore || 'N/A'
    }/100\n\nSCORES:\n${scores}\n\nFINDINGS:\n${findings}`;
  }

  private parseOutput(raw: string): ReportOutput {
    try {
      const jsonMatch =
        raw.match(/```json\n?([\s\S]*?)\n?```/) ||
        raw.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : raw;
      const parsed = JSON.parse(jsonStr);

      return {
        title: parsed.title || 'Analysis Report',
        executiveSummary: parsed.executiveSummary || '',
        sections: (parsed.sections || []).map(
          (
            s: { title: string; content: string; order?: number },
            i: number,
          ) => ({
            title: s.title,
            content: s.content,
            order: s.order || i + 1,
          }),
        ),
        recommendations: parsed.recommendations || [],
        conclusion: parsed.conclusion || '',
        metadata: {
          generatedAt: new Date(),
          analysisUuid: '', // Set by caller
          reportType: '', // Set by caller
          wordCount: this.countWords(parsed),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to parse report: ${raw}`, error);
      throw new Error('Failed to parse report generation response');
    }
  }

  private countWords(obj: object): number {
    return JSON.stringify(obj).split(/\s+/).length;
  }
}
