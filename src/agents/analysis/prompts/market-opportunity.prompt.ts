/**
 * Market Opportunity Agent Prompt
 * Phase 9: UI Output Format Modifications
 *
 * Analyzes market opportunity, TAM/SAM/SOM, and market positioning
 */

export const MARKET_OPPORTUNITY_SYSTEM_PROMPT = `You are an expert at market analysis and sizing for startups.
You evaluate TAM/SAM/SOM definitions, market growth trends, and market opportunity validation.`;

export const MARKET_OPPORTUNITY_PROMPT = (deckContent: string) => `
PITCH DECK CONTENT:
${deckContent}

TASK:
Analyze the market opportunity presented in this pitch deck.

EVALUATE:
- TAM (Total Addressable Market) - clearly defined and realistic?
- SAM (Serviceable Addressable Market) - target market reachable?
- SOM (Serviceable Obtainable Market) - capture plan credible?
- Market growth trends and timing
- Market problem validation and urgency
- Market gap/white space opportunity

SCORING GUIDE (0-100):
- 90-100: Clear TAM/SAM/SOM with supporting data, massive validated market, perfect timing
- 75-89: Well-defined market size with credible sources, good opportunity, strong timing
- 60-74: Adequate market definition but some gaps, moderate opportunity
- 40-59: Vague market sizing, questionable assumptions, weak opportunity validation
- 0-39: No clear market definition, unrealistic numbers, poor opportunity

OUTPUT FORMAT (JSON only):
{
  "score": 75,
  "summary": "The deck presents a $50B TAM for AI-powered developer tools, with a $5B SAM of mid-market enterprises. The SOM of $500M by year 5 appears conservative given current growth rates. Market timing is favorable with increasing enterprise AI adoption.",
  "findings": [
    {
      "title": "Large and growing TAM with credible sources",
      "description": "The $50B TAM figure is well-supported by industry reports from Gartner and McKinsey. The market shows 25% CAGR driven by enterprise digital transformation.",
      "impact": "positive",
      "severity": "major",
      "recommendations": ["Add secondary source citations", "Include segment breakdown"],
      "evidence": { "quote": "$50B TAM growing at 25% CAGR", "slideNumber": 5 }
    },
    {
      "title": "SOM capture plan lacks detail",
      "description": "The $500M SOM by year 5 is presented without clear justification on market entry strategy or customer acquisition ramp.",
      "impact": "negative",
      "severity": "major",
      "recommendations": ["Add go-to-market timeline", "Show customer acquisition ramp", "Include market penetration assumptions"],
      "evidence": { "quote": "Conservative SOM projection", "slideNumber": 6 }
    }
  ]
}

IMPORTANT:
- Return valid JSON only
- Score should reflect market opportunity quality
- Summary must be 2-3 sentences
- Evaluate both market size AND capture strategy
- Recommendations must be actionable
`;
