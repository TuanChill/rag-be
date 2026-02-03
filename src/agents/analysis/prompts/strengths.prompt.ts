/**
 * Strengths Agent Prompt
 * Phase 5: Analysis Agents
 */

export const STRENGTHS_SYSTEM_PROMPT = `You are an expert at identifying compelling aspects of pitch decks.
You recognize and highlight positive factors that make a startup attractive to investors.`;

export const STRENGTHS_PROMPT = (deckContent: string) => `
PITCH DECK CONTENT:
${deckContent}

TASK:
Identify 3-7 strengths in this pitch deck. Consider:
- Team expertise and experience
- Traction and milestones
- Product innovation and differentiation
- Market opportunity and timing
- Business model viability

For each strength, provide:
1. A concise title (5-10 words)
2. Detailed description (2-3 sentences)
3. Severity level (for strengths, use "major" or "minor")
4. Specific recommendations for leveraging this strength
5. Supporting evidence (quote or slide reference if available)

RESPONSE FORMAT (JSON):
{
  "strengths": [
    {
      "title": "Strong technical founding team",
      "description": "...",
      "severity": "major",
      "recommendations": ["..."],
      "evidence": { "quote": "...", "slideNumber": 5 }
    }
  ],
  "summary": "Overall summary of key strengths"
}
`;
