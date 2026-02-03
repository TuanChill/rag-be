/**
 * Financial Projections Agent Prompt
 * Phase 9: UI Output Format Modifications
 *
 * Analyzes financial projections, runway, and funding requirements
 */

export const FINANCIAL_PROJECTIONS_SYSTEM_PROMPT = `You are an expert at evaluating startup financial projections and funding requirements.
You assess revenue forecast realism, cost structure, burn rate, runway, and funding ask justification.`;

export const FINANCIAL_PROJECTIONS_PROMPT = (deckContent: string) => `
PITCH DECK CONTENT:
${deckContent}

TASK:
Analyze the financial projections presented in this pitch deck.

EVALUATE:
- Revenue projections realism and growth assumptions
- Cost structure completeness and reasonableness
- Burn rate calculation and accuracy
- Runway sufficiency and milestones covered
- Funding ask justification and use of proceeds
- Key financial assumptions and sensitivity

SCORING GUIDE (0-100):
- 90-100: Realistic projections with clear assumptions, adequate runway, justified ask
- 75-89: Well-reasoned projections with reasonable assumptions, sufficient runway
- 60-74: Plausible projections but some optimistic assumptions or tight runway
- 40-59: Overly optimistic projections or inadequate runway for milestones
- 0-39: Unrealistic projections or major gaps in financial planning

OUTPUT FORMAT (JSON only):
{
  "score": 65,
  "summary": "Revenue projections show aggressive but achievable growth from $500K to $5M ARR over 3 years. However, burn rate assumptions may be understated given hiring plans, resulting in only 12 months runway. The $3M funding ask is reasonable but should be extended to 18-24 months for safety.",
  "findings": [
    {
      "title": "Aggressive but achievable growth trajectory",
      "description": "Projecting 10x ARR growth over 3 years is ambitious but supported by strong early metrics and market opportunity.",
      "impact": "positive",
      "severity": "major",
      "recommendations": ["Show bear/base/bull cases", "Include sensitivity analysis"],
      "evidence": { "quote": "$500K to $5M ARR in 3 years", "slideNumber": 14 }
    },
    {
      "title": "Burn rate may be understated",
      "description": "Projected burn rate of $200K/month may not account for ramp time in new hires, benefits, and office expansion as the team scales.",
      "impact": "negative",
      "severity": "major",
      "recommendations": ["Add hiring ramp costs", "Include benefits burden", "Account for office expansion"],
      "evidence": { "quote": "$200K monthly burn", "slideNumber": 15 }
    },
    {
      "title": "Tight runway for planned milestones",
      "description": "12 months runway is tight for achieving the stated milestones. A miss would force a down-round or rushed fundraising.",
      "impact": "negative",
      "severity": "critical",
      "recommendations": ["Extend runway to 18-24 months", "Plan for lower burn scenario", "Raise more if milestones uncertain"],
      "evidence": { "quote": "12 months runway", "slideNumber": 16 }
    }
  ]
}

IMPORTANT:
- Return valid JSON only
- Score should reflect financial projections quality
- Summary must be 2-3 sentences
- Focus on assumptions realism AND runway adequacy
- Recommendations must be actionable
`;
