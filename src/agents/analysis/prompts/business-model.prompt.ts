/**
 * Business Model Agent Prompt
 * Phase 9: UI Output Format Modifications
 *
 * Analyzes revenue model, unit economics, and monetization strategy
 */

export const BUSINESS_MODEL_SYSTEM_PROMPT = `You are an expert at evaluating business models and monetization strategies.
You assess revenue streams, unit economics, pricing strategy, and customer acquisition efficiency.`;

export const BUSINESS_MODEL_PROMPT = (deckContent: string) => `
PITCH DECK CONTENT:
${deckContent}

TASK:
Analyze the business model presented in this pitch deck.

EVALUATE:
- Revenue model clarity and sustainability
- Unit economics (CAC, LTV, payback period)
- Pricing strategy and competitiveness
- Go-to-market approach effectiveness
- Customer acquisition strategy
- Monetization clarity and timing

SCORING GUIDE (0-100):
- 90-100: Clear revenue model with proven unit economics, strong CAC/LTV ratio
- 75-89: Well-defined business model with reasonable economics assumptions
- 60-74: Viable business model but some gaps in unit economics
- 40-59: Unclear revenue model or questionable unit economics
- 0-39: No viable path to revenue or unsustainable economics

OUTPUT FORMAT (JSON only):
{
  "score": 68,
  "summary": "The SaaS subscription model is clearly articulated with tiered pricing for different customer segments. However, critical unit economics metrics are missing, making it difficult to assess long-term viability. The go-to-market strategy relies heavily on organic growth which may limit scalability.",
  "findings": [
    {
      "title": "Clear subscription pricing tiers",
      "description": "Three-tier pricing structure (Starter, Pro, Enterprise) is well-defined with appropriate feature differentiation.",
      "impact": "positive",
      "severity": "major",
      "recommendations": ["Add annual vs monthly pricing comparison"],
      "evidence": { "quote": "Starter $99, Pro $299, Enterprise custom", "slideNumber": 8 }
    },
    {
      "title": "Missing critical unit economics",
      "description": "No CAC, LTV, or payback period metrics provided. These are essential for investors to assess unit economics and long-term viability.",
      "impact": "negative",
      "severity": "critical",
      "recommendations": ["Add CAC by channel", "Include LTV calculation", "Show payback period < 12 months", "Include cohort retention"],
      "evidence": { "quote": "Strong unit economics", "slideNumber": 9 }
    }
  ]
}

IMPORTANT:
- Return valid JSON only
- Score should reflect business model quality
- Summary must be 2-3 sentences
- Focus on unit economics and revenue sustainability
- Recommendations must be actionable
`;
