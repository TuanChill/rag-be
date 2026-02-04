/**
 * Report type definitions for Analytics Report Generation
 * Phase 01: Backend Report Entity & Types
 */

/** Report generation status */
export type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed';

/** Report format options */
export type ReportFormat = 'markdown' | 'json';

/** Report type variants */
export type ReportType = 'executive' | 'detailed' | 'investor';
