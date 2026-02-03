/**
 * Analysis type definitions for Pitch Deck AI Analysis Engine
 * Phase 2: Analysis Entities & DTOs
 */

/** Analysis workflow status */
export type AnalysisStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

/** Score category for weighted scoring algorithm */
export type ScoreCategory =
  | 'sector'
  | 'stage'
  | 'thesis'
  | 'history'
  | 'overall';

/** Finding type for strengths/weaknesses output */
export type FindingType = 'strength' | 'weakness' | 'opportunity' | 'threat';

/** Severity level for findings */
export type FindingSeverity = 'critical' | 'major' | 'minor' | 'info';

/** Agent execution status */
export type AgentStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped';

/** Analysis type - full or targeted */
export type AnalysisType = 'full' | 'sector' | 'stage' | 'thesis';
