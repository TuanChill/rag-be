/**
 * Report Queue Consumer
 * Phase 03: Analytics Report Generation - Backend Queue & API Layer
 *
 * Processes report generation jobs from the queue
 * Uses WorkerHost pattern for BullMQ
 */
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ReportJobData } from '../interfaces/report-job.interface';
import { ReportGeneratorAgent } from '@agents/report/report-generator.agent';
import { ReportService } from '@api/analysis/services/report.service';

@Injectable()
@Processor('report-generation')
export class ReportQueueConsumer extends WorkerHost {
  private readonly logger = new Logger(ReportQueueConsumer.name);

  constructor(
    @Inject(forwardRef(() => ReportGeneratorAgent))
    private readonly reportAgent: ReportGeneratorAgent,
    @Inject(forwardRef(() => ReportService))
    private readonly reportService: ReportService,
  ) {
    super();
  }

  async process(job: Job<ReportJobData>): Promise<void> {
    const { reportUuid, analysisUuid, ownerId, reportType, format } = job.data;

    this.logger.log(
      `Processing report job: ${job.id} for report: ${reportUuid}`,
    );

    try {
      // Update status to generating
      await job.updateProgress(10);
      await this.reportService.updateStatus(reportUuid, 'generating');

      // Execute report generation via agent
      await job.updateProgress(30);

      // The agent needs deckId in AgentInput, we need to get it from the analysis
      // For now, we'll pass analysisUuid as deckId since agent will fetch analysis anyway
      const result = await this.reportAgent.execute({
        deckId: analysisUuid, // Placeholder - agent fetches analysis internally
        context: {
          analysisUuid,
          ownerId,
          reportType,
        },
      });

      if (!result.success || !result.data) {
        throw new Error('Report generation failed - no data returned');
      }

      // Extract report content from agent output
      await job.updateProgress(80);
      const reportOutput = result.data as any;

      // Format content based on requested format
      let content: string;
      if (format === 'json') {
        content = JSON.stringify(reportOutput, null, 2);
      } else {
        // Convert to markdown
        content = this.formatAsMarkdown(reportOutput);
      }

      // Mark report as completed
      await job.updateProgress(90);
      await this.reportService.completeReport(reportUuid, content);

      await job.updateProgress(100);
      this.logger.log(`Report job completed: ${job.id}`);
    } catch (error) {
      this.logger.error(`Report job failed: ${job.id}`, error);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.reportService.failReport(reportUuid, errorMessage);

      throw error;
    }
  }

  /**
   * Format report output as markdown
   */
  private formatAsMarkdown(output: any): string {
    const parts: string[] = [];

    if (output.title) {
      parts.push(`# ${output.title}\n`);
    }

    if (output.executiveSummary) {
      parts.push(`## Executive Summary\n\n${output.executiveSummary}\n`);
    }

    if (output.sections && Array.isArray(output.sections)) {
      output.sections.forEach((section: any) => {
        parts.push(`## ${section.title}\n\n${section.content}\n`);
      });
    }

    if (output.recommendations && Array.isArray(output.recommendations)) {
      parts.push(`## Recommendations\n`);
      output.recommendations.forEach((rec: string) => {
        parts.push(`- ${rec}`);
      });
      parts.push('');
    }

    if (output.conclusion) {
      parts.push(`## Conclusion\n\n${output.conclusion}\n`);
    }

    return parts.join('\n');
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(
      `Report job ${job.id} started for report: ${job.data.reportUuid}`,
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(
      `Report job ${job.id} completed for report: ${job.data.reportUuid}`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Report job ${job.id} failed for report: ${job.data.reportUuid} - ${error.message}`,
    );
  }
}
