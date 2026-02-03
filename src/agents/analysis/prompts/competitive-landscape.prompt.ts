/**
 * Competitive Landscape Agent Prompt
 * Phase 9: UI Output Format Modifications
 *
 * Analyzes competitive landscape and market positioning
 */

export const COMPETITIVE_LANDSCAPE_SYSTEM_PROMPT = `You are an expert at competitive analysis and market positioning.
You analyze market dynamics, competition, differentiation, and strategic opportunities/threats.`;

export const COMPETITIVE_LANDSCAPE_PROMPT = (deckContent: string) => `
PITCH DECK CONTENT:
${deckContent}

TASK:
Analyze the competitive landscape and market positioning.

EVALUATE:
- Market differentiation and competitive advantage
- Competitive positioning (leader, challenger, niche)
- Barriers to entry and defensibility
- Market saturation and competition intensity
- Strategic opportunities and threats
- Unique value proposition clarity

SCORING GUIDE (0-100):
- 90-100: Clear differentiation with strong moat, defensible position, blue ocean
- 75-89: Good differentiation with identifiable advantage, moderate competition
- 60-74: Some differentiation but competitive space is crowded
- 40-59: Weak differentiation, intense competition, low barriers to entry
- 0-39: No clear differentiation, highly competitive, no moat

OUTPUT FORMAT (JSON only):
{
  "score": 70,
  "summary": "The startup has a clear technical differentiation through its proprietary AI model, providing 2-3x accuracy improvement over competitors. However, the market is crowded with well-funded incumbents. The key opportunity is in the mid-market enterprise segment which is underserved by current solutions.",
  "findings": [
    {
      "title": "Proprietary AI model provides 2-3x accuracy improvement",
      "description": "The company's custom-trained model demonstrates significant accuracy advantages over generic solutions, creating a genuine technical moat.",
      "impact": "positive",
      "severity": "major",
      "recommendations": ["Publish benchmark comparisons", "File patent protection"],
      "evidence": { "quote": "2-3x more accurate than competitors", "slideNumber": 7 }
    },
    {
      "title": "Crowded market with well-funded incumbents",
      "description": "Large tech companies are investing heavily in this space, potentially replicating features and squeezing margins.",
      "impact": "negative",
      "severity": "major",
      "recommendations": ["Focus on underserved vertical", "Emphasize speed of innovation", "Build strategic partnerships"],
      "evidence": { "quote": "Competitive landscape slide", "slideNumber": 17 }
    },
    {
      "title": "Underserved mid-market enterprise opportunity",
      "description": "Current competitors focus on enterprise or SMB segments, leaving mid-market companies without tailored solutions.",
      "impact": "positive",
      "severity": "minor",
      "recommendations": ["Double down on mid-market", "Build mid-market specific features"],
      "evidence": { "quote": "Mid-market focus", "slideNumber": 8 }
    }
  ]
}

IMPORTANT:
- Return valid JSON only
- Score should reflect competitive positioning strength
- Summary must be 2-3 sentences
- Balance opportunities (positive) and threats (negative)
- Recommendations must be actionable
`;
