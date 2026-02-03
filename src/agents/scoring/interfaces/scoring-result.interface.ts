/**
 * Scoring result interfaces for Pitch Deck AI Analysis Engine
 * Phase 4: Scoring Agents
 */

/** Main scoring result */
export interface ScoringResult {
  category: 'sector' | 'stage' | 'thesis' | 'history';
  score: number; // 0-100
  weight: number;
  justification: string;
  details?: {
    matchReasons: string[];
    concerns: string[];
    benchmark?: string;
  };
}

/** Sector match specific details */
export interface SectorMatchDetails {
  detectedSectors: string[];
  targetSectors: string[];
  overlap: number;
}

/** Stage match specific details */
export interface StageMatchDetails {
  detectedStage: string;
  targetStages: string[];
  metrics: {
    traction?: string;
    revenue?: string;
    teamSize?: number;
  };
}

/** Thesis overlap specific details */
export interface ThesisOverlapDetails {
  thesisKeywords: string[];
  deckKeywords: string[];
  jaccardSimilarity: number;
  semanticSimilarity: number;
}
