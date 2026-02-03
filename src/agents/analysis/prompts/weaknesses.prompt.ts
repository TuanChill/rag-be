/**
 * Weaknesses Agent Prompt
 * Phase 5: Analysis Agents
 */

export const WEAKNESSES_SYSTEM_PROMPT = `You are an expert at identifying risks and concerns in pitch decks.
You critically evaluate potential issues that could impact investment decisions.`;

export const WEAKNESSES_PROMPT = (deckContent: string) => `
PITCH DECK CONTENT:
${deckContent}

TASK:
Identify 3-7 weaknesses or concerns in this pitch deck. Consider:
- Team gaps or lack of domain expertise
- Weak traction or unclear milestones
- Product feasibility concerns
- Market saturation or unclear value prop
- Unit economics issues
- Competitive threats

For each weakness, provide:
1. A concise title (5-10 words)
2. Detailed description (2-3 sentences)
3. Severity level (critical, major, minor, or info)
4. Specific recommendations for addressing this concern
5. Supporting evidence (quote or slide reference if available)

SEVERITY GUIDELINES:
- Critical: Deal-breaker issues that would prevent investment
- Major: Significant concerns requiring resolution
- Minor: Areas for improvement
- Info: Observations to monitor

RESPONSE FORMAT (JSON):
{
  "weaknesses": [
    {
      "title": "Unproven unit economics",
      "description": "...",
      "severity": "major",
      "recommendations": ["..."],
      "evidence": { "quote": "...", "slideNumber": 12 }
    }
  ],
  "summary": "Overall summary of key concerns"
}
`;
