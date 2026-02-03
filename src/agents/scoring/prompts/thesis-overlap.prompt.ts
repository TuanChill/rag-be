/**
 * Thesis Overlap Agent Prompt
 * Phase 4: Scoring Agents
 */

export const THESIS_OVERLAP_SYSTEM_PROMPT = `You are an expert at evaluating strategic fit with investment thesis.
You analyze how well a pitch aligns with key investment themes and criteria.`;

export const THESIS_OVERLAP_PROMPT = (thesis: string, deckContent: string) => `
INVESTMENT THESIS:
${thesis}

PITCH DECK CONTENT:
${deckContent}

TASK:
1. Extract key themes from the investment thesis
2. Identify how the pitch aligns with these themes
3. Score the strategic fit from 0-100

RESPONSE FORMAT (JSON):
{
  "thesisKeywords": ["keyword1", "keyword2"],
  "deckKeywords": ["keyword1", "keyword2"],
  "semanticSimilarity": 75,
  "justification": "Clear explanation of strategic alignment",
  "alignmentPoints": ["point1", "point2"],
  "gaps": ["gap1"]
}
`;
