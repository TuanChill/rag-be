/**
 * Overall Assessment Agent Prompt
 * Phase 9: UI Output Format Modifications
 *
 * Synthesizes overall pitch deck quality and investment readiness
 */

export const OVERALL_ASSESSMENT_SYSTEM_PROMPT = `You are an expert at evaluating pitch deck quality and investment potential.
You assess narrative clarity, value proposition communication, and overall investment readiness.`;

export const OVERALL_ASSESSMENT_PROMPT = (deckContent: string) => `
PITCH DECK CONTENT:
${deckContent}

TASK:
Provide an overall assessment of this pitch deck. Evaluate:
- Narrative clarity and storytelling quality
- Value proposition communication effectiveness
- Investment readiness and completeness
- Overall deck quality and professionalism

OUTPUT REQUIREMENTS:

1. SCORE (0-100):
   - 90-100: Exceptional, investor-ready with minor polish needed
   - 75-89: Strong, clear value prop, minor improvements needed
   - 60-74: Good, some gaps in narrative or clarity
   - 40-59: Fair, significant improvements in storytelling needed
   - 0-39: Poor, major overhaul of narrative required

2. SUMMARY: Write 3-5 sentences covering:
   - Overall deck quality assessment
   - Key strengths that stand out
   - Critical areas requiring improvement
   - Investment readiness level (ready/nearly ready/not ready)

3. KEY FINDINGS (3-5 items total):
   For each finding provide:
   - title: 5-10 words, descriptive
   - description: 2-3 sentences explaining the finding
   - impact: "positive" for strengths, "negative" for weaknesses, "neutral" for observations
   - severity: "critical" for deal-breakers, "major" for significant issues, "minor" for improvements
   - recommendations: array of 1-3 specific actionable recommendations
   - evidence: quote from deck and slide number if applicable

RESPONSE FORMAT (JSON only, no markdown):
{
  "score": 72,
  "summary": "This pitch deck demonstrates a clear value proposition with strong technical expertise. The narrative effectively communicates the market opportunity, though the business model section requires more detail on unit economics. Overall, the deck shows promise but needs refinement on financial projections before investor meetings.",
  "findings": [
    {
      "title": "Clear and compelling value proposition",
      "description": "The opening slides effectively communicate what the company does and why it matters. The problem-solution fit is well-articulated.",
      "impact": "positive",
      "severity": "major",
      "recommendations": ["Maintain this clarity throughout the deck", "Consider adding customer testimonials"],
      "evidence": { "quote": "We enable enterprises to...", "slideNumber": 3 }
    },
    {
      "title": "Insufficient detail on unit economics",
      "description": "The business model section lacks specific metrics on CAC, LTV, and payback period that investors expect to see.",
      "impact": "negative",
      "severity": "major",
      "recommendations": ["Add CAC/LTV metrics", "Include payback period calculation", "Show cohort retention data"],
      "evidence": { "quote": "Strong revenue model", "slideNumber": 12 }
    }
  ]
}

IMPORTANT:
- Return valid JSON only
- Score should reflect overall deck quality
- Summary must be 3-5 sentences
- Findings should be balanced (mix of positive/negative)
- Recommendations must be actionable and specific
`;
