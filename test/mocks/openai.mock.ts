/**
 * OpenAI Mock
 * Phase 8: Integration Tests
 *
 * Mock responses for OpenAI API calls
 */

export const mockOpenAIResponse = (prompt: string) => {
  if (prompt.includes('sector') || prompt.includes('industry')) {
    return JSON.stringify({
      detectedSectors: ['AI/ML', 'Enterprise Software'],
      alignmentScore: 85,
      justification: 'Strong alignment with AI/ML investment focus',
      matchReasons: ['Direct sector match', 'Large market opportunity'],
      concerns: [],
    });
  }

  if (prompt.includes('stage') || prompt.includes('funding')) {
    return JSON.stringify({
      detectedStage: 'Seed',
      alignmentScore: 90,
      justification: 'Excellent seed-stage metrics',
      metrics: {
        traction: '$500K ARR',
        revenue: '$500K',
        teamSize: 12,
      },
    });
  }

  if (prompt.includes('thesis')) {
    return JSON.stringify({
      thesisKeywords: ['ai', 'enterprise', 'automation'],
      deckKeywords: ['ai', 'enterprise', 'automation'],
      semanticSimilarity: 75,
      justification: 'Good strategic alignment with investment thesis',
      alignmentPoints: ['AI focus matches thesis', 'Enterprise market fit'],
      gaps: [],
    });
  }

  if (prompt.includes('strength')) {
    return JSON.stringify({
      strengths: [
        {
          title: 'Strong technical founding team',
          description: 'Deep AI expertise with proven track record',
          severity: 'major',
          recommendations: ['Highlight team background in early slides'],
          evidence: {
            quote: 'Founders with 10+ years experience',
            slideNumber: 2,
          },
        },
      ],
      summary: 'Key strength: Experienced team with relevant expertise',
    });
  }

  if (prompt.includes('weakness')) {
    return JSON.stringify({
      weaknesses: [
        {
          title: 'Competitive differentiation unclear',
          description: 'Value proposition could be more specific',
          severity: 'minor',
          recommendations: ['Add competitive matrix slide'],
          evidence: { slideNumber: 8 },
        },
      ],
      summary: 'Minor concern: Improve competitive positioning',
    });
  }

  if (prompt.includes('competitive') || prompt.includes('landscape')) {
    return JSON.stringify({
      competitors: [
        {
          name: 'Competitor A',
          strength: 'Established market presence',
          weakness: 'Legacy technology stack',
        },
      ],
      opportunities: [
        {
          title: 'Strong market position in AI/ML',
          description: 'Well-positioned to capture market share',
          severity: 'info',
        },
      ],
      summary: 'Competitive landscape analysis complete',
    });
  }

  return JSON.stringify({ message: 'Unknown prompt type' });
};
