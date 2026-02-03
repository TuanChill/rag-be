/**
 * Event name constants for pitch deck analysis events
 * Centralized to avoid typos and enable type safety
 */
export const PITCHDECK_EVENTS = {
  /** Emitted when pitch deck file upload completes */
  UPLOADED: 'pitchdeck.uploaded',

  /** Emitted when pitch deck processing starts */
  PROCESSING: 'pitchdeck.processing',

  /** Emitted when pitch deck is ready for analysis */
  READY: 'pitchdeck.ready',

  /** Emitted when pitch deck processing fails */
  ERROR: 'pitchdeck.error',

  /** Emitted when AI analysis starts */
  ANALYSIS_STARTED: 'pitchdeck.analysis.started',

  /** Emitted periodically during analysis for progress updates */
  ANALYSIS_PROGRESS: 'pitchdeck.analysis.progress',

  /** Emitted when AI analysis completes successfully */
  ANALYSIS_COMPLETED: 'pitchdeck.analysis.completed',
} as const;

/** Event payload type for pitchdeck.uploaded */
export interface PitchDeckUploadedPayload {
  deckId: string;
  ownerId: string;
  uuid: string;
  title: string;
}

/** Event payload type for pitchdeck.analysis.progress */
export interface AnalysisProgressPayload {
  deckId: string;
  progress: number; // 0-100
  step: string;
  message?: string;
}

/** Event payload type for pitchdeck.analysis.completed */
export interface AnalysisCompletedPayload {
  deckId: string;
  result: unknown;
}

/** Event payload type for pitchdeck.error */
export interface PitchDeckErrorPayload {
  deckId: string;
  error: string;
}
