/**
 * Report job data structure
 * Used by BullMQ queue to pass data between producer and consumer
 */
export interface ReportJobData {
  /** Analysis UUID to generate report for */
  analysisUuid: string;

  /** Report entity UUID */
  reportUuid: string;

  /** User ID who owns the analysis (ObjectId) */
  ownerId: string;

  /** Report type variant */
  reportType: 'executive' | 'detailed' | 'investor';

  /** Report format */
  format: 'markdown' | 'json';

  /** Optional job priority (0 = highest, 10 = lowest) */
  priority?: number;
}
