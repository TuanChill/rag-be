/**
 * Team & Execution Agent Prompt
 * Phase 9: UI Output Format Modifications
 *
 * Analyzes founding team, traction, and execution capability
 */

export const TEAM_EXECUTION_SYSTEM_PROMPT = `You are an expert at evaluating startup teams and execution capabilities.
You assess founding team expertise, advisor quality, traction milestones, and operational capability.`;

export const TEAM_EXECUTION_PROMPT = (deckContent: string) => `
PITCH DECK CONTENT:
${deckContent}

TASK:
Analyze the team and execution capability presented in this pitch deck.

EVALUATE:
- Founding team expertise and experience
- Team completeness (technical, business, operations)
- Advisor quality and board composition
- Traction and milestones achieved
- Operational capability and execution risk
- Team cohesion and vision alignment

SCORING GUIDE (0-100):
- 90-100: Exceptional team with proven track record, strong traction, complete skill set
- 75-89: Strong team with relevant experience, good traction, minor gaps
- 60-74: Capable team but missing key roles or limited traction
- 40-59: Team gaps or lack of relevant experience raise execution risk
- 0-39: Inexperienced team or significant execution concerns

OUTPUT FORMAT (JSON only):
{
  "score": 82,
  "summary": "Strong founding team with previous exit experience and relevant technical expertise. Impressive early traction with 50+ paying customers and $500K ARR. Team would benefit from adding dedicated sales leadership as they scale.",
  "findings": [
    {
      "title": "Founders with proven exit experience",
      "description": "CEO and CTO both have previous successful exits in the same domain, indicating strong execution capability and market understanding.",
      "impact": "positive",
      "severity": "major",
      "recommendations": ["Highlight previous exits more prominently"],
      "evidence": { "quote": "Previously founded and sold X Corp", "slideNumber": 10 }
    },
    {
      "title": "Impressive early traction metrics",
      "description": "50+ paying customers and $500K ARR in first year demonstrates strong product-market fit and execution capability.",
      "impact": "positive",
      "severity": "major",
      "recommendations": ["Add cohort retention data", "Show growth trajectory"],
      "evidence": { "quote": "50+ customers, $500K ARR", "slideNumber": 11 }
    },
    {
      "title": "Missing dedicated sales leadership",
      "description": "As the company scales from $500K to $2M ARR, having a dedicated VP of Sales will be critical for continued growth.",
      "impact": "negative",
      "severity": "minor",
      "recommendations": ["Add sales hire to roadmap", "Consider fractional sales leader"],
      "evidence": { "quote": "Team slide", "slideNumber": 10 }
    }
  ]
}

IMPORTANT:
- Return valid JSON only
- Score should reflect team quality and execution capability
- Summary must be 2-3 sentences
- Evaluate both team composition AND traction
- Recommendations must be actionable
`;
