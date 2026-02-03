import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  PITCHDECK_EVENTS,
  PitchDeckUploadedPayload,
  AnalysisProgressPayload,
  AnalysisCompletedPayload,
  PitchDeckErrorPayload,
} from './constants/events.constant';

/**
 * Event service wrapper - provides type-safe event emission
 * All pitch deck lifecycle events flow through this service
 */
@Injectable()
export class EventsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Emit pitch deck uploaded event
   * Triggers analysis job creation
   */
  emitPitchDeckUploaded(payload: PitchDeckUploadedPayload): void {
    this.eventEmitter.emit(PITCHDECK_EVENTS.UPLOADED, payload);
  }

  /**
   * Emit pitch deck processing event
   * Indicates extraction/chunking in progress
   */
  emitPitchDeckProcessing(deckId: string): void {
    this.eventEmitter.emit(PITCHDECK_EVENTS.PROCESSING, { deckId });
  }

  /**
   * Emit pitch deck ready event
   * Indicates deck is ready for AI analysis
   */
  emitPitchDeckReady(deckId: string): void {
    this.eventEmitter.emit(PITCHDECK_EVENTS.READY, { deckId });
  }

  /**
   * Emit pitch deck error event
   * Indicates processing/analysis failure
   */
  emitPitchDeckError(payload: PitchDeckErrorPayload): void {
    this.eventEmitter.emit(PITCHDECK_EVENTS.ERROR, payload);
  }

  /**
   * Emit analysis started event
   * Indicates agent workflow has begun
   */
  emitAnalysisStarted(deckId: string): void {
    this.eventEmitter.emit(PITCHDECK_EVENTS.ANALYSIS_STARTED, { deckId });
  }

  /**
   * Emit analysis progress event
   * Provides real-time progress updates (0-100%)
   */
  emitAnalysisProgress(payload: AnalysisProgressPayload): void {
    this.eventEmitter.emit(PITCHDECK_EVENTS.ANALYSIS_PROGRESS, payload);
  }

  /**
   * Emit analysis completed event
   * Indicates all agents have finished successfully
   */
  emitAnalysisCompleted(payload: AnalysisCompletedPayload): void {
    this.eventEmitter.emit(PITCHDECK_EVENTS.ANALYSIS_COMPLETED, payload);
  }
}
