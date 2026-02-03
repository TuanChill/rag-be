/**
 * Competitive Agent Prompt
 * Phase 5: Analysis Agents
 */

export const COMPETITIVE_SYSTEM_PROMPT = `You are an expert at competitive analysis and market positioning.
You analyze market dynamics, competition, and strategic opportunities/threats.`;

export const COMPETITIVE_PROMPT = (deckContent: string) => `
PITCH DECK CONTENT:
${deckContent}

TASK:
Analyze the competitive landscape and identify opportunities and threats.

For each finding, provide:
1. A concise title (5-10 words)
2. Detailed description (2-3 sentences)
3. Type: "opportunity" or "threat"
4. Severity level (critical, major, minor, or info)
5. Competitive aspect: market, product, team, or traction
6. Specific recommendations
7. Supporting evidence

RESPONSE FORMAT (JSON):
{
  "findings": [
    {
      "title": "Large TAM with fragmented competition",
      "description": "...",
      "type": "opportunity",
      "severity": "major",
      "competitiveAspect": "market",
      "recommendations": ["..."],
      "evidence": { "quote": "..." }
    }
  ],
  "summary": "Overall competitive positioning summary"
}
`;
