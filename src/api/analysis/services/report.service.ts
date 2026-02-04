/**
 * Report Service
 * Phase 03: Analytics Report Generation - Backend Queue & API Layer
 *
 * Manages report generation and retrieval
 */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  EntityManager,
  EntityRepository,
  Reference,
  wrap,
} from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { v4 as uuidv4 } from 'uuid';
import { AnalysisReport } from '../entities/analysis-report.entity';
import { AnalysisResult } from '../entities/analysis-result.entity';
import { User } from '@api/user/entities/user.entity';
import { ReportRepository } from '../repositories/report.repository';
import { ReportQueueProducer } from '@core/queue/producers/report-queue.producer';
import { ReportStatus } from '../types/report.types';
import { CreateReportDto } from '../dto/create-report.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(AnalysisReport)
    private readonly reportRepository: ReportRepository,
    @InjectRepository(AnalysisResult)
    private readonly analysisRepository: EntityRepository<AnalysisResult>,
    private readonly em: EntityManager,
    private readonly queueProducer: ReportQueueProducer,
  ) {}

  /**
   * Generate report for analysis
   * @param analysisUuid Analysis UUID to generate report for
   * @param ownerId User ID who owns the analysis
   * @param dto Report creation parameters
   * @returns Created report entity
   */
  async generateReport(
    analysisUuid: string,
    ownerId: string,
    dto: CreateReportDto,
  ): Promise<AnalysisReport> {
    // Find analysis
    const analysis = await this.analysisRepository.findOne({
      uuid: analysisUuid,
      owner: new ObjectId(ownerId),
    });

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    if (analysis.status !== 'completed') {
      throw new BadRequestException(
        `Cannot generate report for analysis with status: ${analysis.status}`,
      );
    }

    // Create report entity
    const reportUuid = uuidv4();
    const report = this.reportRepository.create({
      uuid: reportUuid,
      reportType: dto.reportType,
      format: dto.format || 'markdown',
      status: 'pending' as ReportStatus,
      analysis: Reference.createFromPK(AnalysisResult, analysis._id),
      owner: Reference.createFromPK(User, new ObjectId(ownerId)),
    });

    this.em.persist(report);
    await this.em.flush();

    // Queue report generation job
    await this.queueProducer.addReportJob({
      reportUuid,
      analysisUuid,
      ownerId,
      reportType: dto.reportType,
      format: dto.format || 'markdown',
      priority: 5,
    });

    return report;
  }

  /**
   * Get report by UUID
   * @param reportUuid Report UUID
   * @param ownerId User ID who owns the report
   * @returns Report entity
   */
  async getReportByUuid(
    reportUuid: string,
    ownerId: string,
  ): Promise<AnalysisReport> {
    const report = await this.reportRepository.findOne({
      uuid: reportUuid,
      owner: new ObjectId(ownerId),
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  /**
   * Get all reports for an analysis
   * @param analysisUuid Analysis UUID
   * @param ownerId User ID who owns the analysis
   * @returns Array of reports
   */
  async getReportsByAnalysis(
    analysisUuid: string,
    ownerId: string,
  ): Promise<AnalysisReport[]> {
    // Verify analysis exists and belongs to user
    const analysis = await this.analysisRepository.findOne({
      uuid: analysisUuid,
      owner: new ObjectId(ownerId),
    });

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    return this.reportRepository.findByAnalysisId(analysisUuid);
  }

  /**
   * Update report status
   * @param reportUuid Report UUID
   * @param status New status
   */
  async updateStatus(reportUuid: string, status: ReportStatus): Promise<void> {
    const report = await this.reportRepository.findOne({ uuid: reportUuid });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    wrap(report).assign({ status });
    await this.em.flush();
  }

  /**
   * Mark report as completed with content
   * @param reportUuid Report UUID
   * @param content Generated report content
   */
  async completeReport(reportUuid: string, content: string): Promise<void> {
    const report = await this.reportRepository.findOne({ uuid: reportUuid });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    wrap(report).assign({
      status: 'completed' as ReportStatus,
      content,
      generatedAt: new Date(),
    });

    await this.em.flush();
  }

  /**
   * Mark report as failed with error message
   * @param reportUuid Report UUID
   * @param errorMessage Error message
   */
  async failReport(reportUuid: string, errorMessage: string): Promise<void> {
    const report = await this.reportRepository.findOne({ uuid: reportUuid });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    wrap(report).assign({
      status: 'failed' as ReportStatus,
      errorMessage,
    });

    await this.em.flush();
  }
}
