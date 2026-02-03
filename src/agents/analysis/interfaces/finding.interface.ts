/**
 * Finding interfaces for Pitch Deck AI Analysis Engine
 * Phase 5: Analysis Agents
 */

/** Main finding interface */
export interface Finding {
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
  title: string;
  description: string;
  severity: 'critical' | 'major' | 'minor' | 'info';
  recommendations?: string[];
  source: string; // Which agent produced this
  evidence?: {
    quote?: string;
    slideNumber?: number;
    context?: string;
  };
}

/** Competitive finding extends base finding */
export interface CompetitiveFinding extends Finding {
  type: 'opportunity' | 'threat';
  competitiveAspect: 'market' | 'product' | 'team' | 'traction';
}
