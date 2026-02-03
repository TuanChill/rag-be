/**
 * Analysis Test Fixtures
 * Phase 8: Integration Tests
 *
 * Test data for analysis results
 */

export const mockSectorScore = {
  category: 'sector' as const,
  score: 85,
  weight: 0.3,
  details: 'Strong alignment with AI/ML focus',
};

export const mockStageScore = {
  category: 'stage' as const,
  score: 90,
  weight: 0.25,
  details: 'Excellent seed-stage fit with strong traction',
};

export const mockThesisScore = {
  category: 'thesis' as const,
  score: 75,
  weight: 0.25,
  details: 'Good strategic fit with investment thesis',
};

export const mockHistoryScore = {
  category: 'history' as const,
  score: 80,
  weight: 0.2,
  details: 'Good fit with historical behavior patterns',
};

export const mockStrengthFinding = {
  type: 'strength' as const,
  title: 'Strong technical founding team',
  description: 'Founders have deep expertise in AI and enterprise software.',
  severity: 'major' as const,
  source: 'StrengthsAgent',
};

export const mockWeaknessFinding = {
  type: 'weakness' as const,
  title: 'Limited competitive differentiation',
  description:
    'Value proposition needs clearer differentiation from existing solutions.',
  severity: 'minor' as const,
  source: 'WeaknessesAgent',
};

export const mockCompetitiveFinding = {
  type: 'opportunity' as const,
  title: 'Strong market position in AI/ML',
  description: 'Well-positioned to capture market share in enterprise AI.',
  severity: 'info' as const,
  source: 'CompetitiveAgent',
};
