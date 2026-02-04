/**
 * Analysis job data structure
 * Used by BullMQ queue to pass data between producer and consumer
 */
export interface AnalysisJobData {
  /** Pitch deck entity ID (ObjectId) - MongoDB _id */
  deckId: string;

  /** Pitch deck UUID for logging/events - public identifier */
  deckUuid: string;

  /** User ID who owns the deck (ObjectId) */
  ownerId: string;

  /** Analysis type - determines which agents to run */
  type:
    | 'full'
    | 'sector'
    | 'stage'
    | 'thesis'
    | 'strengths'
    | 'weaknesses'
    | 'competitive';

  /** Optional job priority (0 = highest, 10 = lowest) */
  priority?: number;
}

/**
 * Job progress tracking structure
 * Updated during job execution for real-time status
 */
export interface JobProgress {
  /** Current step number (0-indexed) */
  current: number;

  /** Total number of steps */
  total: number;

  /** Human-readable step description */
  step: string;

  /** Optional detailed message */
  message?: string;

  /** Progress percentage (0-100) - computed from current/total */
  percent?: number;
}

/**
 * Job state enumeration
 * Tracks lifecycle of queued jobs
 */
export type JobState =
  | 'waiting'
  | 'active'
  | 'completed'
  | 'failed'
  | 'delayed';

/**
 * Job result structure
 * Returned by consumer on successful completion
 */
export interface AnalysisJobResult {
  /** Job ID for reference */
  jobId: string;

  /** Analysis result data */
  data: unknown;

  /** Timestamp of completion */
  completedAt: Date;
}

/**
 * Job error structure
 * Returned by consumer on failure
 */
export interface AnalysisJobError {
  /** Job ID for reference */
  jobId: string;

  /** Error message */
  error: string;

  /** Timestamp of failure */
  failedAt: Date;

  /** Whether job can be retried */
  retryable: boolean;
}
